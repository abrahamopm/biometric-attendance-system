"""
Django management command to verify face_embedding binary integrity.

Usage:
    python manage.py verify_face_embeddings
    python manage.py verify_face_embeddings --username <username>
    python manage.py verify_face_embeddings --all
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import numpy as np
from api.services.face_service import bytes_to_face_encoding

User = get_user_model()


class Command(BaseCommand):
    help = 'Verify face_embedding binary data integrity and dimensions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Check specific user by username',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Check all users with face embeddings',
        )

    def handle(self, *args, **options):
        username = options.get('username')
        check_all = options.get('all')

        if username:
            try:
                user = User.objects.get(username=username)
                self.check_user(user)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User "{username}" not found'))
        elif check_all:
            users_with_faces = User.objects.exclude(face_embedding__isnull=True).exclude(face_embedding=b'')
            total = users_with_faces.count()
            self.stdout.write(self.style.SUCCESS(f'Checking {total} users with face embeddings...\n'))
            
            for user in users_with_faces:
                self.check_user(user)
                self.stdout.write('')
        else:
            # Check current user or prompt
            self.stdout.write(self.style.WARNING('No username specified. Use --username <username> or --all'))
            self.stdout.write('Example: python manage.py verify_face_embeddings --username admin')
            self.stdout.write('         python manage.py verify_face_embeddings --all')

    def check_user(self, user):
        """Check a single user's face embedding"""
        self.stdout.write(f'\n{"="*60}')
        self.stdout.write(self.style.SUCCESS(f'User: {user.username} (ID: {user.id})'))
        self.stdout.write(f'Role: {user.role}')
        
        if not user.face_embedding:
            self.stdout.write(self.style.ERROR('❌ face_embedding is NULL or empty'))
            return
        
        # Get binary data
        binary_data = user.face_embedding
        
        # Check binary length
        binary_len = len(binary_data)
        self.stdout.write(f'Binary Data Length: {binary_len} bytes')
        
        # Expected size for 128 floats (float64 = 8 bytes each)
        expected_size_128 = 128 * 8  # 1024 bytes
        expected_size_512 = 512 * 8  # 4096 bytes
        
        if binary_len == 0:
            self.stdout.write(self.style.ERROR('❌ Binary data is empty'))
            return
        
        # Try to convert back to numpy array
        try:
            encoding_array = bytes_to_face_encoding(binary_data)
            array_len = len(encoding_array)
            array_shape = encoding_array.shape
            array_dtype = encoding_array.dtype
            
            self.stdout.write(f'✅ Successfully converted to NumPy array')
            self.stdout.write(f'   Shape: {array_shape}')
            self.stdout.write(f'   Dtype: {array_dtype}')
            self.stdout.write(f'   Length: {array_len} elements')
            
            # Check dimensions
            if array_len == 128:
                self.stdout.write(self.style.SUCCESS(f'✅ Correct dimension: 128D vector'))
            elif array_len == 512:
                self.stdout.write(self.style.WARNING(f'⚠️  Dimension: 512D vector (unexpected, but valid)'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ Unexpected dimension: {array_len} (expected 128 or 512)'))
            
            # Check if it's all zeros (empty noise)
            if np.all(encoding_array == 0):
                self.stdout.write(self.style.ERROR('❌ WARNING: Array contains only zeros (likely empty noise)'))
            else:
                self.stdout.write(self.style.SUCCESS('✅ Array contains non-zero values'))
            
            # Statistics
            self.stdout.write(f'\n   Statistics:')
            self.stdout.write(f'   Min: {np.min(encoding_array):.6f}')
            self.stdout.write(f'   Max: {np.max(encoding_array):.6f}')
            self.stdout.write(f'   Mean: {np.mean(encoding_array):.6f}')
            self.stdout.write(f'   Std: {np.std(encoding_array):.6f}')
            
            # Check binary size matches array size
            if binary_len == expected_size_128:
                self.stdout.write(self.style.SUCCESS(f'✅ Binary size matches 128D float64 array ({expected_size_128} bytes)'))
            elif binary_len == expected_size_512:
                self.stdout.write(self.style.WARNING(f'⚠️  Binary size matches 512D float64 array ({expected_size_512} bytes)'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ Binary size mismatch: {binary_len} bytes (expected {expected_size_128} or {expected_size_512})'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Failed to convert binary to NumPy array: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())
