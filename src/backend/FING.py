import guitar
from guitar import Guitar

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

chord_structure = ['b7', '9', '11', '13']
# note_names = []




# class Fing(Guitar, String):

#     def __init__(structures, input_general, input_precise):
#         self.structures = dict.structures
#         self.input_general = input_general
#         self.input_precise = input_precise

#     def calc_notes(Guitar(tuning, notes, frets), chord_structure) # Calculate the notes needed for a chord
#         for element in chord_structure:
#             if element in structures:
#                 semitones = structures[element] # Calculate the semitone adjustment to root note
#                 chord.append(Guitar.notes[(root_index + semitones) % len(self.notes)]) # Add the calculated note to the FING-detectable note names list (chord note representation)
#         return note_names

notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
tuning = ["D", "A", "D", "G", "B", "E"]
frets = 5
    
def FING(neck, note_names, estimate):

    out_chord = []
    # estimate = [] # Will hold list of neck coordinates
    # range_val = 3

    ''' 
    def calc_range(neck, estimate)
    FOR i in estimate[] # Locks in location
        If  estimate[i] exists in note_names:
            append estimate[i] to out_chord[]
            return out_chord

            for out_chord 

            upper_range = estimate[[i][j - range_val]]

            range = neck
            return range
    ELSE:
        throw error "This location does not contain any notes that match the chord."
    '''
    for string, fret in neck.items():
        for note in fret:
            out_chord.extend(note for note in note_names if note == key)