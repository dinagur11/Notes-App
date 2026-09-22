# Notes App

A full-stack notes application with user authentication and an AI assistant that can search your notes for you.

## Features

- Create, view, update, and delete notes
- User registration and login (JWT-based authentication)
- Filter/search notes by content
- Pagination support (get/update/delete notes by index)
- AI assistant that can answer questions about your notes using tool-calling (requires being logged in)

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- React Router
- Axios
- Playwright (end-to-end tests)

**Backend**
- Node.js + Express 5 (TypeScript, run via `tsx`)
- MongoDB + Mongoose
- JSON Web Tokens (`jsonwebtoken`) for auth
- `bcrypt` for password hashing
- Jest + Supertest (tests)

**AI Assistant**
- Talks to a locally running [Ollama](https://ollama.com/) instance (`http://localhost:11434`) using the `qwen2.5:3b` model
- Uses tool-calling to search notes on the user's behalf

## Project Structure

```
Notes-App/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers (notes, users, AI)
│   ├── middlewares/     # Logger, auth
│   ├── models/          # Mongoose schemas (Note, User)
│   ├── routes/          # Express routers
│   ├── services/        # Business logic, incl. AI agent
│   ├── tests/           # Jest tests
│   ├── expressApp.ts    # Express app setup
│   └── server.ts        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # AIAssistant, NoteItem, Pages
│   │   ├── contexts/    # Auth, Notification
│   │   ├── pages/       # Login, Register, MainPage
│   │   └── main.tsx
│   └── playwright-tests/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- A MongoDB instance (local or Atlas)
- [Ollama](https://ollama.com/) running locally with the `qwen2.5:3b` model pulled, if you want the AI assistant to work:
  ```bash
  ollama pull qwen2.5:3b
  ```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/dinagur11/Notes-App.git
   cd Notes-App
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

Create a `.env` file inside `backend/` with:

```
PORT=3001
MONGODB_CONNECTION_URL=your-mongodb-connection-string
SECRET=your-jwt-secret
```

### Running the App

**Backend** (from `backend/`):
```bash
npm run dev
```
Runs on `http://localhost:3001` by default. Health check available at `/health`.

**Frontend** (from `frontend/`):
```bash
npm run dev
```

## API Overview

- `POST /users` – register a new user
- `POST /login` – log in, returns a JWT
- `GET /notes` – get all notes
- `GET /notes/:id` – get a single note
- `POST /notes` – create a note
- `PUT /notes/:id` – update a note
- `DELETE /notes/:id` – delete a note
- `GET /notes/filter` – search notes by content
- `GET|PUT|DELETE /notes/by-index/:i` – access notes by index (for pagination)
- `POST /ai/complete` – ask the AI assistant a question (requires `Authorization: Bearer <token>`)

## Testing

**Backend:**
```bash
cd backend
npm test
```

**Frontend (E2E with Playwright):**
```bash
cd frontend
npm test
```

## License

This project is for educational purposes.
