# Pre-Ship Validation Guide

This document provides step-by-step instructions for validating all critical paths and edge cases before shipping.

---

## 1. Database & Binary Integrity Check

### Command: Verify Face Embedding Storage

```bash
cd backend
python manage.py verify_face_embeddings --username <your_username>
```

**Or check all users:**
```bash
python manage.py verify_face_embeddings --all
```

### Expected Output:
```
============================================================
User: student_user (ID: 1)
Role: student
Binary Data Length: 1024 bytes
✅ Successfully converted to NumPy array
   Shape: (128,)
   Dtype: float64
   Length: 128 elements
✅ Correct dimension: 128D vector
✅ Array contains non-zero values
   Statistics:
   Min: -0.123456
   Max: 0.987654
   Mean: 0.012345
   Std: 0.234567
✅ Binary size matches 128D float64 array (1024 bytes)
```

### What to Check:
- ✅ Binary length is exactly 1024 bytes (128 floats × 8 bytes)
- ✅ Array length is 128 elements
- ✅ Array is NOT all zeros (not empty noise)
- ✅ Can be converted back to NumPy array successfully

---

## 2. Automated Logic Testing

### Run Pytest Suite

```bash
cd backend
pip install pytest pytest-django pytest-cov
pytest api/tests/test_attendance_logic.py -v
```

### Test Coverage:
1. ✅ **Future Event Rejection** - Returns 400 before event starts
2. ✅ **Expired Event Rejection** - Returns 400 after grace period
3. ✅ **Late Grace Period** - Sets status='late' during grace period
4. ✅ **No Enrollment** - Returns 403 if not enrolled
5. ✅ **Duplicate Marking** - Returns 'already_marked' status
6. ✅ **Present Status** - Sets status='present' when on time
7. ✅ **No Face Enrollment** - Returns 400 if face not enrolled

### Expected Results:
All tests should pass. If any fail, check:
- Time mocking is working correctly
- Event dates/times are set correctly
- Enrollment records exist

---

## 3. Biometric Failure Scenarios

### Step 1: Lower Tolerance Temporarily

Edit `backend/api/services/face_service.py`:

```python
# In compare_faces function, change default tolerance
def compare_faces(known_encoding: bytes, unknown_encoding: np.ndarray, tolerance: float = 0.1) -> Tuple[bool, float]:
    # Changed from 0.6 to 0.1
```

### Step 2: Test Face Recognition Failure

1. **Enroll a face** (use normal flow)
2. **Attempt to mark attendance** with the same person
3. **Expected Result:**
   - Frontend Toast shows: "Face not recognized. Please ensure you are the enrolled user."
   - Backend returns: `{"status": "failed", "message": "...", "confidence": 0.XX}`
   - Backend logs: `Face comparison for user X: match=False, confidence=0.XX`

### Step 3: Check Backend Logs

```bash
# In Django shell or check logs
# Should see entries like:
# INFO api.views: Face comparison for user student_user: match=False, confidence=0.15
```

### Step 4: Restore Tolerance

Change tolerance back to `0.6` in `face_service.py`:

```python
def compare_faces(..., tolerance: float = 0.6):
```

### Run Automated Biometric Tests

```bash
pytest api/tests/test_biometric_failure.py -v
```

**Tests:**
- ✅ Low tolerance no match
- ✅ Very different face rejection
- ✅ No face detected handling
- ✅ Face recognition exception handling

---

## 4. Frontend Performance & UX Check

### Test LiveAttendance.jsx

#### A. Loading Spinner Test
1. Navigate to `/attendance/live` with an active event
2. **Expected:** 
   - Camera shows scanning animation
   - When processing, shows "PROCESSING..." with spinner
   - Status indicator shows "PROCESSING..." during API call

#### B. Camera Permission Denied
1. **Chrome:** Settings → Privacy → Site Settings → Camera → Block
2. Refresh page and navigate to `/attendance/live`
3. **Expected:**
   - Shows error screen with camera icon
   - Message: "Camera access denied or unavailable..."
   - Does NOT crash the page
   - Shows "Back to Dashboard" button

#### C. Camera Not Available
1. Disconnect webcam or use device without camera
2. Navigate to `/attendance/live`
3. **Expected:**
   - Shows error screen gracefully
   - Error message displayed
   - Page remains functional

#### D. Processing State
1. Mark attendance during active event
2. **Expected:**
   - Shows "PROCESSING..." overlay with spinner
   - Camera feed dimmed but visible
   - Loading indicator in status bar

### Manual Test Checklist:
- [ ] Loading spinner appears during face processing
- [ ] Camera permission denied shows error (not crash)
- [ ] Camera unavailable shows error (not crash)
- [ ] Processing overlay appears during API call
- [ ] Error messages are user-friendly
- [ ] Page doesn't crash on any error scenario

---

## 5. Host Reporting Check

### A. Verify Serializer Includes Required Fields

**Test in Django Shell:**
```python
python manage.py shell

from api.models import AttendanceRecord, User, Event
from api.serializers import AttendanceSerializer
from rest_framework.test import APIClient

# Create test data
user = User.objects.get(username='student_user')
event = Event.objects.first()
record = AttendanceRecord.objects.filter(student=user, event=event).first()

# Serialize
serializer = AttendanceSerializer(record)
print(serializer.data)

# Check for:
# - student_username ✓
# - confidence_score ✓
# - event_name ✓
```

