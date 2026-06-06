import shutil
from pathlib import Path
from PIL import Image

base = Path('assets')
backup = Path('_quarantine/images-backup')
backup.mkdir(parents=True, exist_ok=True)

exts = {'.jpg', '.jpeg', '.png'}
max_side = 1920
quality = 85

count = 0
saved = 0
skipped = 0
errors = 0

for path in sorted(base.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in exts:
        continue

    rel_str = str(path)

    if 'node_modules' in rel_str or '.git' in rel_str:
        skipped += 1
        continue

    try:
        original_size = path.stat().st_size
    except Exception:
        skipped += 1
        continue

    if original_size <= 500 * 1024:
        skipped += 1
        continue

    rel = path.relative_to(base)
    dest = backup / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        shutil.copy2(path, dest)

    try:
        img = Image.open(path)
        img.convert('RGB')

        w, h = img.size
        if w > max_side or h > max_side:
            ratio = min(max_side / w, max_side / h)
            new_w, new_h = int(w * ratio), int(h * ratio)
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        img.save(path, 'JPEG', quality=quality, optimize=True, progressive=True)

        new_size = path.stat().st_size
        reducao = original_size - new_size
        reducao_pct = (reducao / original_size) * 100
        count += 1
        saved += reducao_pct
        print(f"{count}. {rel}\n  {original_size/1024/1024:.2f} MB -> {new_size/1024/1024:.2f} MB (-{reducao_pct:.0f}%)")

    except Exception as e:
        errors += 1
        print(f"ERRO {rel}: {e}")

print(f"\nConcluido: {count} imagens otimizadas, {skipped} ignoradas, {errors} erros.")
if count:
    print(f"Reducao media: {saved/count:.0f}%")
