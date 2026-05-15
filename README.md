# Login Application

This is a full-stack login application featuring a premium React frontend and a Node.js backend.

## Structure
- `client/`: React frontend created with Vite, featuring a beautiful glassmorphic UI.
- `server/`: Express Node.js backend with JWT authentication and in-memory mock database.

## Running Locally

1. **Start the Backend:**
   ```bash
   cd server
   npm install
   node index.js
   ```
   The backend will start on `http://localhost:5005`.

2. **Start the Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

### Demo Credentials
To test the login without creating an account:
- **Email**: demo@example.com
- **Password**: password123
