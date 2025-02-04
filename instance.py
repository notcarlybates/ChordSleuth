from guitar import Guitar

guitar1 = Guitar("EADGBE", ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"], 14) # Self is automatically passed with Python

print(guitar1.notes)
print(guitar1.tuning)
print(guitar1.frets)

guitar1.makeTuning()