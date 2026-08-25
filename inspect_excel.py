import os
import json
from pathlib import Path

try:
    import pandas as pd
except Exception as e:
    print('IMPORT_ERROR:', e)
    raise

path = Path('images/events/unnati Events.xlsx')
print('exists:', path.exists(), 'abs:', path.resolve())

if not path.exists():
    raise SystemExit('xlsx file not found')

df = pd.read_excel(path)
print('columns:', list(df.columns))
print('rows:', len(df))
print(df.head(10).to_string(index=False))
