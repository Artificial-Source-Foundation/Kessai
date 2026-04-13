import os
import glob
import re

replacements = {
    # Text colors
    r'text-emerald-\d+': 'text-success',
    r'text-green-\d+': 'text-success',
    r'text-amber-\d+': 'text-warning',
    r'text-yellow-\d+': 'text-warning',
    r'text-red-\d+': 'text-destructive',
    r'text-rose-\d+': 'text-destructive',
    r'text-blue-\d+': 'text-info',
    r'text-cyan-\d+': 'text-info',
    
    # Background colors
    r'bg-emerald-\d+': 'bg-success',
    r'bg-green-\d+': 'bg-success',
    r'bg-amber-\d+': 'bg-warning',
    r'bg-yellow-\d+': 'bg-warning',
    r'bg-red-\d+': 'bg-destructive',
    r'bg-rose-\d+': 'bg-destructive',
    r'bg-blue-\d+': 'bg-info',
    r'bg-cyan-\d+': 'bg-info',
    
    # Border colors
    r'border-emerald-\d+': 'border-success',
    r'border-green-\d+': 'border-success',
    r'border-amber-\d+': 'border-warning',
    r'border-yellow-\d+': 'border-warning',
    r'border-red-\d+': 'border-destructive',
    r'border-rose-\d+': 'border-destructive',
    r'border-blue-\d+': 'border-info',
    r'border-cyan-\d+': 'border-info',

    # Ring colors
    r'ring-red-\d+': 'ring-destructive',
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
