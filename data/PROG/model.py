import pandas as pd
import numpy as np
import keras
from keras.models import Sequential
from keras.layers import Embedding, LSTM, Dense, Reshape
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.model_selection import train_test_split
from collections import Counter

# 1. Load and filter data
def load_and_filter_data(filepath, sample_size=50000, min_occurrences=2):
    df = pd.read_parquet(filepath).sample(n=sample_size, random_state=42)
    all_chords = pd.concat([df[col] for col in ['input_chord', 'chord_2', 'chord_3', 'chord_4']])
    chord_counts = Counter(all_chords)
    mask = df.apply(lambda row: all(chord_counts[c] >= min_occurrences 
                                 for c in [row['input_chord'], row['chord_2'], 
                                         row['chord_3'], row['chord_4']]), axis=1)
    return df[mask]

df = load_and_filter_data('all_chord_sequences.parquet.gzip', sample_size=50000)

# 2. Create vocabulary
all_chords = pd.concat([df[col] for col in ['input_chord', 'chord_2', 'chord_3', 'chord_4']])
vocab = sorted(set(all_chords))
chord_to_int = {chord: i for i, chord in enumerate(vocab)}
int_to_chord = {i: chord for chord, i in chord_to_int.items()}
vocab_size = len(vocab)

# 3. Prepare data
X = df['input_chord'].map(chord_to_int).values.reshape(-1, 1)
y = df[['chord_2', 'chord_3', 'chord_4']].apply(lambda col: col.map(chord_to_int)).values
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Build model
model = Sequential([
    Embedding(input_dim=vocab_size, output_dim=64),
    Reshape((1, 64)),
    LSTM(128, return_sequences=False),
    Dense(256, activation='relu'),
    Dense(3 * vocab_size),
    Reshape((3, vocab_size))
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 5. Train model
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    batch_size=512,
    epochs=20,
    callbacks=[
        EarlyStopping(patience=5, monitor='val_loss'),
        ModelCheckpoint('best_model.keras', save_best_only=True),
        ReduceLROnPlateau(factor=0.5, patience=2)
    ],
    verbose=1
)

# 6. Enhanced prediction function
def predict_next_three(model, input_chord, chord_to_int, int_to_chord, temperature=1.0, max_attempts=100):
    """
    Generates a new sequence each call with:
    - No repeating chords in output
    - Input chord excluded from output
    - Different results on each call
    """
    try:
        input_int = chord_to_int[input_chord]
    except KeyError:
        raise ValueError(f"Chord '{input_chord}' not in vocabulary. Try one of: {list(chord_to_int.keys())[:10]}...")

    for _ in range(max_attempts):
        # Get predictions
        preds = model.predict(np.array([[input_int]]), verbose=0)[0]
        preds = np.clip(preds, 1e-10, 1.0)  # Numerical stability

        used_chords = {input_chord}
        predicted_chords = []

        for chord_probs in preds:
            # Filter out used chords
            valid_indices = [i for i in range(vocab_size) if int_to_chord[i] not in used_chords]
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

    raise ValueError(f"Failed to generate valid sequence after {max_attempts} attempts")

# Example usage:
input_chord = "C"
print(f"First generation: {input_chord} -> {' → '.join(predict_next_three(model, input_chord, chord_to_int, int_to_chord))}")
print(f"Second generation: {input_chord} -> {' → '.join(predict_next_three(model, input_chord, chord_to_int, int_to_chord))}")
print(f"Third generation: {input_chord} -> {' → '.join(predict_next_three(model, input_chord, chord_to_int, int_to_chord))}")