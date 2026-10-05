"""Tapped In hackathon deck — Romanian, welcome-screen visual language."""

from pathlib import Path

from lxml import etree
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
ASSETS = OUT / "assets"
MOBILE = ROOT / "mobile" / "assets"

FONT = "Helvetica Neue"
W, H = 13.333333, 7.5

INK = RGBColor(0x11, 0x11, 0x11)
BLACK = RGBColor(0x05, 0x05, 0x05)
MUTED = RGBColor(0x73, 0x73, 0x73)
SOFT = RGBColor(0xA3, 0xA3, 0xA3)
LINE = RGBColor(0xE3, 0xE3, 0xE3)
FIELD = RGBColor(0xF6, 0xF6, 0xF6)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLUE = RGBColor(0x26, 0x71, 0xFE)

ALIGN = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}
ANCHOR = {"t": "t", "ctr": "ctr", "b": "b"}


def trim_art(src: Path, dest: Path, pad: int = 28) -> None:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 12 or (r > 246 and g > 246 and b > 246):
                continue
            minx, miny = min(minx, x), min(miny, y)
            maxx, maxy = max(maxx, x), max(maxy, y)
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w - 1, maxx + pad)
    maxy = min(h - 1, maxy + pad)
    im.crop((minx, miny, maxx + 1, maxy + 1)).save(dest)


def logo_mark(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 10 or (r > 242 and g > 242 and b > 242):
                px[x, y] = (255, 255, 255, 0)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dest)


def prepare() -> dict[str, Path]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    logo = ASSETS / "logo.png"
    welcome = ASSETS / "welcome.png"
    signup = ASSETS / "signup.png"
    login = ASSETS / "login.png"
    logo_mark(MOBILE / "logo.png", logo)
    trim_art(MOBILE / "illustarations" / "welcome.png", welcome)
    trim_art(MOBILE / "illustarations" / "sign-up.jpg", signup)
    trim_art(MOBILE / "illustarations" / "login.jpg", login)
    return {"logo": logo, "welcome": welcome, "signup": signup, "login": login}


def write(slide, x, y, w, h, lines, align="left", anchor="t"):
    shape = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    tf.margin_left = Emu(0)
    tf.margin_right = Emu(0)
    tf.margin_top = Emu(0)
    tf.margin_bottom = Emu(0)
    body = tf._txBody.find(qn("a:bodyPr"))
    body.set("anchor", ANCHOR[anchor])
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = ALIGN[align]
        p.space_before = Pt(line.get("before", 0))
        p.space_after = Pt(line.get("after", 0))
        p.line_spacing = line.get("leading", 1.02)
        run = p.add_run()
        run.text = line["text"]
        run.font.name = FONT
        run.font.size = Pt(line.get("size", 18))
        run.font.bold = line.get("bold", False)
        run.font.color.rgb = line.get("color", INK)
        rpr = run._r.get_or_add_rPr()
        latin = rpr.find(qn("a:latin"))
        if latin is None:
            latin = etree.SubElement(rpr, qn("a:latin"))
        latin.set("typeface", FONT)
        if line.get("spc"):
            rpr.set("spc", str(line["spc"]))
    return shape


def rect(slide, x, y, w, h, fill, radius=0.22, line=None):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(1)
    shape.adjustments[0] = min(0.5, radius / min(w, h))
    return shape


def oval(slide, x, y, d, fill):
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.fill.background()
    return shape


def picture(slide, path, x, y, w, h):
    with Image.open(path) as im:
        iw, ih = im.size
    aspect = iw / ih
    if aspect > w / h:
        dw, dh = w, w / aspect
    else:
        dh, dw = h, h * aspect
    slide.shapes.add_picture(
        str(path),
        Inches(x + (w - dw) / 2),
        Inches(y + (h - dh) / 2),
        Inches(dw),
        Inches(dh),
    )


def chrome(slide, art, kicker, page):
    picture(slide, art["logo"], 0.62, 0.36, 0.40, 0.40)
    write(
        slide,
        1.14,
        0.38,
        3.4,
        0.36,
        [{"text": "Tapped In", "size": 16, "bold": True}],
        anchor="ctr",
    )
    write(
        slide,
        6.8,
        0.38,
        5.9,
        0.36,
        [{"text": kicker, "size": 12, "bold": True, "color": MUTED, "spc": 140}],
        align="right",
        anchor="ctr",
    )
    write(
        slide,
        11.7,
        7.08,
        1.0,
        0.24,
        [{"text": f"{page:02d}", "size": 12, "bold": True, "color": SOFT}],
        align="right",
    )


