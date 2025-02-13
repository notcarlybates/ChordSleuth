import pandas as pd

df = pd.read_csv("./data/FING/chord-fingers.csv", sep = ';')

dropped_columns = ["CHORD_STRUCTURE", "FINGER_POSITIONS", "NOTE_NAMES"]
combined_uniques = ["CHORD_ROOT", "CHORD_TYPE"]

grouping = df.groupby(combined_uniques)

df_dropped = df.drop(dropped_columns, axis=1)

unique_types = df[["CHORD_ROOT", "CHORD_TYPE", "CHORD_STRUCTURE"]].drop_duplicates()

unique_types.to_csv("./data/chords-db", header = True, index = False)

df_updated = pd.read_csv("./data/chords-db")

unique_values = df_updated["CHORD_TYPE"].value_counts()

print(unique_values)