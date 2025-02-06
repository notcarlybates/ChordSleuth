class String:

    def __init__(self, root_note, notes):

        self.root_note = root_note
        self.notes = notes
        self.index = index
        self.string = string
        
    def make_string(root_note, notes, index):
        root_index = notes.index(root_note)
        string = []
        for i in range(index):
            note = notes[(root_index + i) % len(notes)]
            string.append(note)
            return string

class Guitar:

    def __init__(self, strings, notes, frets):
        self.tuning = tuning
        self.notes = notes
        self.frets = frets
        self.fretboard = fretboard

    def make_tuning(self):
        print("Guitar created with "+self.tuning+" tuning")
        
    def assemble_neck(tuning, notes, index):
        string_instance = String.make_string(tuning, notes, index)
            
    


notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
tuning = ["E," "A", "D", "G", "B", "E"]
root_note = "C#" # Will make input
index = 25 # Defining the number of notes generated

Guitar.assemble_neck(tuning)