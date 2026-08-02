# Sunya Backend — API Documentation (Phase 1)

Base URL: `http://localhost:5000/api/v1`

All responses follow this shape:
```json
{ "success": true, "message": "...", "data": { } }
```

Authentication uses HTTP-only cookies (`accessToken`, `refreshToken`). The access token can
also be sent as `Authorization: Bearer <token>` for non-browser clients.

---

## 1. Auth — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user (default role: `employee`) |
| POST | `/verify-email` | Public | Verify email using OTP sent at registration |
| POST | `/resend-otp` | Public | Resend email verification OTP |
| POST | `/login` | Public | Login; sets `accessToken` + `refreshToken` cookies |
| POST | `/refresh-token` | Public (cookie) | Rotates refresh token, issues new access token |
| POST | `/logout` | Authenticated | Invalidates current session |
| POST | `/forgot-password` | Public | Sends password reset OTP (generic response) |
| POST | `/reset-password` | Public | Resets password using OTP |
| POST | `/change-password` | Authenticated | Change password (requires current password) |
| GET | `/me` | Authenticated | Get current logged-in user |

### Register
```
POST /auth/register
{ "name": "Sabina Thapa", "email": "sabina@sunya.com.np", "password": "Employee@123", "phone": "9800000004" }
```

### Login
```
POST /auth/login
{ "email": "sabina@sunya.com.np", "password": "Employee@123" }
```
Response sets `accessToken` (15m) and `refreshToken` (7d) as HTTP-only cookies.

### Verify Email
```
POST /auth/verify-email
{ "email": "sabina@sunya.com.np", "otp": "123456" }
```

### Forgot / Reset Password
```
POST /auth/forgot-password        { "email": "..." }
POST /auth/reset-password         { "email": "...", "otp": "123456", "newPassword": "New@Pass123" }
```

---

## 2. Sessions — `/sessions` (all require auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List active sessions/devices for current user |
| DELETE | `/all-others` | Revoke all sessions except the current device |
| DELETE | `/:sessionId` | Revoke a specific session |

Each session record includes `ip`, `userAgent`, `deviceInfo`, `createdAt`, `expiresAt`.

---

## 3. Users — `/users` (all require auth)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/me` | Self | Get own profile |
| PATCH | `/me` | Self | Update name/phone/department/designation/joiningDate |
| PATCH | `/me/profile-picture` | Self | Upload profile picture (multipart, field: `profilePicture`) |
| GET | `/` | Manager+ | List all users (filters: `department`, `role`, `isActive`) |
| GET | `/:userId` | Manager+ | Get a specific user |
| PATCH | `/:userId/role` | Admin+ | Change a user's role |
| PATCH | `/:userId/toggle-active` | Admin+ | Activate/deactivate a user |

Roles hierarchy: `super_admin` > `admin` > `manager` > `employee`.

---

## 4. Attendance — `/attendance` (all require auth)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/clock-in` | Self | Clock in for the day (`{ "isRemote": false }`) |
| POST | `/clock-out` | Self | Clock out (blocked until 3 hrs after clock-in) |
| GET | `/me?startDate&endDate&page&limit` | Self | Paginated attendance history |
| GET | `/me/today` | Self | Today's attendance record |
| GET | `/today/all` | Manager+ | All employees' attendance for today |
| GET | `/user/:userId` | Manager+ | Specific employee's attendance history |

### Business Rules Enforced
- One attendance record per user per day (unique index on `user + date`).
- Clock-in blocked if already clocked in today.
- Clock-out blocked until **3 hours** have passed since clock-in.
- `totalHours` auto-calculated on clock-out.
- Status is derived automatically from office settings:
  - `present` — on time, met minimum working hours
  - `late` — clocked in after grace period
  - `half_day` — worked less than `halfDayThresholdHours`
  - `remote` — marked as remote work
  - `absent` — no clock-in recorded (auto-marked by nightly cron job)
  - `leave` — set manually by admin/manager (not yet exposed as an endpoint in Phase 1)

---

## 5. Settings — `/settings` (all require auth)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Manager+ | Get office attendance settings |
| PATCH | `/` | Admin+ | Update office start/end time, min hours, grace period, half-day threshold |

```
PATCH /settings
{ "officeStartTime": "09:30", "officeEndTime": "17:30", "minWorkingHours": 8, "gracePeriodMinutes": 15 }
```

---

## 6. Dashboard — `/dashboard` (Manager+)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Returns `totalEmployees`, `presentEmployees`, `absentEmployees`, `onLeave`, `todayAttendance[]` |

---

## Error Response Shape
```json
{ "success": false, "message": "Invalid email or password", "data": null }
```
Validation errors additionally include field-level detail via the centralized error handler.

---

## Sample Credentials (after running `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@sunya.com.np | SuperAdmin@123 |
| Admin | admin@sunya.com.np | Admin@123 |
| Manager | manager@sunya.com.np | Manager@123 |
| Employee | sabina@sunya.com.np | Employee@123 |
| Employee | nischal@sunya.com.np | Employee@123 |
| Employee | kriti@sunya.com.np | Employee@123 |

---

## Setup

```bash
cp .env.example .env   # fill in Mongo URI, JWT secrets, SMTP, Cloudinary creds
npm install
npm run seed            # optional: populate sample data
npm run dev              # nodemon
```
