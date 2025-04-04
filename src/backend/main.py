from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from guitar import Guitar
import numpy as np
import json
from keras.src.saving import load_model
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and vocabulary
with open('../../data/PROG/chord_vocab.json') as f:
    vocab_data = json.load(f)
    chord_to_int = vocab_data['chord_to_int']
    # Convert string keys back to integers
    int_to_chord = {int(k): v for k, v in vocab_data['int_to_chord'].items()}
    
model_path = '../../data/PROG/best_model.keras'
if os.path.exists(model_path):
    model = load_model(model_path)
else:
    model = None

# Define request bodies
class ChordRequest(BaseModel):
    root: str
    modifier: str
    fret: int
    tuning: list[str]  # Default to standard tuning

class ProgressionRequest(BaseModel):
    starting_chord: str
    temperature: float = 1.0  # Default medium creativity

# Chord Fingering Endpoint
@app.api_route("/api/fing", methods=["POST", "OPTIONS"])
async def get_fing(data: ChordRequest, request: Request):
    if request.method == "OPTIONS":
        return {}  # FastAPI handles preflight headers via CORSMiddleware

    # Use the tuning from the request, or default if not provided
    tuning = data.tuning if data.tuning else ["E", "A", "D", "G", "B", "E"]
    notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
    frets = 24

    print(f"Using tuning: {tuning}")  # Debug print

    g = Guitar(tuning, notes, frets, data.fret, data.root, data.modifier)
    g.fret_guess = data.fret
    g.sliced_fretboard = g.find_range()
    g.note_matches = g.find_match(g.note_names)
    g.FING = g.closest_notes()

    frets_only = {key: value['fret'] for key, value in g.FING.items()}
    fing_list = list(frets_only.values())
    
    print(f"Calculated Fret Positions: {fing_list} with tuning: {tuning}")

    return {"fing": fing_list}

# New Chord Progression Endpoint
@app.api_route("/api/progression", methods=["POST", "OPTIONS"])
async def get_progression(data: ProgressionRequest, request: Request):
    if request.method == "OPTIONS":
        return {}

    def predict_next_three(input_chord, temperature=1.0, max_attempts=100):
        """Generate a unique 3-chord progression"""
        try:
            input_int = chord_to_int[input_chord]
        except KeyError:
            return {"error": f"Chord '{input_chord}' not in vocabulary"}

        for _ in range(max_attempts):
            preds = model.predict(np.array([[input_int]]), verbose=0)[0]
            preds = np.clip(preds, 1e-10, 1.0)

            used_chords = {input_chord}
            predicted_chords = []

            for chord_probs in preds:
                valid_indices = [i for i in range(len(int_to_chord)) 
                               if int_to_chord[i] not in used_chords]
                if not valid_indices:
                    break

                valid_probs = chord_probs[valid_indices]
                logits = np.log(valid_probs) / temperature
                exp_logits = np.exp(logits - np.max(logits))
                probs = exp_logits / np.sum(exp_logits)

                chosen_idx = np.random.choice(valid_indices, p=probs)
                chosen_chord = int_to_chord[chosen_idx]
                predicted_chords.append(chosen_chord)
                used_chords.add(chosen_chord)

            if len(predicted_chords) == 3:
                return predicted_chords

        return {"error": "Couldn't generate unique progression"}

    result = predict_next_three(data.starting_chord, data.temperature)
    
    if isinstance(result, dict):  # Error case
        return result
    else:
        return {
            "starting_chord": data.starting_chord,
            "progression": result,
            "full_sequence": [data.starting_chord] + result
        }

# Health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "running",
        "model_loaded": os.path.exists('../../data/PROG/best_model.keras'),
        "vocab_size": len(chord_to_int)
    }