def new_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = WHITE
    return slide


def cover(prs, art):
    slide = new_slide(prs)
    picture(slide, art["logo"], 0.7, 0.42, 0.48, 0.48)
    write(
        slide,
        1.32,
        0.48,
        3.6,
        0.38,
        [{"text": "Tapped In", "size": 18, "bold": True}],
        anchor="ctr",
    )
    rect(slide, 10.15, 0.48, 2.48, 0.38, BLACK, radius=0.19)
    write(
        slide,
        10.15,
        0.48,
        2.48,
        0.38,
        [{"text": "BE THE MIDDLE MAN", "size": 10, "bold": True, "color": WHITE, "spc": 60}],
        align="center",
        anchor="ctr",
    )
    picture(slide, art["welcome"], 3.55, 0.95, 6.25, 4.15)
    write(
        slide,
        0.8,
        5.22,
        11.73,
        1.25,
        [
            {"text": "Fă muzică.", "size": 40, "bold": True, "leading": 0.95},
            {"text": "Găsește-ți oamenii.", "size": 40, "bold": True, "leading": 0.95},
        ],
        align="center",
    )
    write(
        slide,
        1.6,
        6.55,
        10.1,
        0.4,
        [
            {
                "text": "Conectăm producătorii cu artiștii potriviți.",
                "size": 18,
                "color": MUTED,
            }
        ],
        align="center",
    )


def problem(prs, art):
    slide = new_slide(prs)
    chrome(slide, art, "PROBLEMA", 2)
    write(
        slide,
        0.7,
        1.15,
        12,
        1.55,
        [
            {"text": "Nu e talentul.", "size": 40, "bold": True, "leading": 0.98},
            {"text": "E distribuția.", "size": 40, "bold": True, "leading": 0.98},
        ],
    )
    write(
        slide,
        0.7,
        2.9,
        11.2,
        0.7,
        [
            {
                "text": "Producătorii fac muzică bună. Beat-urile nu ajung la artiștii potriviți.",
                "size": 20,
                "color": MUTED,
            }
        ],
    )
    cards = [
        ("01", "Promovarea", "Postări, mesaje și urmărire. Adesea mai mult decât beat-ul."),
        ("02", "Căutarea", "Artiștii există. Căutarea rămâne manuală."),
        ("03", "Distribuția", "Un beat bun care nu ajunge la artistul potrivit."),
    ]
    gap = 0.18
    width = (13.333333 - 1.4 - gap * 2) / 3
    y = 3.9
    h = 2.85
    for i, (num, title, body) in enumerate(cards):
        x = 0.7 + i * (width + gap)
        rect(slide, x, y, width, h, FIELD, radius=0.28)
        oval(slide, x + 0.28, y + 0.28, 0.46, BLACK)
        write(
            slide,
            x + 0.28,
            y + 0.28,
            0.46,
            0.46,
            [{"text": num, "size": 12, "bold": True, "color": WHITE}],
            align="center",
            anchor="ctr",
        )
        write(
            slide,
            x + 0.28,
            y + 0.98,
            width - 0.56,
            0.45,
            [{"text": title, "size": 20, "bold": True}],
        )
        write(
            slide,
            x + 0.28,
            y + 1.52,
            width - 0.56,
            1.05,
            [{"text": body, "size": 16, "color": MUTED, "leading": 1.15}],
        )


