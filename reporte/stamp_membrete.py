import sys, pymupdf
from PIL import Image, ImageChops
src, out, base = sys.argv[1:4]
im = Image.open(f'{base}/img/pdfimg0.png').convert('RGBA')
r, g, b, _ = im.split()
mn = ImageChops.darker(ImageChops.darker(r, g), b)
im.putalpha(mn.point(lambda v: 0 if v >= 250 else 255)); im.save(f'{base}/letterhead.png')
d = pymupdf.open(src)
text = 'PRACTICARIO | FACULTAD DE INGENIERÍA'
size = min(18.0, 350.0 / pymupdf.get_text_length(text, fontname='hebo', fontsize=1))
for p in d:
    p.insert_image(pymupdf.Rect(40, 30.45, 572, 773.7), filename=f'{base}/img/pdfimg0.png', overlay=False)
    p.insert_text((228, 62), text, fontname='hebo', fontsize=size, color=(16/255, 29/255, 97/255))
d.set_metadata({'title': 'Práctica 3: Minijuego interactivo con React Native y Expo', 'author': 'David Alejandro Elizarraraz García; Diego Sastre Villaseñor', 'subject': 'Aplicaciones Móviles'})
d.save(out, deflate=True, garbage=3)
print('paginas', d.page_count, 'size_titulo', round(size, 1))
for i in (0, 3):
    d[i].get_pixmap(dpi=75).save(f'{base}/chk{i+1}.png')
