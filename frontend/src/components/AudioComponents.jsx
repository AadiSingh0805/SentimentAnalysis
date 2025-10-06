import { useEffect, useRef, useState } from 'react'
import { Mic, Play, Pause } from 'lucide-react'

function AudioVisualizer({ isRecording, recordingTime, maxTime = 3 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)

  // Initialize audio context and analyser when recording starts
  useEffect(() => {
    if (isRecording && !audioContext) {
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
          const source = audioCtx.createMediaStreamSource(stream)
          const analyserNode = audioCtx.createAnalyser()
          
          analyserNode.fftSize = 256
          source.connect(analyserNode)
          
          setAudioContext(audioCtx)
          setAnalyser(analyserNode)
        } catch (err) {
          console.error('Error initializing audio context:', err)
        }
      }
      initAudio()
    }
  }, [isRecording, audioContext])

  // Draw waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isRecording) return

      analyser.getByteFrequencyData(dataArray)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, '#10b981')
        gradient.addColorStop(1, '#065f46')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        
        x += barWidth + 1
      }
      
      animationRef.current = requestAnimationFrame(draw)
    }

    if (isRecording) {
      draw()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording, analyser])

  // Draw static visualization when not recording
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isRecording) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw static bars
    const barCount = 20
    const barWidth = (canvas.width - (barCount - 1) * 2) / barCount
    
    for (let i = 0; i < barCount; i++) {
      const height = 20 + Math.random() * 10
      const x = i * (barWidth + 2)
      
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(x, canvas.height - height, barWidth, height)
    }
  }, [isRecording])

  // Progress bar
  const progress = (recordingTime / maxTime) * 100

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="space-y-4">
        {/* Waveform Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={80}
            className="w-full h-20 rounded border border-gray-300"
          />
          {isRecording && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>REC</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{recordingTime.toFixed(1)}s</span>
            <span>{maxTime}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isRecording ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          {isRecording ? (
            <p className="text-green-600 font-medium flex items-center justify-center">
              <Mic className="h-4 w-4 mr-2 animate-pulse" />
              Recording... Speak clearly into your microphone
            </p>
          ) : (
            <p className="text-gray-600">
              Ready to record • Click record button to start
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function AudioPlayerControls({ audioUrl, isPlaying, onPlay, className = "" }) {
  if (!audioUrl) return null

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={onPlay}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-1" />
          )}
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">
            Recorded Audio
          </p>
          <p className="text-xs text-blue-600">
            {isPlaying ? 'Playing...' : 'Ready to play'}
          </p>
        </div>
        <div className="text-xs text-blue-600">
          3.0s
        </div>
      </div>
    </div>
  )
}

export { AudioVisualizer, AudioPlayerControls }