def workflow(prs, art):
    slide = new_slide(prs)
    chrome(slide, art, "AZI", 3)
    write(
        slide,
        0.7,
        1.2,
        12,
        0.7,
        [{"text": "O zi, în 30 de secunde.", "size": 40, "bold": True}],
    )
    write(
        slide,
        0.7,
        2.0,
        10,
        0.4,
        [{"text": "Așa își caută clienții un producător.", "size": 18, "color": MUTED}],
    )
    steps = [
        ("1", "Type beat pe YouTube", "Speri că algoritmul te vede."),
        ("2", "Cauți artiști", "Manual, unul câte unul."),
        ("3", "DM-uri reci", "Zeci de mesaje. Aproape zero răspunsuri."),
        ("4", "O iei de la capăt", "Aceeași buclă, în fiecare zi."),
    ]
    left, width = 0.7, 11.93
    col = width / 4
    d = 0.52
    cy = 2.85
    centers = [left + col * i + col / 2 for i in range(4)]
    rect(
        slide,
        centers[0],
        cy + d / 2 - 0.012,
        centers[-1] - centers[0],
        0.024,
        LINE,
        radius=0.012,
    )
    for i, ((num, title, body), cx) in enumerate(zip(steps, centers)):
        oval(slide, cx - d / 2, cy, d, BLACK)
        write(
            slide,
            cx - d / 2,
            cy,
            d,
            d,
            [{"text": num, "size": 16, "bold": True, "color": WHITE}],
            align="center",
            anchor="ctr",
        )
        write(
            slide,
            left + col * i + 0.12,
            3.58,
            col - 0.24,
            0.7,
            [{"text": title, "size": 16, "bold": True, "leading": 1.05}],
            align="center",
        )
        write(
            slide,
            left + col * i + 0.16,
            4.35,
            col - 0.32,
            0.9,
            [{"text": body, "size": 15, "color": MUTED, "leading": 1.15}],
            align="center",
        )
    rect(slide, 0.7, 5.85, 11.93, 0.92, BLACK, radius=0.46)
    write(
        slide,
        0.95,
        5.85,
        11.43,
        0.92,
        [
            {
                "text": "Fiecare oră de căutare este o oră în care nu faci muzică.",
                "size": 20,
                "bold": True,
                "color": WHITE,
            }
        ],
        align="center",
        anchor="ctr",
    )


def solution(prs, art):
    slide = new_slide(prs)
    chrome(slide, art, "SOLUȚIA", 4)
    write(
        slide,
        0.7,
        1.25,
        6.5,
        1.6,
        [
            {"text": "Automatizăm", "size": 40, "bold": True, "leading": 0.98},
            {"text": "descoperirea.", "size": 40, "bold": True, "leading": 0.98},
        ],
    )
    write(
        slide,
        0.7,
        3.1,
        6.3,
        0.85,
        [
            {
                "text": "O platformă ca Tinder, pentru producători și artiști.",
                "size": 20,
                "color": MUTED,
                "leading": 1.15,
            }
        ],
    )
    actions = ["Asculți lucrarea", "Dai swipe", "Te conectezi imediat"]
    for i, label in enumerate(actions):
        y = 4.2 + i * 0.72
        oval(slide, 0.7, y, 0.48, BLACK)
        write(
            slide,
            0.7,
            y,
            0.48,
            0.48,
            [{"text": str(i + 1), "size": 15, "bold": True, "color": WHITE}],
            align="center",
            anchor="ctr",
        )
        write(
            slide,
            1.38,
            y,
            5.4,
            0.48,
            [{"text": label, "size": 20, "bold": True}],
            anchor="ctr",
        )
    write(
        slide,
        0.7,
        6.45,
        6.4,
        0.4,
        [
            {
                "text": "De la beat la omul potrivit, mai repede.",
                "size": 16,
                "color": MUTED,
            }
        ],
    )
    picture(slide, art["signup"], 7.35, 1.25, 5.35, 5.15)


def matching(prs, art):
    slide = new_slide(prs)
    chrome(slide, art, "POTRIVIREA", 5)
    write(
        slide,
        0.7,
        1.2,
        7.2,
        1.55,
        [
            {"text": "Oamenii potriviți,", "size": 36, "bold": True, "leading": 0.98},
            {"text": "în câteva secunde.", "size": 36, "bold": True, "leading": 0.98},
        ],
    )
    write(
        slide,
        0.7,
        2.95,
        7.0,
        0.7,
        [
            {
                "text": "Potrivim după compatibilitate muzicală.",
                "size": 18,
                "color": MUTED,
            }
        ],
    )
    signals = ["Locație", "Genuri", "Type beats", "Influențe", "Experiență"]
    chip_w = 2.2
    rows = [signals[:3], signals[3:]]
    y = 3.85
    for row in rows:
        x = 0.7
        for label in row:
            rect(slide, x, y, chip_w, 0.58, FIELD, radius=0.29)
            write(
                slide,
                x,
                y,
                chip_w,
                0.58,
                [{"text": label, "size": 16, "bold": True}],
                align="center",
                anchor="ctr",
            )
            x += chip_w + 0.14
        y += 0.74
    write(
        slide,
        0.7,
        5.55,
        7.1,
        0.85,
        [
            {"text": "De la beat la colaborator, în minute.", "size": 20, "bold": True},
            {"text": "Fără vânătoare de artiști.", "size": 16, "color": MUTED, "before": 4},
        ],
    )
    picture(slide, art["login"], 8.15, 1.45, 4.55, 5.2)


