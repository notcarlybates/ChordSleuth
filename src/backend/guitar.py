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
        self.sliced_fretboard = self.find_range()
        self.note_matches = self.find_match(note_names)
        self.FING = self.closest_notes()

    def make_string(self, root_note): # Creating an individual string based on a root note given in tuning
        string = []
        root_index = self.notes.index(root_note)
        for i in range(self.frets):
            note = self.notes[(root_index + i) % len(self.notes)]
            string.append(note)
        return string
        
    def assemble_neck(self): # Put together individually created strings
        neck = {string: {} for string, root_note in (enumerate(self.tuning))}  # Initialize dict with string numbers

        for string, root_note in enumerate(self.tuning):
            string_notes = self.make_string(root_note)  # Get notes for this string
            for fret, note in enumerate(string_notes):
                neck[string][fret] = note  # Append note to corresponding fret

        return neck

    def find_range(self):
        global fret_guess
        global string_guess
        try:
            string_guess = int(input("Input estimated string: "))  # Convert input to integer
            fret_guess = int(input("Input estimated fret: "))      # Convert input to integer
        except ValueError:
            print("Invalid input! Please enter numbers for string and fret.")
            return
        
        # Define the valid range (greedy, within 4 frets of the guessed fret)
        min_fret = max(fret_guess - 4, 0)  # Ensure it doesn't go below 0
        max_fret = min(fret_guess + 4, self.frets)  # Ensure it doesn't extend beyond fret count

        # Get all notes within the fret range for each string
        fret_range = {
            string: {fret: note for fret, note in frets.items() if min_fret <= fret <= max_fret or fret == 0}
            for string, frets in self.fretboard.items()
        }

        # Get the specific note the user guessed
        guess = self.fretboard.get(string_guess, {}).get(fret_guess, "Invalid input") # Building a filtered version of our existing fretboard

        # print(f"Guessed Note: {guess}")
        # print("Fretboard Slice (within range):")
        # for string, frets in fret_range.items():
        #     print(f"String {string}: {frets}")

        return fret_range # Return sliced fretboard



    def find_match(self, note_names):
        out_chord = {string: {} for string, root_note in enumerate(self.tuning)}
        for string, fret in self.sliced_fretboard.items(): # Iterate over each string in dict
            for index, note in fret.items(): # Iterate over the notes in each individual string
                if note in note_names:
                    out_chord[string][index] = note
        return out_chord
    
    def closest_notes(self):
        
        notes = self.note_matches.items()
        DP = {string: {} for string, _ in notes} # Initializing a nested dict
        min_fret, max_fret = fret_guess, fret_guess
        
        for string, fret in notes: # Initializing cost DP
            
            for fret, note in fret.items():
                if fret != 0:
                    cost = abs(fret - fret_guess)
                else:
                    cost = 0
                DP[string][fret] = {
                    'note': note,
                    'cost': cost
                }
                
        selected = {}
                
        for string, fret in DP.items():
            best_choice = None # Each string has its own best choice
            
            for fret, data in fret.items(): # For each note in the fret range
                    if fret >= min_fret and fret <= max_fret: # If note within sliding range
                        if fret != 0:
                            min_fret, max_fret = min(min_fret, fret), max(max_fret, fret) # Establishing a sliding range
                        if best_choice is None or data['cost'] < 4 and data['cost'] < best_choice['cost']:
                            best_choice = {'fret': fret, 'note': data['note'], 'cost': data['cost']}
                        
                    
            if best_choice: 
                selected[string] = best_choice
                min_fret, max_fret = min(min_fret, best_choice['fret']), max(max_fret, best_choice['fret'])
                
        return selected
                    
        
        
        
        # we are so out here
                    


        # for note in notes:
        # Store distance from estimated fret
        # CONDITIONS:
        # Store in DP table DISTANCE from estimation and if it's been added so far
        # PICK combination of notes with MINIMUM COST while covering EVERY NOTE
        # 



notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
tuning = ["E", "A", "D", "G", "B", "E"]
frets = 25 # Defining the number of notes generated (including root)
# input_note = # Coordinates of predicted chord location 
note_names = ['G', 'B', 'D']

guitar = Guitar(tuning, notes, frets)
# print(guitar.make_string("A"))
# print(guitar.assemble_neck())
print(guitar.find_match(note_names))
print(guitar.FING)