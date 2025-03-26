from chordInterpreter import Chord

class Guitar:

    '''Hey, you!

        Yeah, you! The one reading this!

        Are you good at software development?

        Yeah, well I am too! I SWEAR!!!

        Don't look too closely at this current setup.
        It works for now, but I have some technical debt to repay.

        Refactoring comes early April. Stay tuned.
    '''

    def __init__(self, tuning, notes, frets, fret_guess, root, mod):

        self.tuning = tuning
        self.notes = notes
        self.frets = frets
        self.fret_guess = fret_guess
        self.chord = Chord(root, mod)
        self.mod = mod
        self.note_names = self.chord.calc_notes()
        self.fretboard = self.assemble_neck()
        self.sliced_fretboard = self.find_range()
        self.note_matches = self.find_match(self.note_names)
        self.FING = self.closest_notes()

    def make_string(self, root_note):
        string = []
        root_index = self.notes.index(root_note)
        for i in range(self.frets):
            note = self.notes[(root_index + i) % len(self.notes)]
            string.append(note)
        return string
        
    def assemble_neck(self):
        neck = {string: {} for string, root_note in enumerate(self.tuning)}
        for string, root_note in enumerate(self.tuning):
            string_notes = self.make_string(root_note)
            for fret, note in enumerate(string_notes):
                neck[string][fret] = note
        return neck

    def find_range(self):
        min_fret = max(self.fret_guess - 4, 0)
        max_fret = min(self.fret_guess + 4, self.frets)

        fret_range = {
            string: {fret: note for fret, note in frets.items() if min_fret <= fret <= max_fret or fret == 0}
            for string, frets in self.fretboard.items()
        }

        return fret_range

    def find_match(self, note_names):
        out_chord = {string: {} for string in self.fretboard.keys()}
        for string, fret in self.sliced_fretboard.items():
            for index, note in fret.items():
                if note in note_names:
                    out_chord[string][index] = note
        return out_chord
    
    def closest_notes(self):
        notes = self.note_matches.items()
        DP = {string: {} for string, _ in notes}
        min_fret, max_fret = self.fret_guess, self.fret_guess

        for string, fret_data in notes:
            for fret, note in fret_data.items():
                cost = abs(fret - self.fret_guess) if fret != 0 else 0
                DP[string][fret] = {
                    'note': note,
                    'cost': cost
                }

        selected = {}

        for string, fret_data in DP.items():
            best_choice = None
            for fret, data in fret_data.items():
                if fret != 0:
                    min_fret, max_fret = min(min_fret, fret), max(max_fret, fret)
                if best_choice is None or (data['cost'] < 4 and data['cost'] < best_choice['cost']):
                    best_choice = {'fret': fret, 'note': data['note'], 'cost': data['cost']}

            selected[string] = best_choice if best_choice else 'null'

        return selected


# # ---- Usage ----
# notes = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"]
# tuning = ["E", "A", "D", "G", "B", "E"]
# frets = 25
# root = 'D'
# mod = 'sus4'

# guitar = Guitar(tuning, notes, frets, root, mod)
# print(f'\nOutput:\n{guitar.FING}\n')
