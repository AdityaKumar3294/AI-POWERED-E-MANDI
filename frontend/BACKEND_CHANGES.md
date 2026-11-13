# AI-Powered E-Mandi: Backend & Model Change Recommendations (`BACKEND_CHANGES.md`)

This document outlines the architectural assumptions, spec gaps resolved in the frontend implementation, and recommended backend adjustments for the team maintaining `backend/` and `ai-service/`.

---

## 1. Spec Gaps Handled Defensively in Frontend

### Spec Gap 1: Detection Bounding Boxes in `POST /api/grading/analyze`
- **Current Observation:** The FastAPI AI service returns `{ total, healthy, defective, defectPercentage, averageSize, grade }`. It does not always return raw pixel coordinates `[x1, y1, x2, y2]` for detections.
- **Frontend Handling:** The frontend `DetectionOverlay.tsx` component checks defensively for `detections?: BoundingBoxDetection[]`. If missing or empty, it smoothly falls back to displaying the original produce photo with the metric KPI cards (total count, fresh vs rotten counts, defect rate progress bar) without crashing or breaking the layout.
- **Recommended Backend Change:**
  - Update `ai-service/main.py` YOLO inference response to include:
    ```json
    "detections": [
      {
        "class_id": 0,
        "class_name": "Fresh Tomato",
        "confidence": 0.94,
        "box": [120, 85, 340, 290]
      }
    ]
    ```
  - Ensure `backend/src/controllers/gradingController.js` forwards `detections` to the frontend without stripping it.

---

### Spec Gap 2: QR Code `verificationUrl` Host Resolution
- **Current Observation:** The backend generates a QR code Data URL pointing to `verificationUrl`. If configured to the backend port (e.g., `http://localhost:5000/api/certificates/verify/:id`), a buyer scanning the physical QR with their smartphone would receive a raw JSON response.
- **Frontend Handling:** The frontend public verification route is hosted at `/verify/:certificateId` (no auth, no app chrome). When a buyer scans the QR code or navigates to `/verify/:id`, the frontend calls `GET /api/certificates/verify/:id` and renders rich trust signals (Grade pill, Defect %, Farmer origin, and APMC compliance markers).
- **Recommended Backend Change:**
  - Update `backend/src/controllers/certificateController.js`:
    ```javascript
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendBaseUrl}/verify/${certificateId}`;
    ```

---

### Spec Gap 3: Bare Image Filenames in API Responses
- **Current Observation:** The backend stores and returns bare image filenames (e.g. `image-1731500000000.jpg`) rather than absolute URLs.
- **Frontend Handling:** All image consumers pass the bare filename through `uploadUrl(filename)` in `src/lib/api.ts`, which prefixes `VITE_API_URL` and `/uploads/` cleanly, with fallback to produce placeholders.
- **Recommended Backend Change:**
  - Maintain current static file serving at `/uploads/:filename`, or optionally return a virtual field `imageUrl` on Product and Certificate models.

---

### Spec Gap 4: Authenticated PDF Certificate Downloads
- **Current Observation:** The endpoint `GET /api/certificates/:id/pdf` requires JWT authentication. A standard `<a href="...">` link fails with 401 because standard browser anchor navigation does not send custom `Authorization: Bearer <token>` headers.
- **Frontend Handling:** Implemented `downloadCertificatePdf(id, filename)` in `src/lib/api.ts` using an authenticated `fetch()` call that extracts the binary blob, creates an object URL, and triggers an automatic browser file download.
- **Backend Compatibility:** Works out-of-the-box with the current backend without modifications.

---

## 2. API Contract Verification Summary

| Method | Endpoint | Status in Frontend | Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | ✅ Fully Integrated | Farmer / Buyer toggle with validation |
| `POST` | `/api/auth/login` | ✅ Fully Integrated | JWT token stored in Zustand + persist |
| `GET` | `/api/auth/me` | ✅ Fully Integrated | Automatic session restore on page refresh |
| `GET` | `/api/products` | ✅ Fully Integrated | Debounced search, grade filter, price range |
| `GET` | `/api/products/my` | ✅ Fully Integrated | Farmer's inventory list with KPI metrics |
| `GET` | `/api/products/:id` | ✅ Fully Integrated | Live lot view, stock stepper, certificate card |
| `POST` | `/api/products` | ✅ Fully Integrated | Certificate grade locking enforced |
| `PUT` | `/api/products/:id` | ✅ Fully Integrated | Optimistic status toggle, image replace |
| `DELETE`| `/api/products/:id` | ✅ Fully Integrated | 409 Conflict handled with explanatory advice |
| `POST` | `/api/grading/analyze` | ✅ Fully Integrated | Multipart image upload with compression |
| `GET` | `/api/grading/history` | ✅ Fully Integrated | Historical AI scan reports list |
| `POST` | `/api/certificates` | ✅ Fully Integrated | Mint digital certificate from grading report |
| `GET` | `/api/certificates/my` | ✅ Fully Integrated | Farmer's certificate wallet with QR preview |
| `GET` | `/api/certificates/verify/:id` | ✅ Fully Integrated | Public verification registry (3 trust states) |
| `GET` | `/api/orders` | ✅ Fully Integrated | Farmer & Buyer purchase order lists |
| `POST` | `/api/orders` | ✅ Fully Integrated | Atomic stock reservation with 400/409 handling |
| `PUT` | `/api/orders/:id/status`| ✅ Fully Integrated | Role-gated state machine with rollback |
| `GET` | `/api/farmer/dashboard` | ✅ Fully Integrated | Inventory, sales, SVG donut, recent orders |
| `GET` | `/api/buyer/dashboard` | ✅ Fully Integrated | Spending, active orders, SVG donut, recent |

