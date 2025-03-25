from csv import DictReader

structures = {
    # Major & Perfect
    "1": 0,
    "2": 2,
    "3": 4,
    "4": 5,
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

test_notes = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"]
test_mods = ['maj', 'min', '7', 'maj7', 'sus4', 'dim', 'aug']
chord_struct = {
    '7': ['1', '3', '5', 'b7'],
    'dim7': ['1', 'b3', 'b5', 'bb7'],
    'aug': ['1', '3', '#5'],
    'maj': ['1', '3', '5'],
    'm': ['1', 'b3', '5'],
    '7b5': ['1', '3', 'b5', 'b7'],
    'm7': ['1', 'b3', '5', 'b7'],
    'dim': ['1', 'b3', 'b5'],
    '6': ['1', '3', '5', '6'],
    '7(#5)': ['1', '3', '#5', 'b7'],
    '7sus4': ['1', '4', '5', 'b7'],
    'maj7': ['1', '3', '5', '7'],
    '5': ['1', '5'],
    'm6': ['1', 'b3', '5', '6'],
    'sus4': ['1', '4', '5']
}

class Chord:
    def __init__(self, root, mod):
        self.root = root
        self.mod = mod
        self.notes = []

    def calc_notes(self):
        struct = chord_struct.get(self.mod)
        if struct is None:
            raise ValueError(f"Chord modifier '{self.mod}' not found in chord_struct.")
        
        root_index = test_notes.index(self.root)
        
        for i in struct:
            interval = structures.get(i)
            if interval is None:
                raise ValueError(f"Interval '{i}' not found in structures.")
            
            note_index = (root_index + interval) % len(test_notes)
            note = test_notes[note_index]
            self.notes.append(note)
        
        return self.notes

# Example usage:
gmaj7 = Chord('G', '5')
g_notes = gmaj7.calc_notes()
print(g_notes)
