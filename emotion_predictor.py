import os
from deepface import DeepFace
import cv2
import numpy as np

def predict_emotion(image_path, return_all_scores=False):
    """
    Predict emotion from an image using DeepFace
    
    Args:
        image_path (str): Path to the image file
        return_all_scores (bool): If True, returns all emotion scores. If False, returns only the top emotion
    
    Returns:
        str or dict: If return_all_scores=False, returns the predicted emotion as string.
                    If return_all_scores=True, returns dict with all emotion scores.
    """
    try:
        # Analyze emotion using DeepFace
        result = DeepFace.analyze(
            img_path=image_path,
            actions=['emotion'],
            enforce_detection=False,  # Continue even if no face detected
            silent=True
        )
        
        # Extract emotion predictions
        if isinstance(result, list):
            emotions = result[0]['emotion']
        else:
            emotions = result['emotion']
        
        if return_all_scores:
            # Return all emotion scores
            return emotions
        else:
            # Return only the predicted emotion (highest probability)
            predicted_emotion = max(emotions, key=emotions.get)
            return predicted_emotion
            
    except Exception as e:
        print(f"❌ Error analyzing image: {str(e)}")
        return None

def predict_emotion_with_confidence(image_path):
    """
    Predict emotion with confidence score
    
    Args:
        image_path (str): Path to the image file
    
    Returns:
        tuple: (predicted_emotion, confidence_score) or (None, None) if error
    """
    try:
        # Get all emotion scores
        emotions = predict_emotion(image_path, return_all_scores=True)
        
        if emotions:
            # Get predicted emotion and its confidence
            predicted_emotion = max(emotions, key=emotions.get)
            confidence = emotions[predicted_emotion]
            return predicted_emotion, confidence
        else:
            return None, None
            
    except Exception as e:
        print(f"❌ Error analyzing image: {str(e)}")
        return None, None

def batch_predict_emotions(image_paths):
    """
    Predict emotions for multiple images
    
    Args:
        image_paths (list): List of image file paths
    
    Returns:
        list: List of predicted emotions
    """
    predictions = []
    
    for i, image_path in enumerate(image_paths):
        print(f"Processing image {i+1}/{len(image_paths)}: {os.path.basename(image_path)}")
        
        emotion = predict_emotion(image_path)
        predictions.append(emotion)
        
        if (i + 1) % 10 == 0:
            print(f"   Completed {i+1}/{len(image_paths)} images")
    
    return predictions

def predict_emotion_from_folder(folder_path):
    """
    Predict emotions for all images in a folder
    
    Args:
        folder_path (str): Path to folder containing images
    
    Returns:
        dict: Dictionary with image names as keys and predicted emotions as values
    """
    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    image_files = []
    
    for file in os.listdir(folder_path):
        if any(file.lower().endswith(ext) for ext in image_extensions):
            image_files.append(os.path.join(folder_path, file))
    
    print(f"Found {len(image_files)} images in {folder_path}")
    
    # Predict emotions
    results = {}
    for i, image_path in enumerate(image_files):
        print(f"Processing {i+1}/{len(image_files)}: {os.path.basename(image_path)}")
        
        emotion = predict_emotion(image_path)
        results[os.path.basename(image_path)] = emotion
    
    return results

# Example usage and testing
if __name__ == "__main__":
    print("🎭 Emotion Prediction Tool")
    print("=" * 40)
    
    # Example 1: Single image prediction
    print("\n📋 Example Usage:")
    print("1. Single image prediction:")
    print("   emotion = predict_emotion('path/to/image.jpg')")
    print("   print(f'Predicted emotion: {emotion}')")
    
    print("\n2. Prediction with confidence:")
    print("   emotion, confidence = predict_emotion_with_confidence('path/to/image.jpg')")
    print("   print(f'{emotion}: {confidence:.2f}%')")
    
    print("\n3. Get all emotion scores:")
    print("   scores = predict_emotion('path/to/image.jpg', return_all_scores=True)")
    print("   print(scores)")
    
    print("\n4. Batch prediction:")
    print("   image_list = ['img1.jpg', 'img2.jpg', 'img3.jpg']")
    print("   emotions = batch_predict_emotions(image_list)")
    print("   print(emotions)")
    
    print("\n5. Predict all images in a folder:")
    print("   results = predict_emotion_from_folder('test/happy')")
    print("   print(results)")
    
    # Test with an actual image if available
    test_folders = ['test/happy', 'test/sad', 'test/angry']
    
    for folder in test_folders:
        if os.path.exists(folder):
            image_files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            if image_files:
                test_image = os.path.join(folder, image_files[0])
                print(f"\n🧪 Testing with: {test_image}")
                
                # Simple prediction
                emotion = predict_emotion(test_image)
                print(f"   Predicted emotion: {emotion}")
                
                # Prediction with confidence
                emotion, confidence = predict_emotion_with_confidence(test_image)
                print(f"   With confidence: {emotion} ({confidence:.2f}%)")
                
                # All scores
                scores = predict_emotion(test_image, return_all_scores=True)
                if scores:
                    print("   All emotion scores:")
                    for emo, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
                        print(f"      {emo.capitalize()}: {score:.2f}%")
                
                break
    
    print("\n✅ Emotion prediction tool ready!")
    print("💡 Import this file and use the functions in your code:")
    print("   from emotion_predictor import predict_emotion")
    print("   emotion = predict_emotion('your_image.jpg')")