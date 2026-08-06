import os

files = [
    r"c:\Users\Infinix\Desktop\ai-recruiter\frontend\app\page.tsx",
    r"c:\Users\Infinix\Desktop\ai-recruiter\frontend\app\ai-mock-interview\page.tsx",
    r"c:\Users\Infinix\Desktop\ai-recruiter\frontend\app\interview-questions\page.tsx",
]

replacements = [
    ("bg-zinc-50", "bg-zinc-950"),
    ("bg-white", "bg-zinc-900"),
    ("border-zinc-100", "border-zinc-800"),
    ("border-zinc-200", "border-zinc-800"),
    ("text-zinc-900", "text-white"),
    ("text-zinc-800", "text-zinc-200"),
    ("text-zinc-700", "text-zinc-300"),
    ("text-zinc-600", "text-zinc-400"),
    ("bg-zinc-100", "bg-zinc-800"),
    ("bg-zinc-200", "bg-zinc-700"),
    ("hover:bg-zinc-100", "hover:bg-zinc-800"),
    ("hover:bg-zinc-200", "hover:bg-zinc-700"),
    ("shadow-[0_8px_30px_rgba(0,0,0,0.04)]", "shadow-xl shadow-black/40"),
    ("shadow-[0_2px_10px_rgba(0,0,0,0.02)]", "shadow-lg shadow-black/40"),
    ("bg-zinc-900 text-white", "bg-white text-zinc-950"),
    ("bg-zinc-900 hover:bg-zinc-800 text-white", "bg-white hover:bg-zinc-200 text-zinc-950"),
    ("hover:bg-zinc-800", "hover:bg-zinc-200"),
    ("disabled:bg-zinc-200", "disabled:bg-zinc-800"),
    ("disabled:text-zinc-400", "disabled:text-zinc-500"),
    ("bg-zinc-900", "bg-white"),
    ("text-white", "text-zinc-950"),
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # We need to be careful with text-white because bg-zinc-900 became bg-white
        # But wait, replacing bg-zinc-900 text-white directly handles both.
        # Let's apply replacements in order.
        for old, new in replacements:
            content = content.replace(old, new)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")
