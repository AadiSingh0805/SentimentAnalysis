import { useState, useRef } from 'react'
import { Image, Upload, Camera, Settings, BarChart3 } from 'lucide-react'
import { useFileUpload } from '../hooks/useFileUpload'
import { 
  ImagePreview, 
  ImageDropZone, 
  BatchAnalysisControls, 
  CameraCapture 
} from '../components/ImageComponents'
import { emotionAPI } from '../utils/api'
import toast from 'react-hot-toast'

function ImageAnalysis() {
  const {
    files: selectedImages,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    formatFileSize
  } = useFileUpload({ 
    accept: 'image/*', 
    maxSize: 5 * 1024 * 1024, // 5MB
    allowMultiple: true 
  })

  const fileInputRef = useRef(null)
  const [selectedSource, setSelectedSource] = useState('upload') // 'upload' or 'camera'
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState({})
  const [isCapturing, setIsCapturing] = useState(false)
  const [analysisOptions, setAnalysisOptions] = useState({
    batchMode: true,
    showConfidence: true,
    highlightFaces: true
  })

  // Mock emotions for demo purposes
  const mockEmotions = ['happy', 'sad', 'angry', 'neutral', 'surprise', 'fear', 'disgust']

  const simulateAnalysis = async (file) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Mock analysis result
    const emotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)]
    const confidence = Math.floor(Math.random() * 30 + 70) // 70-100%
    
    return { emotion, confidence }
  }

  const handleAnalyzeSingle = async (file) => {
    const fileIndex = selectedImages.indexOf(file)
    if (fileIndex === -1) return

    setIsAnalyzing(true)
    try {
      toast.loading(`Analyzing ${file.name}...`, { id: `image-${fileIndex}` })
      
      const result = await emotionAPI.analyzeImage(file)
      
      setAnalysisResults(prev => ({
        ...prev,
        [fileIndex]: {
          emotion: result.emotion,
          confidence: result.confidence
        }
      }))
      
      toast.success(
        `Analysis complete: ${result.emotion} (${result.confidence}%)`,
        { id: `image-${fileIndex}` }
      )
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.', { id: `image-${fileIndex}` })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyzeAll = async () => {
    if (selectedImages.length === 0) return

    setIsAnalyzing(true)

    try {
      // Get images that haven't been analyzed yet
      const unanalyzedImages = selectedImages.filter((_, index) => !analysisResults[index])
      
      if (unanalyzedImages.length === 0) {
        toast.info('All images have already been analyzed')
        return
      }

      toast.loading(`Analyzing ${unanalyzedImages.length} images...`, { id: 'batch-analysis' })
      
      // Use batch API for multiple images
      const batchResult = await emotionAPI.analyzeBatchImages(unanalyzedImages)
      
      // Process batch results
      const newResults = { ...analysisResults }
      let successCount = 0
      
      batchResult.results.forEach((result, batchIndex) => {
        // Find the original index in selectedImages
        const originalIndex = selectedImages.findIndex(img => img.name === result.filename)
        
        if (originalIndex !== -1 && result.success) {
          newResults[originalIndex] = {
            emotion: result.emotion,
            confidence: result.confidence
          }
          successCount++
        }
      })
      
      setAnalysisResults(newResults)
      
      toast.success(
        `Batch analysis complete: ${successCount}/${unanalyzedImages.length} successful`,
        { id: 'batch-analysis' }
      )
      
    } catch (err) {
      toast.error(err.message || 'Batch analysis failed. Please try again.', { id: 'batch-analysis' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCameraCapture = (capturedFile) => {
    // Directly add the captured file using the addFiles function
    addFiles([capturedFile])
    setIsCapturing(false)
    toast.success('Photo captured successfully!')
  }

  const handleRemoveImage = (index) => {
    // Remove from results when image is removed
    setAnalysisResults(prev => {
      const newResults = { ...prev }
      delete newResults[index]
      
      // Reindex remaining results
      const reindexed = {}
      Object.keys(newResults).forEach(key => {
        const oldIndex = parseInt(key)
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newResults[key]
        } else {
          reindexed[key] = newResults[key]
        }
      })
      
      return reindexed
    })
    
    removeFile(index)
  }

  const handleClearAll = () => {
    setAnalysisResults({})
    clearFiles()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Image Emotion Analysis</h1>
        <p className="text-lg text-gray-600">
          Upload images or use your camera to detect emotions from facial expressions
        </p>
      </div>

      {/* Source Selection Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setSelectedSource('upload')
              setIsCapturing(false)
            }}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              selectedSource === 'upload'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload Images
          </button>
          <button
            onClick={() => setSelectedSource('camera')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              selectedSource === 'camera'
                ? 'bg-white text-gray-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="h-4 w-4 inline mr-2" />
            Camera Capture
          </button>
        </div>
      </div>

      {/* Content based on selected source */}
      {selectedSource === 'upload' ? (
        /* Upload Section */
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Image className="h-5 w-5 mr-2 text-purple-600" />
            Upload Images
          </h2>

          <div className="space-y-6">
            {/* Upload Area */}
            <ImageDropZone
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              isUploading={false}
            />

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        /* Camera Section */
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-gray-600" />
            Camera Capture
          </h2>

          <CameraCapture
            onCapture={handleCameraCapture}
            isCapturing={isCapturing}
            onToggleCamera={() => setIsCapturing(!isCapturing)}
          />
        </div>
      )}

      {/* Analysis Options */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-gray-600" />
          Analysis Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="batch-mode"
              checked={analysisOptions.batchMode}
              onChange={(e) => setAnalysisOptions(prev => ({ ...prev, batchMode: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="batch-mode" className="text-gray-700 text-sm">
              Batch processing for multiple images
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="show-confidence"
              checked={analysisOptions.showConfidence}
              onChange={(e) => setAnalysisOptions(prev => ({ ...prev, showConfidence: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="show-confidence" className="text-gray-700 text-sm">
              Show detailed confidence scores
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="highlight-faces"
              checked={analysisOptions.highlightFaces}
              onChange={(e) => setAnalysisOptions(prev => ({ ...prev, highlightFaces: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="highlight-faces" className="text-gray-700 text-sm">
              Highlight detected faces in results
            </label>
          </div>
        </div>
      </div>

      {/* Batch Analysis Controls */}
      {selectedImages.length > 0 && (
        <BatchAnalysisControls
          selectedImages={selectedImages}
          onAnalyzeAll={handleAnalyzeAll}
          onClearAll={handleClearAll}
          isAnalyzing={isAnalyzing}
          analysisResults={analysisResults}
        />
      )}

      {/* Selected Images Grid */}
      {selectedImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Images ({selectedImages.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedImages.map((file, index) => (
              <ImagePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => handleRemoveImage(index)}
                onAnalyze={handleAnalyzeSingle}
                isAnalyzing={isAnalyzing}
                results={analysisResults[index]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {Object.keys(analysisResults).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Analysis Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockEmotions.map(emotion => {
              const count = Object.values(analysisResults).filter(r => r.emotion === emotion).length
              const percentage = selectedImages.length > 0 ? (count / selectedImages.length * 100).toFixed(1) : 0
              
              return (
                <div key={emotion} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{emotion}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Placeholder for detailed results */}
      {selectedImages.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 opacity-50">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h3>
          <p className="text-gray-500">Upload images or capture photos to see analysis results here...</p>
        </div>
      )}
    </div>
  )
}

export default ImageAnalysis