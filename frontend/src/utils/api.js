import axios from 'axios'
import toast from 'react-hot-toast'

// API base URL
const API_BASE_URL = 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.code === 'ECONNREFUSED') {
      toast.error('Backend server is not running. Please start the backend.')
    } else if (error.response?.status === 422) {
      toast.error(error.response.data.detail || 'Invalid input data')
    } else if (error.response?.status === 500) {
      toast.error(error.response.data.detail || 'Server error occurred')
    } else if (error.response?.status === 503) {
      toast.error(error.response.data.detail || 'Service unavailable')
    } else {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

// API functions
export const emotionAPI = {
  // Test server connection
  async ping() {
    try {
      const response = await api.get('/')
      return response.data
    } catch (error) {
      throw new Error('Backend server is not responding')
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      throw new Error('Health check failed')
    }
  },

  // Analyze audio emotion
  async analyzeAudio(audioBlob, filename = 'recording.webm') {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, filename)

      const response = await api.post('/analyze/audio', formData)
      return response.data
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('Audio analysis failed')
    }
  },

  // Analyze single image emotion
  async analyzeImage(imageFile) {
    try {
      const formData = new FormData()
      formData.append('file', imageFile, imageFile.name)

      const response = await api.post('/analyze/image', formData)
      return response.data
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('Image analysis failed')
    }
  },

  // Analyze multiple images (batch)
  async analyzeBatchImages(imageFiles) {
    try {
      const formData = new FormData()
      imageFiles.forEach((file) => {
        formData.append('files', file, file.name)
      })

      const response = await api.post('/analyze/batch-images', formData)
      return response.data
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('Batch image analysis failed')
    }
  }
}

// Utility functions
export const apiUtils = {
  // Check if backend is running
  async isBackendRunning() {
    try {
      await emotionAPI.ping()
      return true
    } catch {
      return false
    }
  },

  // Get server status
  async getServerStatus() {
    try {
      const [pingResult, healthResult] = await Promise.all([
        emotionAPI.ping(),
        emotionAPI.healthCheck()
      ])
      
      return {
        running: true,
        ping: pingResult,
        health: healthResult
      }
    } catch (error) {
      return {
        running: false,
        error: error.message
      }
    }
  },

  // Format emotion result for display
  formatEmotionResult(result) {
    if (!result || !result.emotion) return null
    
    return {
      emotion: result.emotion.toUpperCase(),
      confidence: Math.round(result.confidence),
      modelType: result.model_type || 'unknown',
      filename: result.filename || 'unknown'
    }
  },

  // Convert audio blob to appropriate format
  async convertAudioBlob(audioBlob) {
    // For now, we'll send the blob as-is
    // In a production app, you might want to convert to a specific format
    return audioBlob
  }
}

export default api