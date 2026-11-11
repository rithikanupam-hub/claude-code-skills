# usage: python3 sheets.py <capture>/<page>   → sheet-<page>-d.jpg / sheet-<page>-m.jpg in <capture>
import sys, glob, os
from PIL import Image
page = sys.argv[1]; out = os.path.dirname(page.rstrip('/'))
for dv, cols, w in [('m', 6, 250), ('d', 4, 480)]:
    fs = sorted(glob.glob(f'{page}/{dv}-*.jpg'))
    if not fs: continue
    ims = [Image.open(f) for f in fs]; h = int(ims[0].height * w / ims[0].width)
    S = Image.new('RGB', (cols * w, ((len(ims) + cols - 1) // cols) * h), 'white')
    for i, im in enumerate(ims): S.paste(im.resize((w, h)), ((i % cols) * w, (i // cols) * h))
    S.save(f'{out}/sheet-{os.path.basename(page.rstrip("/"))}-{dv}.jpg', quality=60); print(dv, len(ims))
