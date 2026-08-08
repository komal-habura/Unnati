import os
import shutil
import glob

base_dir = '/Users/komal-14708/youth-girls-forum'

if not os.path.exists(base_dir):
    print(f"Error: Directory {base_dir} not found.")
    exit(1)

os.chdir(base_dir)

# Create directories
os.makedirs('assets/images', exist_ok=True)
os.makedirs('assets/css', exist_ok=True)

# Move images
image_files = glob.glob('*.png') + glob.glob('*.svg')
for f in image_files:
    try:
        shutil.move(f, os.path.join('assets/images', f))
        print(f"Moved {f} to assets/images/")
    except Exception as e:
        print(f"Could not move {f}: {e}")

# Move styles
if os.path.exists('styles.css'):
    try:
        shutil.move('styles.css', os.path.join('assets/css', 'styles.css'))
        print("Moved styles.css to assets/css/")
    except Exception as e:
        print(f"Could not move styles.css: {e}")

print("✅ Assets moved successfully!")
