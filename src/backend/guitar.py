from chordInterpreter import Chord
from itertools import product

class Guitar:
    def __init__(self, tuning, notes, frets, fret_guess, root, mod):
        self.tuning = tuning
        self.notes = notes
        self.frets = frets
        self.fret_guess = fret_guess
        self.chord = Chord(root, mod)
        self.mod = mod
        self.root = root
        self.note_names = self.chord.calc_notes()
        self.fretboard = self.assemble_neck()
        self.sliced_fretboard = self.find_range()
        self.note_matches = self.find_match(self.note_names)
        self.FING = self.closest_notes()
        self.validate_fingering()
        self.ensure_root_note()

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
        min_fret = max(self.fret_guess - 2, 0)
        max_fret = min(self.fret_guess + 2, self.frets)

        fret_range = {
            string: {fret: note for fret, note in frets.items() 
                    if (min_fret <= fret <= max_fret) or fret == 0}
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
        """Find the optimal fingering for the chord"""
        # First pass: Find all possible note options for each string
        note_options = {}
        for string in range(len(self.tuning)-1, -1, -1):  # Process from thinnest to thickest
            fret_data = self.note_matches[string]
            options = []
            for fret, note in fret_data.items():
                cost = abs(fret - self.fret_guess) if fret != 0 else -1
                options.append({
                    'fret': fret,
                    'note': note,
                    'cost': cost,
                    'is_open': fret == 0,
                    'is_muted': False,
                    'string': string
                })
            # Add muted string option
            options.append({
                'fret': 'x',
                'note': None,
                'cost': 0,
                'is_open': False,
                'is_muted': True,
                'string': string
            })
            note_options[string] = sorted(options, key=lambda x: x['cost'])

        # Find the highest string (thinnest) that can play the root note
        root_note = self.chord.root
        root_string_options = []
        for string in range(len(self.tuning)-1, -1, -1):  # Check from thinnest to thickest
            for option in note_options[string]:
                if option['note'] == root_note and not option['is_muted']:
                    root_string_options.append((string, option))
                    break

        if not root_string_options:
            return self.fallback_solution(note_options)

        best_solution = None
        best_score = float('inf')
        required_notes = set(self.note_names)

        # Try each possible root string position from thinnest to thickest
        for root_string, root_option in sorted(root_string_options, key=lambda x: -x[0]):
            # Strings thicker than root must be muted
            strings_thicker = [s for s in note_options.keys() if s > root_string]
            # Strings thinner than root can be played
            strings_thinner = [s for s in note_options.keys() if s < root_string]
            
            # Generate possible combinations for strings thinner than root
            thinner_options = [note_options[s] for s in strings_thinner]
            possible_thinner_combinations = product(*thinner_options) if thinner_options else [[]]
            
            for thinner_combo in possible_thinner_combinations:
                # Build full candidate solution
                candidate = []
                
                # Add strings thinner than root (higher pitches)
                candidate.extend(thinner_combo)
                
                # Add root string
                candidate.append(root_option)
                
                # Add muted strings thicker than root (must mute lower strings)
                for s in strings_thicker:
                    candidate.append({
                        'fret': 'x',
                        'note': None,
                        'cost': 0,
                        'is_open': False,
                        'is_muted': True,
                        'string': s
                    })
                
                # Check if all required notes are present
                played_notes = {opt['note'] for opt in candidate if not opt['is_muted']}
                if not required_notes.issubset(played_notes):
                    continue
                
                # Calculate score
                score = self.calculate_solution_score(candidate)
                
                if score < best_score:
                    best_score = score
                    best_solution = candidate

        if not best_solution:
            return self.fallback_solution(note_options)
            
        # Convert to output format (maintaining original string order)
        selected = {}
        for opt in best_solution:
            selected[opt['string']] = {
                'fret': opt['fret'],
                'note': opt['note'],
                'cost': opt['cost']
            }
            
        return selected

    def calculate_solution_score(self, solution):
        """Calculate a score for a potential solution considering various factors"""
        frets_used = []
        fingers_used = 0
        open_count = 0
        mute_count = 0
        total_cost = 0
        
        for opt in solution:
            if opt['is_muted']:
                mute_count += 1
            elif opt['is_open']:
                open_count += 1
                total_cost += opt['cost']
            else:
                frets_used.append(opt['fret'])
                fingers_used += 1
                total_cost += opt['cost']
        
        # Rule penalties
        penalties = 0
        
        # 1. Check fret span
        if frets_used:
            fret_span = max(frets_used) - min(frets_used)
            if fret_span > 4:
                penalties += 1000  # Large penalty for breaking 4-fret rule
            else:
                penalties += fret_span * 2  # Smaller penalty for wider spans
        
        # 2. Check finger count
        if fingers_used > 4:
            penalties += 1000  # Large penalty for breaking 4-finger rule
        
        # 3. Check mute positions
        mute_positions = [i for i, opt in enumerate(solution) if opt['is_muted']]
        if mute_positions:
            # Check if muted strings are contiguous and on the low end
            if not (mute_positions == list(range(0, len(mute_positions)))):
                penalties += 500  # Penalty for mutes not being on lowest strings
        
        # 4. Bonus for open strings
        open_bonus = open_count * -3  # Strong preference for open strings
        
        # 5. Bonus for root being on lowest string
        if solution[0]['note'] == self.chord.root and not solution[0]['is_muted']:
            open_bonus -= 2  # Small additional bonus
        
        return total_cost + penalties + open_bonus

    def fallback_solution(self, note_options):
        """Fallback solution when root note can't be placed properly"""
        # Try to find any solution that includes all notes
        required_notes = set(self.note_names)
        best_solution = None
        best_score = float('inf')
        
        for combo in product(*[note_options[s] for s in note_options]):
            played_notes = {opt['note'] for opt in combo if not opt['is_muted']}
            if required_notes.issubset(played_notes):
                score = self.calculate_solution_score(combo)
                if score < best_score:
                    best_score = score
                    best_solution = combo
        
        if not best_solution:
            # Final fallback: just return the first option for each string
            best_solution = [note_options[s][0] for s in note_options]
        
        selected = {}
        for opt in best_solution:
            selected[opt['string']] = {
                'fret': opt['fret'],
                'note': opt['note'],
                'cost': opt['cost']
            }
        return selected

    def validate_fingering(self):
        """Additional validation and adjustment of the fingering"""
        root_note = self.chord.root
        root_found = False
        
        for string in range(len(self.tuning)-1, -1, -1):  # Check from thinnest to thickest
            if string not in self.FING:
                continue
                
            data = self.FING[string]
            if not isinstance(data, dict):
                continue
                
            if not root_found:
                if data.get('note') == root_note:
                    root_found = True
                else:
                    # Strings thicker than root must be muted
                    if data.get('fret') != 'x':
                        self.FING[string] = {
                            'fret': 'x',
                            'note': None,
                            'cost': 0,
                            'is_muted': True,
                            'is_open': False
                        }
            else:
                # Strings thinner than root can be played
                pass
        
        if not root_found:
            for string in range(len(self.tuning)-1, -1, -1):
                if string not in self.FING:
                    continue
                    
                data = self.FING[string]
                if isinstance(data, dict) and data.get('note') in self.note_names:
                    # Make this the root by muting strings thicker than it
                    for s in range(string + 1, len(self.tuning)):
                        if isinstance(self.FING.get(s), dict):
                            self.FING[s] = {
                                'fret': 'x',
                                'note': None,
                                'cost': 0,
                                'is_muted': True,
                                'is_open': False
                            }
                    break

    def ensure_root_note(self):
        """Ensure the root note is included in the fingering"""
        played_notes = {data['note'] for data in self.FING.values() 
                       if isinstance(data, dict) and not data.get('is_muted', False)}
        
        if self.root not in played_notes:
            # Find the best string to add the root note
            for string in sorted(self.FING.keys(), reverse=True):
                current = self.FING[string]
                if isinstance(current, dict) and current.get('is_muted', False):
                    # Try to find root note on this string
                    for fret, note in self.note_matches[string].items():
                        if note == self.root:
                            self.FING[string] = {
                                'fret': fret,
                                'note': note,
                                'cost': abs(fret - self.fret_guess)
                            }
                            return