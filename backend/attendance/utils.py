import cv2
import numpy as np
from insightface.app import FaceAnalysis
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os

# Initialize InsightFace
# Note: In a production environment, you might want to load this once at startup
# or use a singleton pattern.
face_app = None

def get_face_app():
    global face_app
    if face_app is None:
        face_app = FaceAnalysis(name='buffalo_l')
        face_app.prepare(ctx_id=0, det_size=(640, 640))
    return face_app

def encrypt_embedding(embedding):
    """Encrypts a 512-d float embedding."""
    f = Fernet(settings.ENCRYPTION_KEY)
    # Convert numpy array to bytes
    embedding_bytes = embedding.tobytes()
    encrypted_data = f.encrypt(embedding_bytes)
    return encrypted_data

def decrypt_embedding(encrypted_data):
    """Decrypts and returns the 512-d float embedding."""
    f = Fernet(settings.ENCRYPTION_KEY)
    decrypted_bytes = f.decrypt(encrypted_data)
    # Convert back to numpy array (512 float32)
    embedding = np.frombuffer(decrypted_bytes, dtype=np.float32)
    return embedding

def extract_embedding(image_path):
    """Extracts a 512-d embedding from an image file."""
    app = get_face_app()
    img = cv2.imread(image_path)
    if img is None:
        return None, "Invalid image format or path."
    
    faces = app.get(img)
    
    if len(faces) == 0:
        return None, "No face detected."
    if len(faces) > 1:
        return None, "Multiple faces detected. Please provide an image with only one person."
    
    # faces[0].embedding is typically 512-d for buffalo_l
    return faces[0].embedding, None

def compare_embeddings(emb1, emb2, threshold=0.4):
    """Compares two embeddings using cosine similarity."""
    # Cosine similarity calculation
    similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
    # For ArcFace, similarity is higher for same person. 
    # Usually > 0.4 is a good match.
    return similarity > threshold, similarity
