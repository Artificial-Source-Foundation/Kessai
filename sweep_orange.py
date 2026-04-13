import os
import glob
import re

replacements = {
    r'text-orange-\d+': 'text-warning',
    r'bg-orange-\d+': 'bg-warning',
    r'border-orange-\d+': 'border-warning',
    r'ring-orange-\d+': 'ring-warning',
    r'text-amber-\d+': 'text-warning',
    r'bg-amber-\d+': 'bg-warning',
    r'border-amber-\d+': 'border-warning',
    r'ring-amber-\d+': 'ring-warning',
    r'text-emerald-\d+': 'text-success',
    r'bg-emerald-\d+': 'bg-success',
    r'border-emerald-\d+': 'border-success',
    r'ring-emerald-\d+': 'ring-success',
}

files = glob.glob('src/**/*.ts', recursive=True) + glob.glob('src/**/*.tsx', recursive=True)

modified_files = []

for f in files:
    with open(f, 'r') as file:
        content = file.read()
        
    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)
        
    if new_content != content:
        with open(f, 'w') as file:
            file.write(new_content)
        modified_files.append(f)

print(modified_files)
