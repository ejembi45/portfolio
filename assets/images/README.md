# Image assets

`profile.jpg` — hero portrait, square crop (800×800), head and shoulders.

Generate it from the original with:

```sh
python3 -c "
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open('SOURCE.jpeg')).convert('RGB')
w, h = im.size
side = round(0.48 * h)
left = max(0, min(round(0.64 * w - side / 2), w - side))
top  = max(0, min(round(0.485 * h - side / 2), h - side))
out = im.crop((left, top, left + side, top + side)).resize((800, 800), Image.LANCZOS)
out.save('profile.jpg', 'JPEG', quality=88, optimize=True, progressive=True)
"
```

If `profile.jpg` is missing, the hero falls back to a monogram card — the page
does not break.
