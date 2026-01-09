# Quick Test Commands Reference

## 1. Database & Binary Integrity

```bash
# Check specific user
cd backend
python manage.py verify_face_embeddings --username student_user

# Check all users
python manage.py verify_face_embeddings --all
```

## 2. Run Automated Tests

```bash
cd backend

# Install test dependencies
pip install pytest pytest-django pytest-cov

# Run attendance logic tests
pytest api/tests/test_attendance_logic.py -v

# Run biometric failure tests
pytest api/tests/test_biometric_failure.py -v

# Run all tests with coverage
pytest api/tests/ -v --cov=api --cov-report=html
```

## 3. Test Biometric Failure (Manual)

1. **Lower tolerance temporarily:**
   - Edit `backend/api/services/face_service.py`
   - Change `tolerance: float = 0.6` to `tolerance: float = 0.1`
   - Save file

2. **Test face recognition:**
   - Enroll face (normal flow)
   - Attempt to mark attendance
   - Should fail with "Face not recognized"
   - Check backend logs for confidence score

3. **Restore tolerance:**
   - Change back to `tolerance: float = 0.6`

## 4. Frontend Testing

### Test Camera Errors:
1. Block camera in browser settings
2. Navigate to `/attendance/live`
3. Should show error (not crash)

### Test Loading States:
1. Mark attendance during active event
2. Should show "PROCESSING..." spinner
3. Should show loading overlay

## 5. CSV Export Test

1. Create event with special characters in name: `"Test, "Quote" Event"`
2. As host, view attendance report
3. Click "Export CSV"
4. Open CSV in Excel
5. Verify special characters are preserved

## 6. Quick Integration Test

```bash
# Backend
cd backend
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm run dev

# Test in browser:
# 1. Sign up as student
# 2. Enroll face
# 3. Join event
# 4. Mark attendance
# 5. Check history
```
