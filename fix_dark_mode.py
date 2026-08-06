import os
import re

files = [
    r"c:\Users\Infinix\Desktop\ai-recruiter\frontend\app\page.tsx",
    r"c:\Users\Infinix\Desktop\ai-recruiter\frontend\app\ai-mock-interview\page.tsx",
    r"c:\Users\Infinix\Desktop\ai-recruiter\frontend\app\interview-questions\page.tsx",
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 1. Cards and main elements: bg-white -> bg-zinc-900
        content = content.replace("bg-white", "bg-zinc-900")
        
        # 2. Text that was converted to text-zinc-950 -> text-white
        content = content.replace("text-zinc-950", "text-white")
        
        # 3. Now we have everything dark. Let's fix primary buttons to be light!
        # Primary buttons typically have hover:bg-zinc-200. Let's find those and make them white.
        # e.g. bg-zinc-900 text-white hover:bg-zinc-200 -> bg-white text-zinc-950 hover:bg-zinc-200
        
        # Let's just use regex to find any class string containing hover:bg-zinc-200 and ensure bg and text are correct.
        def fix_button(match):
            cls = match.group(0)
            if "hover:bg-zinc-200" in cls:
                cls = cls.replace("bg-zinc-900", "bg-white")
                cls = cls.replace("text-white", "text-zinc-950")
            return cls
            
        content = re.sub(r'className="[^"]*"', fix_button, content)
        
        # Also fix the circular active indicators or steps that might need to be white
        # Like: "bg-white text-zinc-950" if they had no hover.
        # Actually, let's just make the icons inside the buttons dark.
        # If an SVG or icon has text-white inside a button that is now bg-white, it will be invisible.
        # But lucide-react icons inherit color via `currentColor`, so if the button is text-zinc-950, the icon is too!
        
        # Let's fix specific things that might look bad:
        # focus:bg-zinc-900 for inputs -> focus:bg-zinc-950? No, inputs are bg-zinc-950, focus:bg-zinc-900 is good (slightly lighter).
        # selection:bg-zinc-200 -> selection:bg-cyan-500/30 (looks better in dark mode)
        content = content.replace("selection:bg-zinc-200", "selection:bg-cyan-500/30")
        
        # In page.tsx there's a ring-zinc-900/10 -> ring-white/10
        content = content.replace("ring-zinc-900/10", "ring-white/10")
        content = content.replace("ring-zinc-900/20", "ring-white/20")
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {file_path}")
    else:
        print(f"File not found: {file_path}")
