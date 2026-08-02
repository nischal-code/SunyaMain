# Sunya — Digital Creative Agency Management System (Backend, Phase 1)

Backend for **Sunya**, a creative agency based in Chipledhunga, Pokhara, Nepal.

## Tech Stack
Node.js · Express.js · MongoDB/Mongoose · JWT (access + rotating refresh tokens) ·
HTTP-only cookies · Nodemailer · Cloudinary · Zod · Socket.io · Winston · MVC architecture · ES Modules

## Phase 1 Scope
- Authentication (register, login, logout, refresh, email OTP verification, forgot/reset/change password)
- Role-based access control: `super_admin`, `admin`, `manager`, `employee`
- Session management with device/IP/user-agent tracking and refresh token rotation
- User profiles (name, email, phone, profile picture via Cloudinary, department, designation, joining date)
- Attendance module (clock in/out, history, business-rule enforcement, auto status calculation)
- Admin-configurable office settings (start/end time, min working hours, grace period)
- Dashboard summary stats
- Security: Helmet, rate limiting, CORS, input validation, bcrypt hashing, centralized error handling
- Consistent `{ success, message, data }` response format

## Folder Structure
```
src/
├── config       # env, db, cloudinary
├── controllers  # request handlers
├── middleware   # auth, roles, validation, error handling, rate limiting, uploads
├── models       # Mongoose schemas
├── routes       # Express routers
├── services     # business logic (tokens, email, attendance)
├── validators   # Zod schemas
├── utils        # ApiError, ApiResponse, logger, constants, asyncHandler
├── jobs         # cron jobs (absent auto-marking)
├── socket       # Socket.io setup
├── seed         # sample data seeder
├── uploads      # local upload scratch space
└── logs         # winston log files
server.js
app.js (inside src/)
```

## Getting Started

```bash
npm install
cp .env.example .env
# edit .env with your MongoDB URI, JWT secrets, SMTP and Cloudinary credentials

npm run seed   # optional: creates sample users across all roles + sample attendance
npm run dev    # starts with nodemon on http://localhost:5000
```

See **API_DOCUMENTATION.md** for the full endpoint reference.

## Notes for Phase 2 (not yet implemented)
- Leave request/approval workflow (the `leave` attendance status exists in the schema but has no dedicated endpoints yet)
- Projects/tasks/client modules
- File/asset management beyond profile pictures
- Notifications via Socket.io (the server is wired up and authenticated, but no events are emitted yet)
