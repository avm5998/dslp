import pandas as pd
import re

def load_file(file_name, appending_string="./uploads/"):
    df = pd.read_csv(appending_string + file_name)
    # replacing with '_'  
    df = df.rename(columns=lambda x: re.sub(r'\W+', '_', x))
    return df


def get_snapshot(file_data_frame, snapshot_size):
    return file_data_frame.head(n=snapshot_size)
