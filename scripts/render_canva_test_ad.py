from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out" / "canva-test-radical-edge-proof-ad.png"
OUT.parent.mkdir(exist_ok=True)

W, H = 1080, 1350
INK = "#11100f"
PAPER = "#ece8df"
ACID = "#e7ff43"
RED = "#ff4d2e"
MUTED = "#6c6862"
LINE = "#9f988d"
PANEL = "#d9d3c8"
BAR = "#c4bdb0"


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def draw_wrapped(draw, xy, text, max_chars, fill, font_obj, line_gap=8):
    x, y = xy
    lines = []
    for paragraph in text.split("\n"):
        lines.extend(wrap(paragraph, max_chars) or [""])
    for line in lines:
        draw.text((x, y), line, fill=fill, font=font_obj)
        y += font_obj.size + line_gap
    return y


img = Image.new("RGB", (W, H), PAPER)
draw = ImageDraw.Draw(img)

draw.rectangle((0, 0, 18, H), fill=ACID)
draw.text((78, 92), "RESULT + PROOF STACK / PROOF AD", fill=INK, font=font(21, True), spacing=8)

headline = "$10,000 closed in 2 days\nfrom organic leads"
draw.multiline_text((78, 148), headline, fill=INK, font=font(76, True), spacing=10)

proof_y = 430
draw.rectangle((78, proof_y, 1002, proof_y + 460), fill=PANEL, outline=LINE, width=2)
draw.rectangle((78, proof_y, 1002, proof_y + 62), fill=BAR)
for x in [114, 140, 166]:
    draw.ellipse((x - 7, proof_y + 31 - 7, x + 7, proof_y + 31 + 7), fill=RED)
draw.text((807, proof_y + 23), "PROOF ASSET", fill=INK, font=font(15, True))

for y, width in [(proof_y + 124, 720), (proof_y + 178, 610), (proof_y + 232, 380)]:
    draw.rounded_rectangle((140, y, 140 + width, y + 12), radius=5, fill="#b8b1a6")
draw.rectangle((140, proof_y + 158, 350, proof_y + 202), fill="#252321")

bubble = (510, proof_y + 245, 932, proof_y + 405)
draw.rounded_rectangle(bubble, radius=22, fill="#f8f5ee")
proof_text = "$30k+ closed from organic leads.\nClaim context to verify before publishing."
draw_wrapped(draw, (542, proof_y + 276), proof_text, 34, INK, font(26, True), line_gap=7)

draw.line((78, 946, 1002, 946), fill=INK, width=4)
interpretation = "This is what content looks like when it\nbuilds recognition, trust and demand."
draw.multiline_text((78, 996), interpretation, fill=INK, font=font(39, True), spacing=7)

draw.text((78, 1235), "RADICAL EDGE", fill=INK, font=font(31, True))
draw.rectangle((656, 1174, 1002, 1276), fill=ACID)
draw_wrapped(draw, (690, 1210), "Join the 1-day Radical Edge masterclass", 27, INK, font(22, True), line_gap=5)
draw.text((78, 1305), "Client proof. Example only. Results vary.", fill=MUTED, font=font(14))

img.save(OUT)
print(OUT)
