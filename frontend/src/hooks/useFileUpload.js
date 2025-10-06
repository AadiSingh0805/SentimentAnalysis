import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useFileUpload({ 
  accept = 'audio/*', 
  maxSize = 10 * 1024 * 1024, // 10MB 
  allowMultiple = false 
}) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  // Validate file type and size
  const validateFile = useCallback((file) => {
    const errors = []
    
    // Check file type
    if (accept === 'audio/*' && !file.type.startsWith('audio/')) {
      errors.push(`${file.name}: Invalid file type. Please upload an audio file.`)
    } else if (accept === 'image/*' && !file.type.startsWith('image/')) {
      errors.push(`${file.name}: Invalid file type. Please upload an image file.`)
    }
    
    // Check file size
    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      errors.push(`${file.name}: File too large. Maximum size is ${sizeMB}MB.`)
    }
    
    return errors
  }, [accept, maxSize])

  // Add files with validation
  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles)
    const validFiles = []
    const allErrors = []

    fileArray.forEach(file => {
      const errors = validateFile(file)
      if (errors.length > 0) {
        allErrors.push(...errors)
      } else {
        // Add preview URL for images
        if (file.type.startsWith('image/')) {
          file.preview = URL.createObjectURL(file)
        }
        validFiles.push(file)
      }
    })

    // Show errors
    allErrors.forEach(error => toast.error(error))

    // Add valid files
    if (validFiles.length > 0) {
      setFiles(prev => {
        const newFilesList = allowMultiple ? [...prev, ...validFiles] : validFiles
        toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added successfully`)
        return newFilesList
      })
    }
  }, [validateFile, allowMultiple])

  // Remove file
  const removeFile = useCallback((index) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const removedFile = newFiles[index]
      
      // Revoke object URL to free memory
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview)
      }
      
      newFiles.splice(index, 1)
      return newFiles
    })
    
    // Remove from upload progress
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[index]
      return newProgress
    })
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    // Revoke all object URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    
    setFiles([])
    setUploadProgress({})
    toast.success('All files cleared')
  }, [files])

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [addFiles])

  // File input change handler
  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
    
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [addFiles])

  // Simulate upload progress (replace with actual upload logic)
  const uploadFiles = useCallback(async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({
          ...prev,
          [i]: progress
        }))
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    toast.success('All files uploaded successfully!')
  }, [files])

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    files,
    isDragging,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    uploadFiles,
    formatFileSize
  }
}