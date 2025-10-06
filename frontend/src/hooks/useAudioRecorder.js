import { useState, useRef, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const audioPlayerRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  // Request microphone permission and initialize recorder
  const initializeRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        chunksRef.current = []
        
        // Stop all media tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      setError(null)
      return true
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Microphone access denied or not available')
      toast.error('Please allow microphone access to record audio')
      return false
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecording) return

    const initialized = await initializeRecorder()
    if (!initialized) return

    setRecordingTime(0)
    setAudioBlob(null)
    setAudioUrl(null)
    setIsRecording(true)
    
    mediaRecorderRef.current.start(100) // Collect data every 100ms
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 0.1
        // Auto-stop at 3 seconds
        if (newTime >= 3.0) {
          stopRecording()
          return 3.0
        }
        return newTime
      })
    }, 100)
    
    toast.success('Recording started!')
  }, [isRecording])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return

    setIsRecording(false)
    clearInterval(timerRef.current)
    
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    toast.success('Recording completed!')
  }, [isRecording])

  // Play recorded audio
  const playAudio = useCallback(() => {
    if (!audioUrl || !audioPlayerRef.current) return

    if (isPlaying) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    } else {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }, [audioUrl, isPlaying])

  // Reset recording
  const resetRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    }
    
    setRecordingTime(0)
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setError(null)
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }
  }, [isRecording, stopRecording])

  // Audio player event handlers
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current
    if (!audioPlayer) return

    const handleEnded = () => setIsPlaying(false)
    const handlePause = () => setIsPlaying(false)
    
    audioPlayer.addEventListener('ended', handleEnded)
    audioPlayer.addEventListener('pause', handlePause)
    
    return () => {
      audioPlayer.removeEventListener('ended', handleEnded)
      audioPlayer.removeEventListener('pause', handlePause)
    }
  }, [audioUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return {
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
  }
}