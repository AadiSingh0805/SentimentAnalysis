import { Link } from 'react-router-dom'
import { Mic, Image, Brain, Zap, Shield, BarChart3 } from 'lucide-react'

function FeatureCard({ icon: Icon, title, description, to, color, gradient }) {
  return (
    <Link to={to} className="group">
      <div className="card-elevated group-hover:transform group-hover:scale-105 p-8 transition-all duration-300">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${gradient} mb-6 group-hover:shadow-lg transition-all duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        <div className={`inline-flex items-center text-${color}-600 font-semibold group-hover:text-${color}-700 transition-all duration-300`}>
          Get Started
          <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="card-elevated p-6 group hover:scale-105 transition-all duration-300">
      <div className="flex items-center">
        <div className={`bg-gradient-to-br from-${color}-100 to-${color}-200 p-4 rounded-2xl group-hover:shadow-lg transition-all duration-300`}>
          <Icon className={`h-7 w-7 text-${color}-600`} />
        </div>
        <div className="ml-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">{value}</div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</div>
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const features = [
    {
      icon: Mic,
      title: "Audio Emotion Recognition",
      description: "Analyze emotions from speech using advanced deep learning. Record your voice or upload audio files.",
      to: "/audio",
      color: "green",
      gradient: "bg-gradient-to-r from-green-500 to-emerald-600"
    },
    {
      icon: Image,
      title: "Visual Emotion Detection",
      description: "Detect emotions from facial expressions in images using computer vision technology.",
      to: "/image",
      color: "purple",
      gradient: "bg-gradient-to-r from-purple-500 to-violet-600"
    },
    {
      icon: Brain,
      title: "Multi-Modal Analysis",
      description: "Combine audio and visual analysis for comprehensive emotion recognition and validation.",
      to: "/multimodal",
      color: "orange",
      gradient: "bg-gradient-to-r from-orange-500 to-red-600"
    }
  ]

  const stats = [
    { icon: BarChart3, value: "8", label: "Emotion Classes", color: "blue" },
    { icon: Zap, value: "85%+", label: "Accuracy", color: "green" },
    { icon: Shield, value: "Real-time", label: "Processing", color: "purple" }
  ]

  return (
    <div className="space-y-16 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="inline-flex items-center glass px-6 py-3 rounded-full text-blue-700 font-medium border border-blue-200 animate-scaleIn">
          <Zap className="h-5 w-5 mr-2 animate-pulse-soft" />
          AI-Powered Emotion Recognition
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight animate-slideUp">
          Understand Emotions with
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient"> AI</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-slideUp">
          Advanced machine learning models that analyze audio and visual cues to detect human emotions 
          with high accuracy. Perfect for research, applications, and understanding human behavior.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slideUp">
          <Link 
            to="/audio" 
            className="btn-gradient text-white px-10 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Mic className="h-6 w-6 mr-3" />
            Try Audio Analysis
          </Link>
          <Link 
            to="/image" 
            className="glass text-gray-900 px-10 py-4 rounded-2xl font-semibold text-lg border border-white/30 hover:bg-white/40 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            <Image className="h-6 w-6 mr-3" />
            Try Image Analysis
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slideUp">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Features Section */}
      <div className="space-y-12 animate-slideUp">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Choose Your Analysis Method
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Select the type of emotion analysis that fits your needs. Each method uses 
            state-of-the-art AI models trained on diverse datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="glass rounded-3xl p-12 border border-white/30 shadow-2xl animate-slideUp">
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-gray-900">
            How It Works
          </h3>
          <p className="text-gray-600 max-w-5xl mx-auto text-lg leading-relaxed">
            Our emotion recognition system uses deep learning models trained on large datasets. 
            For audio, we extract MFCC features and use CNN networks. For images, we leverage 
            pre-trained facial emotion recognition models. All processing happens in real-time 
            with confidence scores for each prediction.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <span className="glass px-6 py-3 rounded-full font-semibold text-gray-700 border border-white/30 hover:scale-105 transition-transform duration-300">
              Deep Learning
            </span>
            <span className="glass px-6 py-3 rounded-full font-semibold text-gray-700 border border-white/30 hover:scale-105 transition-transform duration-300">
              Real-time Processing
            </span>
            <span className="glass px-6 py-3 rounded-full font-semibold text-gray-700 border border-white/30 hover:scale-105 transition-transform duration-300">
              High Accuracy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage