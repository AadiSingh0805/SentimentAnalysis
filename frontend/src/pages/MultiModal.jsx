import { useState, useRef, useEffect } from 'react'
import { Brain, Mic, Image, BarChart3, Zap, CheckCircle2, Upload, Camera, Play, Square } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useFileUpload } from '../hooks/useFileUpload'
import { AudioVisualizer } from '../components/AudioComponents'
import { emotionAPI } from '../utils/api'
import { getEmotionDisplayName, getEmotionEmoji, getEmotionStyling } from '../utils/emotions'
import toast from 'react-hot-toast'

function MultiModal() {
  const [audioAnalysis, setAudioAnalysis] = useState(null)
  const [imageAnalysis, setImageAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  
  // Audio recording hooks
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    isPlaying,
    error: audioError,
    audioPlayerRef,
    startRecording,
    stopRecording,
    playAudio,
    resetRecording
  } = useAudioRecorder()

  // File upload hooks for audio
  const {
    files: audioFiles,
    isDragging: audioIsDragging,
    removeFile: removeAudioFile,
    clearFiles: clearAudioFiles,
    handleDragOver: audioHandleDragOver,
    handleDragLeave: audioHandleDragLeave,
    handleDrop: audioHandleDrop,
    handleFileSelect: audioHandleFileSelect,
    formatFileSize: audioFormatFileSize
  } = useFileUpload({ 
    accept: 'audio/*', 
    maxSize: 10 * 1024 * 1024 
  })

  // File upload hooks for images  
  const {
    files: imageFiles,
    isDragging: imageIsDragging,
    removeFile: removeImageFile,
    clearFiles: clearImageFiles,
    handleDragOver: imageHandleDragOver,
    handleDragLeave: imageHandleDragLeave,
    handleDrop: imageHandleDrop,
    handleFileSelect: imageHandleFileSelect,
    formatFileSize: imageFormatFileSize
  } = useFileUpload({ 
    accept: 'image/*', 
    maxSize: 5 * 1024 * 1024 
  })

  const audioFileInputRef = useRef(null)
  const imageFileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Audio Analysis
  const handleAudioAnalysis = async () => {
    if (!audioBlob && audioFiles.length === 0) {
      toast.error('Please record audio or upload an audio file first')
      return
    }

    setIsAnalyzing(true)
    
    try {
      let result
      
      if (audioBlob) {
        toast.loading('Analyzing recorded audio...', { id: 'audio-analysis' })
        result = await emotionAPI.analyzeAudio(audioBlob, 'recording.webm')
      } else if (audioFiles.length > 0) {
        toast.loading('Analyzing uploaded audio...', { id: 'audio-analysis' })
        result = await emotionAPI.analyzeAudio(audioFiles[0], audioFiles[0].name)
      }

      toast.success(
        `Audio analysis complete: ${getEmotionDisplayName(result.emotion)}`,
        { id: 'audio-analysis' }
      )

      setAudioAnalysis(result)
      
    } catch (err) {
      toast.error(err.message || 'Audio analysis failed. Please try again.', { id: 'audio-analysis' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Image Analysis
  const handleImageAnalysis = async () => {
    if (!selectedImageFile && imageFiles.length === 0) {
      toast.error('Please capture or upload an image first')
      return
    }

    setIsAnalyzing(true)
    
    try {
      let result
      
      if (selectedImageFile) {
        toast.loading('Analyzing captured image...', { id: 'image-analysis' })
        result = await emotionAPI.analyzeImage(selectedImageFile, 'captured_image.jpg')
      } else if (imageFiles.length > 0) {
        toast.loading('Analyzing uploaded image...', { id: 'image-analysis' })
        result = await emotionAPI.analyzeImage(imageFiles[0], imageFiles[0].name)
      }

      toast.success(
        `Image analysis complete: ${result.emotion}`,
        { id: 'image-analysis' }
      )

      setImageAnalysis(result)
      
    } catch (err) {
      toast.error(err.message || 'Image analysis failed. Please try again.', { id: 'image-analysis' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Camera functionality
  const initializeCamera = async () => {
    if (!videoRef.current) return null
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      videoRef.current.srcObject = stream
      return stream
    } catch (err) {
      toast.error('Failed to access camera: ' + err.message)
      console.error('Camera error:', err)
      return null
    }
  }

  const startCamera = () => {
    setCameraActive(true)
  }

  // Initialize camera when cameraActive becomes true and video ref is available
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      initializeCamera().then((stream) => {
        if (stream) {
          toast.success('Camera started successfully!')
        } else {
          setCameraActive(false)
        }
      })
    }
  }, [cameraActive])

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' })
          setSelectedImageFile(file)
          setSelectedImage(URL.createObjectURL(blob))
          stopCamera()
          toast.success('Image captured successfully!')
        }
      }, 'image/jpeg', 0.8)
    }
  }

  // Multi-modal comparison
  const getEmotionAgreement = () => {
    if (!audioAnalysis || !imageAnalysis) return null
    
    const audioEmotion = audioAnalysis.emotion
    const imageEmotion = imageAnalysis.emotion
    const avgConfidence = ((audioAnalysis.confidence + imageAnalysis.confidence) / 2).toFixed(1)
    
    const agreement = audioEmotion === imageEmotion ? 'High' : 'Low'
    const combinedEmotion = audioEmotion === imageEmotion 
      ? audioEmotion 
      : audioAnalysis.confidence > imageAnalysis.confidence ? audioEmotion : imageEmotion
    
    return {
      agreement,
      combinedEmotion,
      avgConfidence,
      audioEmotion,
      imageEmotion
    }
  }

  const handleMultiModalAnalysis = async () => {
    if (!audioAnalysis || !imageAnalysis) {
      toast.error('Please complete both audio and image analysis first')
      return
    }
    
    setIsAnalyzing(true)
    toast.loading('Performing multi-modal analysis...', { id: 'multimodal' })
    
    // Simulate analysis processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const comparison = getEmotionAgreement()
    toast.success(
      `Multi-modal analysis complete! ${comparison.agreement} agreement detected.`,
      { id: 'multimodal' }
    )
    
    setIsAnalyzing(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-6 animate-slideUp">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Multi-Modal Emotion Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Combine audio and visual analysis for comprehensive emotion recognition
        </p>
        <div className="glass border border-blue-200 rounded-2xl p-6 mx-auto max-w-3xl">
          <p className="text-blue-800 font-medium leading-relaxed">
            <strong>How it works:</strong> Upload audio and images, analyze them separately, then compare results for deeper insights into emotional expression!
          </p>
        </div>
      </div>

      {/* Input Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slideUp">
        {/* Audio Input */}
        <div className="card-elevated p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Mic className="h-6 w-6 mr-3 text-green-600" />
              Audio Analysis
            </h2>
            {audioAnalysis && (
              <CheckCircle2 className="h-6 w-6 text-green-600 animate-pulse-soft" />
            )}
          </div>

          {audioAnalysis ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getEmotionEmoji(audioAnalysis.emotion)}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{getEmotionDisplayName(audioAnalysis.emotion)}</p>
                    <p className="text-green-700 font-medium">{audioAnalysis.confidence}% confidence</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAudioAnalysis(null)
                  resetRecording()
                  clearAudioFiles()
                }}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Reset Audio Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recording Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Record Audio</h3>
                
                {/* Audio Visualizer */}
                <AudioVisualizer 
                  isRecording={isRecording} 
                  recordingTime={recordingTime} 
                  maxTime={3}
                />
                
                <div className="flex items-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'btn-gradient text-white'
                    }`}
                  >
                    {isRecording ? <Square className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Or Upload Audio File</h3>
                <div 
                  className={`glass rounded-2xl p-6 text-center border-2 border-dashed transition-all duration-300 ${
                    audioIsDragging ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={audioHandleDragOver}
                  onDragLeave={audioHandleDragLeave}
                  onDrop={audioHandleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Drag audio file here or click to upload</p>
                  <button 
                    onClick={() => audioFileInputRef.current?.click()}
                    className="glass border border-white/30 text-gray-700 hover:bg-white/50 px-6 py-2 rounded-xl font-semibold transition-all duration-300"
                  >
                    Choose Audio File
                  </button>
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={audioHandleFileSelect}
                    className="hidden"
                  />
                </div>
                
                {audioFiles.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="font-medium text-green-800">{audioFiles[0].name}</p>
                    <p className="text-sm text-green-600">{audioFormatFileSize(audioFiles[0].size)}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleAudioAnalysis}
                disabled={!audioBlob && audioFiles.length === 0}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  (audioBlob || audioFiles.length > 0) && !isAnalyzing
                    ? 'btn-gradient text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? 'Analyzing Audio...' : 'Analyze Audio'}
              </button>
            </div>
          )}
        </div>

        {/* Image Input */}
        <div className="card-elevated p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Image className="h-6 w-6 mr-3 text-purple-600" />
              Image Analysis
            </h2>
            {imageAnalysis && (
              <CheckCircle2 className="h-6 w-6 text-green-600 animate-pulse-soft" />
            )}
          </div>

          {imageAnalysis ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">😊</div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{imageAnalysis.emotion}</p>
                    <p className="text-purple-700 font-medium">{imageAnalysis.confidence}% confidence</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setImageAnalysis(null)
                  setSelectedImage(null)
                  setSelectedImageFile(null)
                  clearImageFiles()
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Reset Image Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Camera Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Capture Image</h3>
                
                {cameraActive ? (
                  <div className="space-y-4">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      muted 
                      className="w-80 max-w-full rounded-lg bg-gray-100 mx-auto block"
                      style={{ maxHeight: '240px' }}
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={captureImage}
                        className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                      >
                        <Camera className="h-5 w-5 mr-2 inline" />
                        Capture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="glass border border-white/30 text-gray-700 hover:bg-white/50 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={startCamera}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full"
                  >
                    <Camera className="h-5 w-5 mr-2 inline" />
                    Start Camera
                  </button>
                )}

                {selectedImage && (
                  <div className="space-y-2">
                    <img 
                      src={selectedImage} 
                      alt="Captured" 
                      className="w-full rounded-lg max-h-60 object-cover"
                    />
                    <p className="text-sm text-gray-600 text-center">Captured image ready for analysis</p>
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Or Upload Image</h3>
                <div 
                  className={`glass rounded-2xl p-6 text-center border-2 border-dashed transition-all duration-300 ${
                    imageIsDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
                  }`}
                  onDragOver={imageHandleDragOver}
                  onDragLeave={imageHandleDragLeave}
                  onDrop={imageHandleDrop}
                >
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Drag image here or click to upload</p>
                  <button 
                    onClick={() => imageFileInputRef.current?.click()}
                    className="glass border border-white/30 text-gray-700 hover:bg-white/50 px-6 py-2 rounded-xl font-semibold transition-all duration-300"
                  >
                    Choose Image
                  </button>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={imageHandleFileSelect}
                    className="hidden"
                  />
                </div>
                
                {imageFiles.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="font-medium text-purple-800">{imageFiles[0].name}</p>
                    <p className="text-sm text-purple-600">{imageFormatFileSize(imageFiles[0].size)}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleImageAnalysis}
                disabled={!selectedImageFile && imageFiles.length === 0}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  (selectedImageFile || imageFiles.length > 0) && !isAnalyzing
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? 'Analyzing Image...' : 'Analyze Image'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Modal Analysis Button */}
      <div className="text-center animate-scaleIn">
        <button 
          onClick={handleMultiModalAnalysis}
          className={`px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl ${
            audioAnalysis && imageAnalysis && !isAnalyzing
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white hover:shadow-3xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!audioAnalysis || !imageAnalysis || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="spinner h-6 w-6 mr-3 inline-block"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-6 w-6 mr-3 inline" />
              Compare Multi-Modal Results
            </>
          )}
        </button>
      </div>

      {/* Results Comparison */}
      {audioAnalysis && imageAnalysis && (
        <div className="card-elevated p-8 animate-slideUp">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-orange-600" />
            Emotion Comparison
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Audio Results */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Mic className="h-4 w-4 mr-2 text-green-600" />
                Audio Analysis
              </h4>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getEmotionEmoji(audioAnalysis.emotion)}</span>
                  <p className="text-lg font-bold text-green-800">{getEmotionDisplayName(audioAnalysis.emotion)}</p>
                </div>
                <p className="text-sm text-green-600">Confidence: {audioAnalysis.confidence}%</p>
              </div>
            </div>

            {/* Image Results */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Image className="h-4 w-4 mr-2 text-purple-600" />
                Visual Analysis
              </h4>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">😊</span>
                  <p className="text-lg font-bold text-purple-800">{imageAnalysis.emotion}</p>
                </div>
                <p className="text-sm text-purple-600">Confidence: {imageAnalysis.confidence}%</p>
              </div>
            </div>

            {/* Combined Results */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-orange-600" />
                Combined Result
              </h4>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                {(() => {
                  const comparison = getEmotionAgreement()
                  return (
                    <>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getEmotionEmoji(comparison.combinedEmotion)}</span>
                        <p className="text-lg font-bold text-orange-800">{getEmotionDisplayName(comparison.combinedEmotion)}</p>
                      </div>
                      <p className="text-sm text-orange-600">
                        {comparison.agreement} Agreement ({comparison.avgConfidence}%)
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Analysis Insights */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Analysis Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const comparison = getEmotionAgreement()
                return (
                  <>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-900 mb-2">Modality Agreement</h5>
                      <p className="text-sm text-gray-600">
                        {comparison.agreement === 'High' 
                          ? 'Both audio and visual analysis agree on the same emotion, indicating high confidence in the result.'
                          : 'Audio and visual analysis detected different emotions. This could indicate mixed emotional expressions or context-dependent emotions.'
                        }
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-900 mb-2">Confidence Level</h5>
                      <p className="text-sm text-gray-600">
                        {comparison.avgConfidence >= 80 
                          ? 'Combined confidence score is above 80%, suggesting very reliable emotion detection across both modalities.'
                          : comparison.avgConfidence >= 60
                          ? 'Combined confidence score is moderate, suggesting reasonable emotion detection with some uncertainty.'
                          : 'Combined confidence score is below 60%, suggesting the results should be interpreted with caution.'
                        }
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Hidden elements for camera functionality */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
    </div>
  )
}

export default MultiModal