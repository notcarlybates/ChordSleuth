# 🎸 Chord Sleuth 🎸

**Chord Sleuth** is a web-based tool for generating intelligent chord progressions and predicting guitar finger placements. It contextualizes suggestions based on input chords, estimated fret position, and tuning.

> 🚧 Currently in development

---

## Features

- Chord progression generation based on real-world musical data
- Finger placement prediction with fretboard awareness
- Support for alternate tunings and custom fret positions
- Responsive, mobile-friendly interface
- Planned support for barre chords, reverse tuning lookup, and genre-specific progressions

## Getting Started (Local Development)

These steps will get Chord Sleuth running locally.

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chord-sleuth.git
cd chord-sleuth/src
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

This will start the FastAPI backend on [`http://127.0.0.1:8000`](http://127.0.0.1:8000).

### 3. Start the frontend

In a new terminal tab or window:

```bash
cd frontend
npm install
npm run dev
```

This will start the frontend on [`http://localhost:5173`](http://localhost:5173). It is configured to proxy requests to the backend server.

---

## Tech Stack

- **Frontend**: JavaScript, React, Tailwind CSS
- **Backend**: FastAPI, Python
- **Deployment**: Vercel (frontend), Render.io (backend)

---

## Contributing

Pull requests, issues, and suggestions are welcome. MIT License.