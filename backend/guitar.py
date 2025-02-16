structures = {
    # Major & Perfect
    "1": 0,
    "2": 2,
    "3": 4,
    "5": 7,
    "6": 9,
    "7": 11,
    "9": 14,
    "11": 17,
    "13": 21,
    # Altered/Minor
    "b3": 3,
    "b5": 6,
    "b7": 10,
    "b9": 13,
    "b13": 20,
    # Double & Augmented
    "#5": 8,
    "#9": 15,
    "#11": 18,
    "bb7": 9 
}

class Guitar:

    def __init__(self, tuning, notes, frets):

        self.tuning = tuning
        self.notes = notes
        self.frets = frets
        self.fretboard = self.assemble_neck()

    def make_string(self, root_note): # Creating an individual string based on a root note given in tuning
        string = []
        root_index = self.notes.index(root_note)
        for i in range(self.frets):
            note = self.notes[(root_index + i) % len(self.notes)]
            string.append(note)
        return string
        
    def assemble_neck(self): # Put together individually created strings
        neck = {fret: [] for fret in range(self.frets)}  # Initialize dict with fret numbers
        for string in self.tuning:
            string_notes = self.make_string(string)  # Get notes for this string
            for fret, note in enumerate(string_notes):
                neck[fret].append(note)  # Append note to corresponding fret
        return neck

    def FING(self, note_names):
        out_chord = []
        for string, fret in self.fretboard.items(): # Iterate over each string in dict
            for note in fret: # Iterate over the notes in each individual string
                out_chord.extend(val for val in note_names if val == note) # Checking for equivilence in chord notes
        return out_chord
        


notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
tuning = ["D", "A", "D", "G", "B", "E"]
frets = 5 # Defining the number of notes generated (including root)
note_names = ['A', 'B', 'D']

guitar = Guitar(tuning, notes, frets)
# print(guitar.assemble_neck())
print(guitar.FING(note_names))