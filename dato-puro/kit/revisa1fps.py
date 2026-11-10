import glob, os, subprocess, sys
from PIL import Image, ImageDraw
v, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in glob.glob(f'{out}/f_*.png'):
    os.remove(f)
subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-vf', 'fps=1,scale=270:480', f'{out}/f_%02d.png'], check=True)
fs = sorted(glob.glob(f'{out}/f_*.png'))
for h in range(0, len(fs), 20):
    parte = fs[h:h + 20]
    im = Image.new('RGB', (270 * 10, 480 * 2))
    for i, f in enumerate(parte):
        x, y = (i % 10) * 270, (i // 10) * 480
        im.paste(Image.open(f), (x, y))
        ImageDraw.Draw(im).text((x + 5, y + 460), os.path.basename(f)[2:4] + 's', fill=(255, 255, 0))
    im.save(f'{out}/hoja_{h // 20}.jpg', quality=85)
print(len(fs), 'cuadros')