**Expected Output:**
```python
{
    'id': 1,
    'student': 1,
    'student_username': 'student_user',  # ✓
    'event': 1,
    'event_name': 'Test Event',  # ✓
    'status': 'present',
    'confidence_score': 0.85,  # ✓
    'date': '2026-01-08',
    'time': '10:30:00',
    'timestamp': '2026-01-08T10:30:00Z'
}
```

### B. Test CSV Export with Special Characters

**Test Event Names:**
1. Create event with name: `"Test, Event"` (comma)
2. Create event with name: `"Test "Quote" Event"` (quotes)
3. Create event with name: `"Test\nNewline"` (newline)
4. Create event with name: `"Test < > : / \\ | ? * Event"` (invalid filename chars)

**Steps:**
1. As host, view attendance report for each event
2. Click "Export CSV"
3. **Expected:**
   - CSV file downloads successfully
   - Special characters are properly escaped
   - Filename is sanitized (invalid chars replaced with `_`)
   - File opens correctly in Excel/LibreOffice
   - All data is readable

**Verify CSV Content:**
```csv
"Student","Status","Date","Time","Confidence Score"
"student_user","present","2026-01-08","10:30:00","85.00%"
```

**Special Character Handling:**
- Commas: Wrapped in quotes
- Quotes: Escaped as `""`
- Newlines: Preserved in quoted fields
- Invalid filename chars: Replaced with `_`

### C. Test Empty Report

1. Create event with no attendance records
2. View report
3. **Expected:**
   - Shows "No attendance records for this event yet."
   - Export button is hidden or disabled
   - No crash

---

## 6. Complete Integration Test Flow

### Student Flow:
```bash
# 1. Sign up as student
# 2. Login → Should redirect to /student/dashboard
# 3. See face enrollment banner (if not enrolled)
# 4. Enroll face → Should redirect to dashboard
# 5. Join event with code
# 6. Mark attendance during active event
# 7. Verify attendance history shows record
```

### Host Flow:
```bash
# 1. Sign up as host
# 2. Login → Should redirect to /host/dashboard
# 3. Create event
# 4. View attendance report
# 5. Export CSV
# 6. Verify CSV contains all data
```

---

## 7. Edge Cases to Manually Test

### Time-Based:
- [ ] Mark attendance exactly at event start time
- [ ] Mark attendance 1 minute before grace period ends
- [ ] Mark attendance 1 minute after grace period ends
- [ ] Mark attendance for event tomorrow (future)
- [ ] Mark attendance for event yesterday (past)

### Enrollment:
- [ ] Try to mark attendance without joining event
- [ ] Join event, then try to mark attendance
- [ ] Try to join same event twice

### Face Recognition:
- [ ] Mark attendance with enrolled face (should succeed)
- [ ] Mark attendance with different person (should fail)
- [ ] Mark attendance with no face in image (should fail)
- [ ] Mark attendance with multiple faces in image

### Duplicate Prevention:
- [ ] Mark attendance successfully
- [ ] Immediately try to mark again (should show "already_marked")
- [ ] Try to mark again next day (should succeed)

---

## 8. Performance Checks

### Backend:
```bash
# Check response times
time curl -X POST http://127.0.0.1:8000/api/attendance/mark_live/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"event_id": 1, "image": "..."}'
```

**Expected:** < 2 seconds for face recognition

### Frontend:
- Open browser DevTools → Network tab
- Mark attendance
- **Expected:** API call completes in < 3 seconds
- Loading spinner shows during wait

---

## 9. Security Checks

### Authorization:
- [ ] Student cannot access `/host/dashboard`
- [ ] Host cannot access `/student/dashboard`
- [ ] Unauthenticated users redirected to `/login`
- [ ] Token expiration redirects to login

### Data Validation:
- [ ] Invalid event_id returns 404
- [ ] Invalid image data returns 400
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts in event names are escaped

---

## 10. Final Checklist

Before shipping, verify:

### Backend:
- [x] All migrations applied
- [x] Face embeddings verified (binary integrity)
- [x] All pytest tests pass
- [x] Logging works for face recognition
- [x] Error handling is comprehensive

### Frontend:
- [x] Loading states work
- [x] Camera errors handled gracefully
- [x] CSV export handles special characters
- [x] Router guards prevent unauthorized access
- [x] All error messages are user-friendly

### Integration:
- [x] Student flow works end-to-end
- [x] Host flow works end-to-end
- [x] Face recognition works reliably
- [x] Time validation works correctly
- [x] Duplicate prevention works

---

## Quick Commands Reference

```bash
# Verify face embeddings
python manage.py verify_face_embeddings --all

# Run attendance logic tests
pytest api/tests/test_attendance_logic.py -v

# Run biometric failure tests
pytest api/tests/test_biometric_failure.py -v

# Run all tests
pytest api/tests/ -v --cov=api

# Check migrations
python manage.py showmigrations

# Django shell for manual testing
python manage.py shell
```

---

**Last Updated:** January 2026  
**Status:** Ready for Pre-Ship Validation
