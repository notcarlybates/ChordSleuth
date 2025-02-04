class String:

    def __init__(self, root_note, notes):

        self.root_note = root_note
        self.all_notes = all_notes

class Guitar:

    def __init__(self, strings, notes, frets):
        self.tuning = tuning
        self.notes = notes
        self.frets = frets

    def make_tuning(self):
        print("Guitar created with "+self.tuning+" tuning")


notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]

root_note = "C#"
index = 27 # Defining the number of notes generated

def make_string(root_note, notes, index):
    root_index = notes.index(root_note)
    for i in range(index):
        note = notes[(root_index + i) % len(notes)]
        print(i, note)
            

make_string(root_note, notes, index)