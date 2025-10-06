// Emotion utility functions for the emotion recognition app

/**
 * Maps emotion abbreviation codes to full display names
 * @param {string} emotionCode - The emotion abbreviation code (e.g., 'FEA', 'HAP')
 * @returns {string} - The full emotion name (e.g., 'Fearful', 'Happy')
 */
export const getEmotionDisplayName = (emotionCode) => {
  const emotionMap = {
    'ANG': 'Angry',
    'CAL': 'Calm', 
    'DIS': 'Disgusted',
    'FEA': 'Fearful',
    'HAP': 'Happy',
    'NEU': 'Neutral',
    'SAD': 'Sad',
    'SUR': 'Surprised'
  }
  return emotionMap[emotionCode] || emotionCode
}

/**
 * Gets emotion-specific color styling for UI components
 * @param {string} emotionCode - The emotion abbreviation code
 * @returns {object} - CSS classes and colors for the emotion
 */
export const getEmotionStyling = (emotionCode) => {
  const stylingMap = {
    'ANG': {
      color: 'red',
      gradient: 'from-red-500 to-red-700',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    'CAL': {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    'DIS': {
      color: 'green',
      gradient: 'from-green-600 to-green-800',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    'FEA': {
      color: 'purple',
      gradient: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    'HAP': {
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-orange-700',
      borderColor: 'border-yellow-200'
    },
    'NEU': {
      color: 'gray',
      gradient: 'from-gray-500 to-gray-700',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    },
    'SAD': {
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-700',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200'
    },
    'SUR': {
      color: 'pink',
      gradient: 'from-pink-500 to-pink-700',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200'
    }
  }
  
  return stylingMap[emotionCode] || stylingMap['NEU']
}

/**
 * Gets a descriptive emoji for the emotion
 * @param {string} emotionCode - The emotion abbreviation code
 * @returns {string} - Emoji representation of the emotion
 */
export const getEmotionEmoji = (emotionCode) => {
  const emojiMap = {
    'ANG': '😠',
    'CAL': '😌',
    'DIS': '🤢',
    'FEA': '😨',
    'HAP': '😊',
    'NEU': '😐',
    'SAD': '😢',
    'SUR': '😲'
  }
  return emojiMap[emotionCode] || '😐'
}