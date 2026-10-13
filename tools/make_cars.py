import os, sys
from PIL import Image, ImageDraw, ImageFilter
out = sys.argv[1]
S = 1024
def lighten(c, f): return tuple(min(255, int(v + (255 - v) * f)) for v in c)
def darken(c, f): return tuple(int(v * (1 - f)) for v in c)
TIRE, HUB, GLASS = (21, 22, 28), (205, 210, 220), (33, 44, 66)

def wheel(d, x, y, r):
    d.ellipse([x - r, y - r, x + r, y + r], fill=TIRE)
    d.ellipse([x - r * .55, y - r * .55, x + r * .55, y + r * .55], fill=HUB)
    d.ellipse([x - r * .18, y - r * .18, x + r * .18, y + r * .18], fill=TIRE)

def car(kind, d, body):
    if kind == "compacto":
        d.polygon([(170,600),(170,525),(255,478),(385,385),(640,385),(765,478),(850,505),(865,600)], fill=body)
        d.polygon([(405,415),(625,415),(715,478),(335,478)], fill=GLASS)
        d.line([(520,415),(520,478)], fill=body, width=14)
        wheel(d, 305, 610, 76); wheel(d, 720, 610, 76)
    elif kind == "sedan":
        d.polygon([(140,612),(140,525),(300,495),(405,402),(620,402),(725,492),(890,515),(890,612)], fill=body)
        d.polygon([(425,428),(520,428),(520,488),(360,488)], fill=GLASS)
        d.polygon([(540,428),(610,428),(685,488),(540,488)], fill=GLASS)
        wheel(d, 290, 615, 74); wheel(d, 745, 615, 74)
    elif kind == "suv":
        d.polygon([(150,612),(150,480),(222,385),(742,385),(832,470),(885,500),(885,612)], fill=body)
        d.polygon([(250,412),(480,412),(480,470),(205,470)], fill=GLASS)
        d.polygon([(500,412),(730,412),(795,470),(500,470)], fill=GLASS)
        d.rectangle([225, 360, 745, 378], fill=darken(body, 0.35))
        wheel(d, 295, 618, 88); wheel(d, 745, 618, 88)
    elif kind == "deportivo":
        d.polygon([(130,612),(130,548),(300,505),(455,432),(605,432),(785,508),(892,545),(892,612)], fill=body)
        d.polygon([(480,455),(590,455),(700,505),(410,505)], fill=GLASS)
        d.rectangle([128, 492, 215, 512], fill=darken(body, 0.35)); d.rectangle([160, 505, 175, 548], fill=darken(body, 0.35))
        wheel(d, 285, 618, 72); wheel(d, 748, 618, 72)
    elif kind == "hipercar":
        d.polygon([(185,600),(305,545),(445,505),(565,505),(705,558),(905,588),(905,612),(185,612)], fill=body)
        d.ellipse([465, 450, 575, 520], fill=GLASS)
        d.rectangle([105, 465, 195, 500], fill=darken(body, 0.3)); d.rectangle([140, 495, 158, 585], fill=darken(body, 0.3))
        d.rectangle([835, 596, 945, 622], fill=darken(body, 0.3))
        wheel(d, 275, 618, 98); wheel(d, 735, 618, 88)

def make(kind, badge, level):
    base = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    mask = Image.new("L", (S, S), 0); ImageDraw.Draw(mask).rounded_rectangle([60, 60, 964, 964], 190, fill=255)
    grad = Image.new("RGBA", (S, S))
    gd = ImageDraw.Draw(grad)
    for y in range(S):
        t = y / S; gd.line([(0, y), (S, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(lighten(badge, .25), darken(badge, .35))) + (255,))
    base.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle([60, 60, 964, 964], 190, outline=lighten(badge, .55), width=14)
    d.line([(130, 735), (894, 735)], fill=(255, 255, 255, 70), width=10)  # asfalto
    car(kind, d, (250, 250, 252))
    for i in range(5):  # nivel de poder: 1 a 5 puntos
        x = 512 + (i - 2) * 70
        d.ellipse([x - 20, 840 - 20, x + 20, 840 + 20], fill=(255, 255, 255, 255) if i < level else (255, 255, 255, 70))
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0)); sh.paste((0, 0, 0, 120), (0, 22), mask); sh = sh.filter(ImageFilter.GaussianBlur(20)); sh.alpha_composite(base)
    return sh

specs = [("compacto", (84, 120, 176)), ("sedan", (46, 160, 107)), ("suv", (224, 126, 38)), ("deportivo", (214, 48, 58)), ("hipercar", (140, 74, 214))]
os.makedirs(f"{out}/assets/cars", exist_ok=True)
imgs = {}
for i, (k, c) in enumerate(specs):
    im = make(k, c, i + 1); imgs[k] = im
    im.resize((256, 256), Image.LANCZOS).save(f"{out}/assets/cars/{k}.png")

# Íconos de la app: hípercar sobre asfalto
BG = (13, 14, 19, 255)
def place(k, canvas=BG):
    b = Image.new("RGBA", (S, S), canvas); g = imgs["hipercar"].resize((int(S * k), int(S * k)), Image.LANCZOS)
    b.alpha_composite(g, ((S - g.width) // 2, (S - g.height) // 2)); return b
im = f"{out}/assets/images"
place(0.78).convert("RGB").save(f"{im}/icon.png")
Image.new("RGBA", (S, S), BG).save(f"{im}/android-icon-background.png")
fg = place(0.58, (0, 0, 0, 0)); fg.save(f"{im}/android-icon-foreground.png")
mono = Image.new("RGBA", (S, S), (0, 0, 0, 0)); mono.paste((255, 255, 255, 255), (0, 0), fg.getchannel("A")); mono.save(f"{im}/android-icon-monochrome.png")
place(0.8, (0, 0, 0, 0)).save(f"{im}/splash-icon.png")
place(0.95).resize((48, 48), Image.LANCZOS).convert("RGB").save(f"{im}/favicon.png")
# hoja de recursos para el reporte
sheet = Image.new("RGBA", (5 * 256 + 6 * 16, 256 + 32), (23, 26, 34, 255))
for i, (k, _) in enumerate(specs): sheet.alpha_composite(Image.open(f"{out}/assets/cars/{k}.png"), (16 + i * 272, 16))
sheet.save(sys.argv[2])
print("ok")
