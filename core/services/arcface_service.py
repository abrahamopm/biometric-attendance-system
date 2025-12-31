import cv2
import numpy as np
from insightface.app import FaceAnalysis

# Lazy singleton to avoid heavy model download at import time
_app = None


def get_app():
    global _app
    if _app is None:
        _app = FaceAnalysis(
            name='buffalo_l',
            root='~/.insightface',
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider'],
        )
        _app.prepare(ctx_id=0, det_size=(640, 640))  # GPU=0, CPU=-1
    return _app

def extract_embedding(image_file):
    """Extract ArcFace 512-dim embedding from uploaded image"""
    file_bytes = np.asarray(bytearray(image_file.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image")
        
    faces = get_app().get(img)
    
    if len(faces) == 0:
        raise ValueError("No face detected")
    if len(faces) > 1:
        raise ValueError("Multiple faces detected")
        
    return faces[0].normed_embedding.tolist()


def compare_embeddings(emb1, emb2, threshold=0.42):
    """Compare two ArcFace embeddings"""
    emb1 = np.array(emb1)
    emb2 = np.array(emb2)
    similarity = np.dot(emb1, emb2)
    return similarity > threshold, float(similarity)