"""
Face Recognition Service
Handles face encoding and comparison for biometric attendance system.
"""
import base64
import io
import numpy as np
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Try to import face_recognition library
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    logger.warning("face_recognition library not available. Using fallback method.")

# Try to import PIL for image processing
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("PIL/Pillow not available. Some image processing may fail.")


def encode_face_from_base64(image_data: str) -> Optional[np.ndarray]:
    """
    Encode a face from a base64 image string.
    
    Args:
        image_data: Base64 encoded image string (may include data URL prefix)
        
    Returns:
        Face encoding as numpy array, or None if no face found or error
    """
    try:
        # Decode base64 image
        if ',' in image_data:
            # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,...")
            image_data = image_data.split(',')[-1]
        
        image_bytes = base64.b64decode(image_data)
        
        if FACE_RECOGNITION_AVAILABLE:
            # Use face_recognition library
            # Load image from bytes
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            
            # Find face locations
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                logger.warning("No face detected in image")
                return None
            
            # Get face encodings (128-dimensional vector)
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if not face_encodings:
                logger.warning("Could not encode face")
                return None
            
            # Return the first face encoding
            return face_encodings[0]
        else:
            # Fallback: Use a hash-based approach (less secure but works without face_recognition)
            # This is a simple fallback - for production, face_recognition should be installed
            logger.warning("Using fallback face encoding method. Install face_recognition for better accuracy.")
            
            # Create a deterministic hash from image data
            import hashlib
            hash_obj = hashlib.sha256(image_bytes)
            hash_bytes = hash_obj.digest()
            
            # Create a 128-byte array from hash (repeat hash to fill 128 bytes)
            encoding = np.frombuffer((hash_bytes * 4)[:128], dtype=np.uint8).astype(np.float64)
            # Normalize to match face_recognition format
            encoding = encoding / 255.0
            
            return encoding
            
    except Exception as e:
        logger.error(f"Error encoding face: {str(e)}")
        return None


def compare_faces(known_encoding: bytes, unknown_encoding: np.ndarray, tolerance: float = 0.6) -> Tuple[bool, float]:
    """
    Compare a known face encoding (stored in DB) with an unknown face encoding.
    
    Args:
        known_encoding: Face encoding stored in database (as bytes)
        unknown_encoding: Face encoding from current image (as numpy array)
        tolerance: How much distance between faces to consider it a match (default 0.6)
                   Lower values are more strict
        
    Returns:
        Tuple of (is_match: bool, distance: float)
    """
    try:
        # Convert known_encoding from bytes back to numpy array
        if isinstance(known_encoding, bytes):
            known_encoding_array = np.frombuffer(known_encoding, dtype=np.float64)
        else:
            known_encoding_array = np.array(known_encoding)
        
        # Ensure both are numpy arrays
        known_encoding_array = np.array(known_encoding_array)
        unknown_encoding_array = np.array(unknown_encoding)
        
        # Calculate Euclidean distance between encodings
        if FACE_RECOGNITION_AVAILABLE:
            # Use face_recognition's built-in comparison
            distance = face_recognition.face_distance([known_encoding_array], unknown_encoding_array)[0]
            is_match = distance <= tolerance
        else:
            # Fallback: Calculate Euclidean distance manually
            distance = np.linalg.norm(known_encoding_array - unknown_encoding_array)
            # For fallback, use a different threshold (hash-based is less accurate)
            is_match = distance <= (tolerance * 10)  # More lenient for fallback
        
        # Calculate confidence score (0-1, higher is better)
        # For face_recognition, lower distance = higher confidence
        # Convert distance to confidence: confidence = 1 - min(distance/tolerance, 1)
        confidence = max(0.0, 1.0 - min(distance / tolerance, 1.0))
        
        return is_match, confidence
        
    except Exception as e:
        logger.error(f"Error comparing faces: {str(e)}")
        return False, 0.0


def face_encoding_to_bytes(encoding: np.ndarray) -> bytes:
    """
    Convert face encoding numpy array to bytes for database storage.
    
    Args:
        encoding: Face encoding as numpy array
        
    Returns:
        Face encoding as bytes
    """
    return encoding.tobytes()


def bytes_to_face_encoding(encoding_bytes: bytes) -> np.ndarray:
    """
    Convert face encoding bytes from database to numpy array.
    
    Args:
        encoding_bytes: Face encoding as bytes
        
    Returns:
        Face encoding as numpy array
    """
    return np.frombuffer(encoding_bytes, dtype=np.float64)


def recognize_faces_in_image(image_data: str, known_faces_dict: dict, tolerance: float = 0.6) -> list:
    """
    Detect multiple faces in an image and identify them against a dictionary of known faces.
    
    Args:
        image_data: Base64 string of the image
        known_faces_dict: Dict mapping {user_id: face_encoding_bytes}
        tolerance: Distance tolerance for matching
        
    Returns:
        List of dictionaries: [{'user_id': id, 'confidence': score}, ...]
    """
    results = []
    
    try:
        # Decode image
        if ',' in image_data:
            image_data = image_data.split(',')[-1]
        image_bytes = base64.b64decode(image_data)
        
        if not FACE_RECOGNITION_AVAILABLE:
            logger.warning("Face recognition not available for batch processing")
            return results

        # Load image
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        
        # Find all faces
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return results
            
        # Encode all found faces
        unknown_encodings = face_recognition.face_encodings(image, face_locations)
        
        # Prepare known faces for comparison
        known_ids = list(known_faces_dict.keys())
        known_encodings = []
        for uid in known_ids:
            # Convert bytes to numpy array
            encoding_bytes = known_faces_dict[uid]
            known_encodings.append(np.frombuffer(encoding_bytes, dtype=np.float64))
            
        if not known_encodings:
            return results

        # Compare each found face against all known faces
        for unknown_encoding in unknown_encodings:
            # face_distance returns array of distances to known_encodings
            distances = face_recognition.face_distance(known_encodings, unknown_encoding)
            
            # Find the best match (smallest distance)
            best_match_index = np.argmin(distances)
            min_distance = distances[best_match_index]
            
            if min_distance <= tolerance:
                matched_id = known_ids[best_match_index]
                confidence = max(0.0, 1.0 - min(min_distance / tolerance, 1.0))
                
                # Check if this user is already in results (avoid duplicates if multiple faces match same person - rare but possible)
                if not any(r['user_id'] == matched_id for r in results):
                    results.append({
                        'user_id': matched_id,
                        'confidence': confidence
                    })
                    
    except Exception as e:
        logger.error(f"Error in batch face recognition: {str(e)}")
        
    return results