def research(prs, art):
    slide = new_slide(prs)
    chrome(slide, art, "VALIDARE", 6)
    write(
        slide,
        0.7,
        1.15,
        10,
        0.65,
        [{"text": "Am întrebat comunitatea.", "size": 36, "bold": True}],
    )
    write(
        slide,
        0.7,
        1.9,
        10,
        0.4,
        [{"text": "30 de creatori independenți.", "size": 18, "color": MUTED}],
    )
    stats = [
        ("85%", "Un colaborator serios, pe stil, e greu de găsit."),
        ("80%+", "Caută artiști în loc să creeze muzică."),
        ("90%+", "Vor să asculte, să dea swipe și să se conecteze."),
    ]
    gap = 0.18
    width = (13.333333 - 1.4 - gap * 2) / 3
    y, h = 2.6, 2.85
    for i, (num, body) in enumerate(stats):
        x = 0.7 + i * (width + gap)
        rect(slide, x, y, width, h, FIELD, radius=0.28)
        write(
            slide,
            x + 0.28,
            y + 0.38,
            width - 0.56,
            0.9,
            [{"text": num, "size": 48, "bold": True}],
        )
        write(
            slide,
            x + 0.28,
            y + 1.5,
            width - 0.56,
            1.05,
            [{"text": body, "size": 16, "color": MUTED, "leading": 1.15}],
        )
    rect(slide, 0.7, 5.7, 11.93, 1.05, WHITE, radius=0.24, line=LINE)
    write(
        slide,
        0.98,
        5.7,
        11.4,
        1.05,
        [
            {
                "text": "O problemă trăită, apoi confirmată.",
                "size": 16,
                "bold": True,
            },
            {
                "text": "Misha produce de peste 3 ani. 222blank: ~5.000 de abonați și 300+ vânzări către producători.",
                "size": 14,
                "color": MUTED,
                "before": 3,
            },
        ],
        anchor="ctr",
    )


def middle(prs, art):
    slide = new_slide(prs)
    chrome(slide, art, "BE THE MIDDLE MAN", 7)
    write(
        slide,
        0.7,
        1.2,
        7.3,
        1.5,
        [
            {"text": "Stratul", "size": 40, "bold": True, "leading": 0.96},
            {"text": "din mijloc.", "size": 40, "bold": True, "leading": 0.96},
        ],
    )
    write(
        slide,
        0.7,
        2.9,
        7.1,
        0.85,
        [
            {
                "text": "Filtrăm zgomotul. Potrivim după sunet. Facem legătura mai repede.",
                "size": 18,
                "color": MUTED,
                "leading": 1.15,
            }
        ],
    )
    rows = [
        (FIELD, INK, "Producătorul creează."),
        (FIELD, INK, "Artistul creează."),
        (BLACK, WHITE, "Tapped In conectează."),
    ]
    for i, (fill, color, label) in enumerate(rows):
        y = 4.0 + i * 0.86
        rect(slide, 0.7, y, 7.15, 0.74, fill, radius=0.37)
        write(
            slide,
            0.98,
            y,
            6.6,
            0.74,
            [{"text": label, "size": 22, "bold": True, "color": color}],
            anchor="ctr",
        )
    picture(slide, art["signup"], 8.05, 1.55, 4.7, 5.15)


def close(prs, art):
    slide = new_slide(prs)
    picture(slide, art["logo"], 6.42, 0.42, 0.5, 0.5)
    picture(slide, art["welcome"], 4.15, 1.05, 5.05, 3.15)
    write(
        slide,
        0.8,
        4.35,
        11.73,
        0.75,
        [{"text": "Suntem Tapped In.", "size": 40, "bold": True}],
        align="center",
    )
    write(
        slide,
        0.8,
        5.15,
        11.73,
        0.45,
        [{"text": "Gata de întrebări.", "size": 22, "color": MUTED}],
        align="center",
    )
    write(
        slide,
        1.2,
        6.15,
        10.9,
        0.45,
        [
            {
                "text": "Producătorul creează.   Artistul creează.   Tapped In conectează.",
                "size": 16,
                "bold": True,
            }
        ],
        align="center",
    )


def build():
    art = prepare()
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)
    prs.core_properties.title = "Tapped In"
    prs.core_properties.subject = "Fă muzică. Găsește-ți oamenii."
    prs.core_properties.author = "Tapped In"
    cover(prs, art)
    problem(prs, art)
    workflow(prs, art)
    solution(prs, art)
    matching(prs, art)
    research(prs, art)
    middle(prs, art)
    close(prs, art)
    dest = OUT / "TappedIn-prezentare.pptx"
    prs.save(dest)
    print(dest)


if __name__ == "__main__":
    build()
