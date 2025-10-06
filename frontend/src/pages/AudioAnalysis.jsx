import { useState, useRef } from 'react'
import { Mic, Upload, Play, Square, RotateCcw, Trash2, Download, BarChart3 } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useFileUpload } from '../hooks/useFileUpload'
import { AudioVisualizer, AudioPlayerControls } from '../components/AudioComponents'
import { emotionAPI } from '../utils/api'
import { getEmotionDisplayName, getEmotionEmoji } from '../utils/emotions'
import toast from 'react-hot-toast'

function AudioAnalysis() {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    isPlaying,
    error,
    audioPlayerRef,
    startRecording,
    stopRecording,
    playAudio,
    resetRecording
  } = useAudioRecorder()

  const {
    files,
    isDragging,
    removeFile,
    clearFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    formatFileSize
  } = useFileUpload({ 
    accept: 'audio/*', 
    maxSize: 10 * 1024 * 1024 
  })

  const fileInputRef = useRef(null)
  const [selectedSource, setSelectedSource] = useState('recording') // 'recording' or 'upload'
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleAnalyze = async () => {
    if (!audioBlob && files.length === 0) {
      toast.error('Please record audio or upload a file first')
      return
    }

    setIsAnalyzing(true)
    
    try {
      let result
      
      if (selectedSource === 'recording' && audioBlob) {
        // Analyze recorded audio
        toast.loading('Analyzing recorded audio...', { id: 'audio-analysis' })
        result = await emotionAPI.analyzeAudio(audioBlob, 'recording.webm')
      } else if (selectedSource === 'upload' && files.length > 0) {
        // Analyze uploaded file
        toast.loading('Analyzing uploaded audio...', { id: 'audio-analysis' })
        result = await emotionAPI.analyzeAudio(files[0], files[0].name)
      } else {
        toast.error('No audio source available for analysis')
        return
      }

      toast.success(
        `Analysis complete: ${getEmotionDisplayName(result.emotion)} (${result.confidence}% confidence)`,
        { id: 'audio-analysis' }
      )

      // Store result for display
      setAnalysisResult(result)
      console.log('Audio analysis result:', result)
      
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.', { id: 'audio-analysis' })
      console.error('Audio analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadRecording = () => {
    if (!audioBlob) return
    
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recording-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Recording downloaded!')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4 animate-slideUp">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Audio Emotion Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Record your voice or upload an audio file to analyze emotions in speech
        </p>
      </div>

      {/* Source Selection Tabs */}
      <div className="flex justify-center animate-scaleIn">
        <div className="glass p-2 rounded-2xl border border-white/30">
          <button
            onClick={() => setSelectedSource('recording')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedSource === 'recording'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Mic className="h-5 w-5 inline mr-2" />
            Record Audio
          </button>
          <button
            onClick={() => setSelectedSource('upload')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              selectedSource === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Upload className="h-5 w-5 inline mr-2" />
            Upload File
          </button>
        </div>
      </div>

      {/* Content based on selected source */}
      {selectedSource === 'recording' ? (
        /* Recording Section */
        <div className="card-elevated p-8 animate-slideUp">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Mic className="h-6 w-6 mr-3 text-green-600" />
            Record Audio
          </h2>
          
          <div className="space-y-6">
            {/* Audio Visualizer */}
            <AudioVisualizer 
              isRecording={isRecording} 
              recordingTime={recordingTime}
              maxTime={3}
            />

            {/* Recording Controls */}
            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <>
                  <button
                    onClick={startRecording}
                    disabled={error}
                    className="btn-gradient disabled:bg-gray-400 text-white px-8 py-4 rounded-2xl font-semibold flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Mic className="h-5 w-5" />
                    <span>Start Recording</span>
                  </button>
                  
                  {(audioBlob || recordingTime > 0) && (
                    <button
                      onClick={resetRecording}
                      className="glass px-8 py-4 rounded-2xl font-semibold border border-white/30 text-gray-700 hover:bg-white/50 flex items-center space-x-3 transition-all duration-300"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span>Reset</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse-soft"
                >
                  <Square className="h-5 w-5" />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Audio Player Controls */}
            {audioUrl && (
              <div className="space-y-4">
                <AudioPlayerControls 
                  audioUrl={audioUrl}
                  isPlaying={isPlaying}
                  onPlay={playAudio}
                />
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={downloadRecording}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>

                {/* Hidden audio element */}
                <audio ref={audioPlayerRef} src={audioUrl} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Upload Section */
        <div className="card-elevated p-8 animate-slideUp">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Upload className="h-6 w-6 mr-3 text-blue-600" />
            Upload Audio File
          </h2>
          
          <div className="space-y-6">
            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 mb-2">
                    {isDragging ? 'Drop your audio file here' : 'Drag and drop your audio file here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
                <p className="text-xs text-gray-400">
                  Supports: WAV, MP3, OGG, M4A • Max size: 10MB
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Selected Files</h3>
                  <button
                    onClick={clearFiles}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <div className="text-center animate-scaleIn">
        <button 
          onClick={handleAnalyze}
          disabled={(!audioBlob && files.length === 0) || isAnalyzing}
          className="btn-gradient disabled:from-gray-400 disabled:to-gray-400 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl"
        >
          {isAnalyzing ? (
            <>
              <div className="spinner h-6 w-6 inline-block mr-3"></div>
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="h-6 w-6 inline mr-3" />
              Analyze Audio Emotion
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {analysisResult ? (
        <div className="card-elevated p-8 animate-scaleIn">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-green-600" />
            Analysis Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Emotion */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center border border-green-200 hover:scale-105 transition-transform duration-300">
              <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Detected Emotion</h4>
              <div className="text-5xl mb-4">{getEmotionEmoji(analysisResult.emotion)}</div>
              <p className="text-4xl font-bold text-gray-900 capitalize mb-3">
                {getEmotionDisplayName(analysisResult.emotion)}
              </p>
              <div className="text-lg text-gray-600">
                <span className="font-bold text-green-600">{analysisResult.confidence}%</span> confidence
              </div>
            </div>

            {/* Model Info */}
            <div className="glass rounded-2xl p-8 border border-white/30">
              <h4 className="text-sm font-semibold text-gray-600 mb-6 uppercase tracking-wide">Analysis Details</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Model:</span>
                  <span className="font-bold text-gray-900">
                    {analysisResult.model_type === 'audio_cnn' ? 'Audio CNN' : analysisResult.model_type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">File:</span>
                  <span className="font-bold text-gray-900 truncate max-w-32" title={analysisResult.filename}>
                    {analysisResult.filename}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className="font-bold text-green-600">
                    {analysisResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Visualization */}
            <div className="card-elevated p-8">
              <h4 className="text-sm font-semibold text-gray-600 mb-6 uppercase tracking-wide">Confidence Score</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Certainty</span>
                  <span className="font-bold text-gray-900">{analysisResult.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="progress-bar h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(analysisResult.confidence, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {analysisResult.confidence >= 70 ? '🎯 High confidence' : 
                   analysisResult.confidence >= 50 ? '🎲 Medium confidence' : '⚠️ Low confidence'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-6">
            <button
              onClick={() => setAnalysisResult(null)}
              className="glass px-6 py-3 rounded-2xl font-semibold text-gray-700 border border-white/30 hover:bg-white/50 transition-all duration-300"
            >
              Clear Results
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="btn-gradient px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Analyze Again
            </button>
          </div>
        </div>
      ) : (
        <div className="card-elevated p-8 opacity-60 animate-pulse">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h3>
          <p className="text-gray-500 text-lg">Results will appear here after analysis...</p>
        </div>
      )}
    </div>
  )
}

export default AudioAnalysis