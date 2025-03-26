from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from guitar import Guitar

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with ["http://yourfrontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request body
class ChordRequest(BaseModel):
    root: str
    modifier: str
    fret: int

# Support POST and OPTIONS (CORS preflight)
@app.api_route("/api/fing", methods=["POST", "OPTIONS"])
async def get_fing(data: ChordRequest, request: Request):
    if request.method == "OPTIONS":
        return {}  # FastAPI handles preflight headers via CORSMiddleware

    tuning = ["E", "A", "D", "G", "B", "E"]
    notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
    frets = 24

    g = Guitar(tuning, notes, frets, data.fret, data.root, data.modifier)
    g.fret_guess = data.fret
    g.sliced_fretboard = g.find_range()
    g.note_matches = g.find_match(g.note_names)
    g.FING = g.closest_notes()

    frets_only = {key: value['fret'] for key, value in g.FING.items()}
    print(f"Calculated Fret Positions: {frets_only}")

    return {"fing": frets_only}
