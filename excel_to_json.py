"""
Simple converter: reads an Excel file (first sheet) and writes `events.json`.
Expected columns: date (YYYY-MM-DD), title, location, description, slug, image (optional), tag (optional), contact (optional)
Usage:
    python excel_to_json.py events.xlsx
Requires: pandas, openpyxl
Install: pip install pandas openpyxl
"""
import sys
import json
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print('pandas is required. Install with: pip install pandas openpyxl')
    sys.exit(1)

if len(sys.argv) < 2:
    print('Usage: python excel_to_json.py <events.xlsx> [output.json]')
    sys.exit(1)

infile = Path(sys.argv[1])
outfile = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('events.json')

if not infile.exists():
    print(f'File not found: {infile}')
    sys.exit(1)

df = pd.read_excel(infile)
# Normalize column names
cols = {c: c.strip().lower() for c in df.columns}
df.rename(columns=cols, inplace=True)

records = []
for _, row in df.iterrows():
    rec = {}
    if 'date' in row and not pd.isna(row['date']):
        val = row['date']
        if hasattr(val, 'strftime'):
            rec['date'] = val.strftime('%Y-%m-%d')
        else:
            rec['date'] = str(val)
    if 'title' in row and not pd.isna(row['title']):
        rec['title'] = str(row['title'])
    if 'location' in row and not pd.isna(row['location']):
        rec['location'] = str(row['location'])
    if 'description' in row and not pd.isna(row['description']):
        rec['description'] = str(row['description'])
    if 'slug' in row and not pd.isna(row['slug']):
        rec['slug'] = str(row['slug'])
    else:
        # generate slug from title
        if 'title' in rec:
            rec['slug'] = rec['title'].lower().strip().replace(' ', '-').replace("'", '')
    if 'image' in row and not pd.isna(row['image']):
        rec['image'] = str(row['image'])
    if 'tag' in row and not pd.isna(row['tag']):
        rec['tag'] = str(row['tag'])
    if 'contact' in row and not pd.isna(row['contact']):
        rec['contact'] = str(row['contact'])
    records.append(rec)

with open(outfile, 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f'Wrote {len(records)} events to {outfile}')
