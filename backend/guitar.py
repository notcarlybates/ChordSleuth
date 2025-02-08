class String:

    def __init__(self, root_note, notes, frets):

        self.root_note = root_note
        self.notes = notes
        self.frets = frets
        self.string = []
        
    def make_string(self): # Creating an individual string based on a root note given in tuning
        root_index = self.notes.index(self.root_note)
        for i in range(self.frets):
            note = self.notes[(root_index + i) % len(self.notes)]
            self.string.append(note)
        return self.string


class Guitar:

    def __init__(self, tuning, notes, frets):
        self.tuning = tuning
        self.notes = notes
        self.frets = frets
        self.fretboard = self.assemble_neck()
        
    def assemble_neck(self): # Put together individually created strings
        return [String(root_note, self.notes, self.frets).make_string() for root_note in self.tuning]

    def display_neck(self): # Display the compiled chords
        for i, string in enumerate(self.fretboard):
            print(f"{self.tuning[i]} : {string}")


notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
tuning = ["E", "A", "D", "G", "B", "E"]
frets = 25 # Defining the number of notes generated (including root)

guitar = Guitar(tuning, notes, frets)
guitar.display_neck()