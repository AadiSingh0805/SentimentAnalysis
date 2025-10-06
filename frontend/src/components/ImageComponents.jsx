import { useState, useRef, useEffect } from 'react'
import { Eye, Trash2, Download, RotateCcw, ZoomIn, X } from 'lucide-react'

function ImagePreview({ file, onRemove, onAnalyze, isAnalyzing, results }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <div className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="aspect-square relative">
          <img 
            src={file.preview} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                title="View full size"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={onRemove}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Analysis status indicator */}
          {results && (
            <div className="absolute top-2 right-2">
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ✓ Analyzed
              </div>
            </div>
          )}
        </div>
        
        {/* Image info */}
        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate text-sm" title={file.name}>
            {file.name}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {results && (
              <span className="text-xs font-medium text-green-600">
                {results.emotion} ({results.confidence}%)
              </span>
            )}
          </div>
        </div>

        {/* Analysis button */}
        <div className="p-3 pt-0">
          <button
            onClick={() => onAnalyze(file)}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block mr-1"></div>
                Analyzing...
              </>
            ) : results ? (
              'Analyze Again'
            ) : (
              'Analyze Emotion'
            )}
          </button>
        </div>
      </div>

      {/* Full-size modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img 
              src={file.preview} 
              alt={file.name}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ImageDropZone({ onDrop, onFileSelect, isDragging, fileInputRef, isUploading }) {
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
        isDragging 
          ? 'border-purple-400 bg-purple-50' 
          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
      } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <div className="space-y-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          ) : (
            <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-gray-600 mb-2">
            {isUploading ? 'Processing images...' : 
             isDragging ? 'Drop your images here' : 
             'Drag and drop your images here'}
          </p>
          {!isUploading && <p className="text-sm text-gray-500">or click to browse</p>}
        </div>
        <p className="text-xs text-gray-400">
          Supports: JPG, PNG, GIF, WebP • Max size: 5MB per image
        </p>
      </div>
    </div>
  )
}

function BatchAnalysisControls({ 
  selectedImages, 
  onAnalyzeAll, 
  onClearAll, 
  isAnalyzing, 
  analysisResults 
}) {
  const analyzedCount = Object.keys(analysisResults).length
  const totalCount = selectedImages.length

  if (totalCount === 0) return null

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-purple-900">
            Batch Analysis ({analyzedCount}/{totalCount} analyzed)
          </h3>
          <p className="text-sm text-purple-700">
            {isAnalyzing ? 'Analyzing images...' : 
             analyzedCount === totalCount ? 'All images analyzed!' :
             'Analyze all images for emotion detection'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onAnalyzeAll}
            disabled={isAnalyzing || analyzedCount === totalCount}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block mr-1"></div>
                Analyzing...
              </>
            ) : analyzedCount === totalCount ? (
              'All Analyzed'
            ) : (
              `Analyze All (${totalCount - analyzedCount})`
            )}
          </button>
          <button
            onClick={onClearAll}
            disabled={isAnalyzing}
            className="bg-white hover:bg-gray-50 text-purple-600 border border-purple-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(analyzedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

function CameraCapture({ onCapture, isCapturing, onToggleCamera }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch (err) {
      setError('Camera access denied or not available')
      console.error('Error accessing camera:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  // Auto start/stop camera based on isCapturing prop
  useEffect(() => {
    if (isCapturing && !stream) {
      startCamera()
    } else if (!isCapturing && stream) {
      stopCamera()
    }
  }, [isCapturing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video && canvas) {
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        file.preview = URL.createObjectURL(blob)
        onCapture(file)
      }, 'image/jpeg', 0.9)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Camera Capture</h3>
        <button
          onClick={onToggleCamera}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isCapturing
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isCapturing ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-80 max-w-full rounded-lg border border-gray-300 mx-auto block"
              style={{ maxHeight: '240px' }}
            />
            <button
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export { ImagePreview, ImageDropZone, BatchAnalysisControls, CameraCapture }