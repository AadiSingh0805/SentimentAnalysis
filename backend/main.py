from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys
import shutil
import tempfile
from pathlib import Path
import traceback

# Add the models directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

# Import your ML models
try:
    from models.emotion_predictor import EmotionPredictor
    from models.image_predictor import predict_emotion_with_confidence
except ImportError as e:
    print(f"Warning: Could not import models: {e}")
    print("Some endpoints may not work until models are properly set up")

app = FastAPI(
    title="Emotion Recognition API",
    description="API for audio and image emotion recognition using deep learning models",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models (with error handling)
audio_predictor = None
try:
    audio_predictor = EmotionPredictor('models/best_emotion_model.pth')
    print("✅ Audio emotion model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load audio model: {e}")

# Create upload directories
UPLOAD_DIR = Path("uploads")
AUDIO_DIR = UPLOAD_DIR / "audio"
IMAGE_DIR = UPLOAD_DIR / "images"

for dir_path in [UPLOAD_DIR, AUDIO_DIR, IMAGE_DIR]:
    dir_path.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {
        "message": "Emotion Recognition API",
        "status": "running",
        "audio_model": "loaded" if audio_predictor else "not loaded",
        "endpoints": {
            "audio_analysis": "/analyze/audio",
            "image_analysis": "/analyze/image",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "audio_model_status": "loaded" if audio_predictor else "not loaded",
        "upload_dirs": {
            "audio": str(AUDIO_DIR),
            "image": str(IMAGE_DIR)
        }
    }

@app.post("/analyze/audio")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyze emotion from uploaded audio file
    """
    if not audio_predictor:
        raise HTTPException(
            status_code=503, 
            detail="Audio emotion model not available. Please check server logs."
        )
    
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an audio file."
        )
    
    # Save uploaded file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_file_path = tmp_file.name
        
        # Analyze audio emotion
        emotion, confidence = audio_predictor.predict_file(tmp_file_path)
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        return {
            "success": True,
            "emotion": str(emotion),
            "confidence": float(round(confidence * 100, 2)),  # Convert to percentage
            "filename": file.filename,
            "model_type": "audio_cnn"
        }
        
    except Exception as e:
        # Clean up on error
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        
        print(f"Audio analysis error: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Audio analysis failed: {str(e)}"
        )

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze emotion from uploaded image file
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image file."
        )
    
    # Save uploaded file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_file_path = tmp_file.name
        
        # Analyze image emotion
        emotion, confidence = predict_emotion_with_confidence(tmp_file_path)
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        if emotion is None:
            raise HTTPException(
                status_code=422,
                detail="No face detected in the image. Please upload an image with a clear face."
            )
        
        return {
            "success": True,
            "emotion": str(emotion).lower(),
            "confidence": float(round(confidence, 2)),
            "filename": file.filename,
            "model_type": "deepface"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Clean up on error
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        
        print(f"Image analysis error: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(e)}"
        )

@app.post("/analyze/batch-images")
async def analyze_batch_images(files: list[UploadFile] = File(...)):
    """
    Analyze emotions from multiple image files
    """
    if len(files) > 10:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Too many files. Maximum 10 images per batch."
        )
    
    results = []
    for i, file in enumerate(files):
        try:
            # Validate file type
            if not file.content_type.startswith('image/'):
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "Invalid file type"
                })
                continue
            
            # Analyze image
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                shutil.copyfileobj(file.file, tmp_file)
                tmp_file_path = tmp_file.name
            
            emotion, confidence = predict_emotion_with_confidence(tmp_file_path)
            os.unlink(tmp_file_path)
            
            if emotion is None:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "No face detected"
                })
            else:
                results.append({
                    "filename": file.filename,
                    "success": True,
                    "emotion": str(emotion).lower(),
                    "confidence": float(round(confidence, 2))
                })
                
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {
        "success": True,
        "results": results,
        "total_processed": len(files),
        "successful_analyses": len([r for r in results if r["success"]])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)