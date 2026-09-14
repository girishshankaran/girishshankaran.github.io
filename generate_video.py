#!/usr/bin/env python3
"""
SolveCraft Promo Reel Generator (9:16 Vertical Video: 1080x1920)
Builds an animated social media reel for Instagram Reels, YouTube Shorts, & TikTok.
Streams frames directly into FFmpeg H.264 MP4 encoder.
"""

import math
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

# Try to get ffmpeg from imageio_ffmpeg
try:
    import imageio_ffmpeg
    FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_BIN = "ffmpeg"

WIDTH = 1080
HEIGHT = 1920
FPS = 30
DURATION_SEC = 21
TOTAL_FRAMES = DURATION_SEC * FPS

# Load Fonts
FONT_BOLD_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"
if not os.path.exists(FONT_BOLD_PATH):
    FONT_BOLD_PATH = "/System/Library/Fonts/Helvetica.ttc"
if not os.path.exists(FONT_REG_PATH):
    FONT_REG_PATH = "/System/Library/Fonts/Helvetica.ttc"

def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_REG_PATH
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# Pre-load Assets
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_PATH = os.path.join(WORKSPACE_DIR, "solvecraft-icon.jpg")
PROBLEM_PATH = os.path.join(WORKSPACE_DIR, "problem-sample.jpg")
QR_PATH = os.path.join(WORKSPACE_DIR, "solvecraft-qr.png")

icon_img = Image.open(ICON_PATH).convert("RGBA") if os.path.exists(ICON_PATH) else None
problem_img = Image.open(PROBLEM_PATH).convert("RGBA") if os.path.exists(PROBLEM_PATH) else None
qr_img = Image.open(QR_PATH).convert("RGBA") if os.path.exists(QR_PATH) else None

# Easing functions
def ease_out_cubic(t):
    return 1 - pow(1 - t, 3)

def ease_in_out_quad(t):
    return 2 * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 2) / 2

def clamp(val, min_v=0.0, max_v=1.0):
    return max(min_v, min(max_v, val))

# Pre-generate floating particles
NUM_PARTICLES = 45
particles = []
for i in range(NUM_PARTICLES):
    particles.append({
        "x": (i * 137.5) % WIDTH,
        "y": (i * 253.1) % HEIGHT,
        "size": 3 + (i % 6) * 2,
        "speed": 0.4 + (i % 5) * 0.3,
        "color": (99, 102, 241) if i % 2 == 0 else (6, 182, 212)
    })

def draw_header_badge(draw, icon_thumb, t_sec):
    # Top brand pill
    pill_w = 340
    pill_h = 64
    pill_x = (WIDTH - pill_w) // 2
    pill_y = 90
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=32, fill=(15, 23, 42, 230), outline=(255, 255, 255, 45), width=2)
    if icon_thumb:
        draw.bitmap((pill_x + 16, pill_y + 12), icon_thumb)
    font_badge = get_font(26, bold=True)
    draw.text((pill_x + 68, pill_y + 16), "SolveCraft", font=font_badge, fill=(241, 245, 249))
    font_ai = get_font(20, bold=True)
    draw.text((pill_x + 230, pill_y + 20), "✦ AI", font=font_ai, fill=(6, 182, 212))

def render_frame(frame_idx):
    t_sec = frame_idx / FPS
    img = Image.new("RGBA", (WIDTH, HEIGHT), (7, 9, 19, 255))
    draw = ImageDraw.Draw(img)

    # Subtle radial background glow
    glow_radius = 600
    glow_center = (WIDTH // 2, 600)
    # Background floating particles
    for p in particles:
        py = (p["y"] - t_sec * p["speed"] * 60) % HEIGHT
        px = (p["x"] + math.sin(t_sec * 0.5 + p["y"]) * 20) % WIDTH
        alpha = int(100 + math.sin(t_sec * 2 + p["x"]) * 50)
        draw.ellipse([px, py, px + p["size"], py + p["size"]], fill=(*p["color"], alpha))

    # Top Brand Pill
    if icon_img:
        icon_thumb = icon_img.resize((40, 40), Image.Resampling.LANCZOS)
    else:
        icon_thumb = None
    draw_header_badge(draw, icon_thumb, t_sec)

    # Progress bar at top
    progress_w = int((frame_idx / TOTAL_FRAMES) * WIDTH)
    draw.line([(0, 6), (progress_w, 6)], fill=(6, 182, 212), width=8)

    # -------------------------------------------------------------
    # SCENE 1: THE HOOK (0s - 4.0s)
    # -------------------------------------------------------------
    if t_sec < 4.0:
        enter_t = clamp(t_sec / 0.8)
        alpha = int(clamp(enter_t) * 255)
        offset_y = int((1 - ease_out_cubic(enter_t)) * 120)

        # Warning Badge
        badge_w = 460
        badge_h = 60
        badge_x = (WIDTH - badge_w) // 2
        badge_y = 230 + offset_y
        draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=30, fill=(239, 68, 68, 50), outline=(248, 113, 113, 160), width=2)
        font_warn = get_font(26, bold=True)
        draw.text((badge_x + 30, badge_y + 14), "⚠️  STUCK ON HOMEWORK?", font=font_warn, fill=(254, 202, 202))

        # Main Headline
        font_head = get_font(68, bold=True)
        draw.text((WIDTH // 2, 350 + offset_y), "Math & Science", font=font_head, fill=(255, 255, 255), anchor="mm")
        font_head2 = get_font(76, bold=True)
        draw.text((WIDTH // 2, 440 + offset_y), "got you stumped?", font=font_head2, fill=(244, 63, 94), anchor="mm")

        # Problem Notebook Card
        card_w = 840
        card_h = 640
        card_x = (WIDTH - card_w) // 2
        card_y = 560 + offset_y
        draw.rounded_rectangle([card_x - 6, card_y - 6, card_x + card_w + 6, card_y + card_h + 6], radius=38, fill=(244, 63, 94, 60))
        draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=32, fill=(255, 255, 255))

        if problem_img:
            p_w, p_h = 800, 520
            prob_crop = problem_img.resize((p_w, p_h), Image.Resampling.LANCZOS)
            img.paste(prob_crop, (card_x + 20, card_y + 20))

        # Sticker
        draw.rounded_rectangle([card_x + card_w - 200, card_y + 30, card_x + card_w - 30, card_y + 90], radius=16, fill=(239, 68, 68))
        font_sticker = get_font(28, bold=True)
        draw.text((card_x + card_w - 115, card_y + 60), "HELP! 🤯", font=font_sticker, fill=(255, 255, 255), anchor="mm")

        # Bottom Subtitle
        font_sub = get_font(34, bold=False)
        draw.text((WIDTH // 2, 1320), "Don't spend hours struggling alone...", font=font_sub, fill=(148, 163, 184), anchor="mm")

    # -------------------------------------------------------------
    # SCENE 2: SNAP WITH SOLVECRAFT (4.0s - 8.5s)
    # -------------------------------------------------------------
    elif t_sec < 8.5:
        rel_t = t_sec - 4.0
        enter_t = clamp(rel_t / 0.6)
        offset_y = int((1 - ease_out_cubic(enter_t)) * 100)

        # Action Title
        font_action = get_font(60, bold=True)
        draw.text((WIDTH // 2, 230 + offset_y), "Just Snap & Solve ⚡", font=font_action, fill=(6, 182, 212), anchor="mm")

        # Phone Mockup Frame
        phone_w = 780
        phone_h = 1200
        px = (WIDTH - phone_w) // 2
        py = 320 + offset_y

        # Phone outer shadow and border
        draw.rounded_rectangle([px - 8, py - 8, px + phone_w + 8, py + phone_h + 8], radius=68, fill=(99, 102, 241, 70))
        draw.rounded_rectangle([px, py, px + phone_w, py + phone_h], radius=60, fill=(9, 10, 22), outline=(51, 65, 85), width=6)

        # Phone camera screen (display problem sample)
        if problem_img:
            screen_w = phone_w - 24
            screen_h = phone_h - 24
            prob_screen = problem_img.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
            img.paste(prob_screen, (px + 12, py + 12))

        # Dynamic Viewfinder HUD
        hud_margin = 80
        hx1, hy1 = px + hud_margin, py + 220
        hx2, hy2 = px + phone_w - hud_margin, py + 720
        
        # Dashed/corner brackets
        bracket_len = 50
        bracket_col = (6, 182, 212, 255)
        # TL
        draw.line([(hx1, hy1), (hx1 + bracket_len, hy1)], fill=bracket_col, width=8)
        draw.line([(hx1, hy1), (hx1, hy1 + bracket_len)], fill=bracket_col, width=8)
        # TR
        draw.line([(hx2, hy1), (hx2 - bracket_len, hy1)], fill=bracket_col, width=8)
        draw.line([(hx2, hy1), (hx2, hy1 + bracket_len)], fill=bracket_col, width=8)
        # BL
        draw.line([(hx1, hy2), (hx1 + bracket_len, hy2)], fill=bracket_col, width=8)
        draw.line([(hx1, hy2), (hx1, hy2 - bracket_len)], fill=bracket_col, width=8)
        # BR
        draw.line([(hx2, hy2), (hx2 - bracket_len, hy2)], fill=bracket_col, width=8)
        draw.line([(hx2, hy2), (hx2, hy2 - bracket_len)], fill=bracket_col, width=8)

        # Sweeping Laser Scanner
        laser_progress = (math.sin(rel_t * 3.5) + 1) / 2
        laser_y = int(hy1 + laser_progress * (hy2 - hy1))
        draw.line([(hx1 + 10, laser_y), (hx2 - 10, laser_y)], fill=(6, 182, 212), width=8)
        draw.line([(hx1 + 10, laser_y - 2), (hx2 - 10, laser_y - 2)], fill=(255, 255, 255), width=4)

        # Shutter button at bottom of phone
        shutter_cy = py + phone_h - 110
        draw.ellipse([WIDTH // 2 - 50, shutter_cy - 50, WIDTH // 2 + 50, shutter_cy + 50], fill=(255, 255, 255), outline=(148, 163, 184), width=6)
        draw.ellipse([WIDTH // 2 - 38, shutter_cy - 38, WIDTH // 2 + 38, shutter_cy + 38], fill=(99, 102, 241))

        # Camera Flash effect at 7.0s
        if 7.0 <= t_sec <= 7.4:
            flash_alpha = int((1.0 - (t_sec - 7.0) / 0.4) * 230)
            overlay = Image.new("RGBA", (WIDTH, HEIGHT), (255, 255, 255, flash_alpha))
            img = Image.alpha_composite(img, overlay)

        # Dynamic island top
        draw.rounded_rectangle([WIDTH // 2 - 90, py + 16, WIDTH // 2 + 90, py + 54], radius=20, fill=(2, 6, 23))

    # -------------------------------------------------------------
    # SCENE 3: AI STEP-BY-STEP BREAKDOWN (8.5s - 13.5s)
    # -------------------------------------------------------------
    elif t_sec < 13.5:
        rel_t = t_sec - 8.5
        enter_t = clamp(rel_t / 0.5)
        offset_y = int((1 - ease_out_cubic(enter_t)) * 80)

        # AI Badge
        badge_w = 460
        badge_h = 56
        badge_x = (WIDTH - badge_w) // 2
        badge_y = 200 + offset_y
        draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=28, fill=(16, 185, 129, 40), outline=(52, 211, 153, 180), width=2)
        font_badge = get_font(24, bold=True)
        draw.text((badge_x + 32, badge_y + 14), "🧠  AI STEP-BY-STEP BREAKDOWN", font=font_badge, fill=(52, 211, 153))

        font_title = get_font(56, bold=True)
        draw.text((WIDTH // 2, 310 + offset_y), "Not just answers.", font=font_title, fill=(255, 255, 255), anchor="mm")
        font_sub = get_font(48, bold=True)
        draw.text((WIDTH // 2, 375 + offset_y), "Real understanding.", font=font_sub, fill=(56, 189, 248), anchor="mm")

        # Solution Cards
        cards = [
            {
                "time": 8.8,
                "tag": "🔍 IDENTIFIED PROBLEM",
                "tag_col": (6, 182, 212),
                "math": "∫ (6x² - 4x + 5) dx",
                "desc": "Polynomial calculus with power rule.",
                "y": 480
            },
            {
                "time": 10.0,
                "tag": "⚡ STEP 1: EXPAND TERMS",
                "tag_col": (129, 140, 248),
                "math": "= 6∫x²dx - 4∫xdx + 5∫dx",
                "desc": "Linearity of integral operator applied.",
                "y": 740
            },
            {
                "time": 11.2,
                "tag": "✅ FINAL SOLUTION",
                "tag_col": (16, 185, 129),
                "math": "2x³ - 2x² + 5x + C",
                "desc": "Complete verification with constant of integration!",
                "y": 1000,
                "is_final": True
            }
        ]

        for card in cards:
            if t_sec >= card["time"]:
                card_t = clamp((t_sec - card["time"]) / 0.4)
                cy_offset = int((1 - ease_out_cubic(card_t)) * 60)
                card_alpha = int(card_t * 255)
                
                cw = 860
                ch = 220
                cx = (WIDTH - cw) // 2
                cy = card["y"] + cy_offset

                if card.get("is_final"):
                    # Glowing green box
                    draw.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=32, fill=(16, 185, 129, 60))
                    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=28, fill=(15, 23, 42, 245), outline=(16, 185, 129), width=4)
                else:
                    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=28, fill=(15, 23, 42, 220), outline=(255, 255, 255, 35), width=2)

                # Card content
                font_tag = get_font(22, bold=True)
                draw.text((cx + 36, cy + 28), card["tag"], font=font_tag, fill=card["tag_col"])

                font_math = get_font(44, bold=True)
                math_col = (52, 211, 153) if card.get("is_final") else (241, 245, 249)
                draw.text((cx + 36, cy + 76), card["math"], font=font_math, fill=math_col)

                font_desc = get_font(26, bold=False)
                draw.text((cx + 36, cy + 150), card["desc"], font=font_desc, fill=(148, 163, 184))

    # -------------------------------------------------------------
    # SCENE 4: FEATURES SPEED-ROUND (13.5s - 17.0s)
    # -------------------------------------------------------------
    elif t_sec < 17.0:
        rel_t = t_sec - 13.5
        enter_t = clamp(rel_t / 0.5)
        offset_y = int((1 - ease_out_cubic(enter_t)) * 80)

        font_head = get_font(60, bold=True)
        draw.text((WIDTH // 2, 260 + offset_y), "Your All-in-One", font=font_head, fill=(255, 255, 255), anchor="mm")
        font_sub = get_font(64, bold=True)
        draw.text((WIDTH // 2, 340 + offset_y), "STEM Study Buddy", font=font_sub, fill=(56, 189, 248), anchor="mm")

        features = [
            {
                "time": 13.8,
                "icon": "⚡",
                "title": "Instant OCR Scanning",
                "sub": "Reads handwritten notes, textbooks & screens accurately",
                "bg_col": (99, 102, 241, 40),
                "border": (129, 140, 248, 180),
                "y": 480
            },
            {
                "time": 14.7,
                "icon": "🧠",
                "title": "Deep Conceptual Explanations",
                "sub": "Clear reasoning for every step so you actually learn",
                "bg_col": (6, 182, 212, 40),
                "border": (34, 211, 238, 180),
                "y": 760
            },
            {
                "time": 15.6,
                "icon": "📐",
                "title": "Math, Physics & Chemistry",
                "sub": "Algebra, Calculus, Mechanics, Reactions & Beyond",
                "bg_col": (16, 185, 129, 40),
                "border": (52, 211, 153, 180),
                "y": 1040
            }
        ]

        for feat in features:
            if t_sec >= feat["time"]:
                feat_t = clamp((t_sec - feat["time"]) / 0.4)
                fx_offset = int((1 - ease_out_cubic(feat_t)) * 120)
                
                fw = 880
                fh = 240
                fx = (WIDTH - fw) // 2 + fx_offset
                fy = feat["y"]

                draw.rounded_rectangle([fx, fy, fx + fw, fy + fh], radius=32, fill=feat["bg_col"], outline=feat["border"], width=3)
                
                # Icon Circle
                draw.ellipse([fx + 30, fy + 40, fx + 150, fy + 160], fill=(255, 255, 255, 20), outline=feat["border"], width=2)
                font_icon = get_font(56, bold=True)
                draw.text((fx + 90, fy + 100), feat["icon"], font=font_icon, fill=(255, 255, 255), anchor="mm")

                # Text
                font_ftitle = get_font(42, bold=True)
                draw.text((fx + 180, fy + 60), feat["title"], font=font_ftitle, fill=(255, 255, 255))
                font_fsub = get_font(26, bold=False)
                draw.text((fx + 180, fy + 120), feat["sub"], font=font_fsub, fill=(203, 213, 225))

    # -------------------------------------------------------------
    # SCENE 5: FINALE & CALL TO ACTION (17.0s - 21.0s)
    # -------------------------------------------------------------
    else:
        rel_t = t_sec - 17.0
        enter_t = clamp(rel_t / 0.6)
        scale = 0.8 + 0.2 * ease_out_cubic(enter_t)
        pulse = 1.0 + 0.04 * math.sin(rel_t * 6.0)

        # Pulsing Glow behind icon
        icon_size = int(220 * scale * pulse)
        ix = (WIDTH - icon_size) // 2
        iy = 240
        
        draw.ellipse([ix - 35, iy - 35, ix + icon_size + 35, iy + icon_size + 35], fill=(99, 102, 241, 70))
        draw.ellipse([ix - 70, iy - 70, ix + icon_size + 70, iy + icon_size + 70], fill=(6, 182, 212, 40))

        if icon_img:
            icon_scaled = icon_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
            img.paste(icon_scaled, (ix, iy), icon_scaled)

        # App Title
        font_app = get_font(72, bold=True)
        draw.text((WIDTH // 2, iy + icon_size + 55), "SolveCraft", font=font_app, fill=(255, 255, 255), anchor="mm")

        font_tagline = get_font(28, bold=True)
        draw.text((WIDTH // 2, iy + icon_size + 110), "LEARN  •  SOLVE  •  MASTER STEM", font=font_tagline, fill=(56, 189, 248), anchor="mm")

        # QR Code Card
        qr_card_w = 460
        qr_card_h = 510
        qrx = (WIDTH - qr_card_w) // 2
        qry = iy + icon_size + 160

        # Outer card shadow & border
        draw.rounded_rectangle([qrx - 6, qry - 6, qrx + qr_card_w + 6, qry + qr_card_h + 6], radius=38, fill=(6, 182, 212, 80))
        draw.rounded_rectangle([qrx, qry, qrx + qr_card_w, qry + qr_card_h], radius=32, fill=(255, 255, 255))

        if qr_img:
            qr_size = 360
            qr_scaled = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
            img.paste(qr_scaled, (qrx + (qr_card_w - qr_size) // 2, qry + 28), qr_scaled)

        font_qr_label = get_font(26, bold=True)
        draw.text((WIDTH // 2, qry + qr_card_h - 50), "📷 SCAN TO INSTALL", font=font_qr_label, fill=(15, 23, 42), anchor="mm")
        font_qr_sub = get_font(20, bold=False)
        draw.text((WIDTH // 2, qry + qr_card_h - 22), "Direct Google Play Download", font=font_qr_sub, fill=(100, 116, 139), anchor="mm")

        # Big CTA Google Play Button
        btn_w = 700
        btn_h = 120
        bx = (WIDTH - btn_w) // 2
        by = qry + qr_card_h + 45
        draw.rounded_rectangle([bx - 4, by - 4, bx + btn_w + 4, by + btn_h + 4], radius=36, fill=(255, 255, 255, 80))
        draw.rounded_rectangle([bx, by, bx + btn_w, by + btn_h], radius=30, fill=(255, 255, 255))

        font_btn = get_font(42, bold=True)
        draw.text((WIDTH // 2 + 20, by + 60), "Get on Google Play", font=font_btn, fill=(15, 23, 42), anchor="mm")
        font_arrow = get_font(38, bold=True)
        draw.text((bx + btn_w - 70, by + 60), "➔", font=font_arrow, fill=(15, 23, 42), anchor="mm")

        # Footer attribution
        font_foot = get_font(26, bold=True)
        draw.text((WIDTH // 2, 1720), "Built by ZetaShift Labs  •  zetashiftlabs.com", font=font_foot, fill=(148, 163, 184), anchor="mm")
        font_free = get_font(24, bold=False)
        draw.text((WIDTH // 2, 1765), "Free on Android  •  Fast & Step-by-Step", font=font_free, fill=(100, 116, 139), anchor="mm")

    return img.convert("RGB")

def main():
    output_mp4 = os.path.join(WORKSPACE_DIR, "solvecraft_promo_reel_9x16.mp4")
    print(f"🎬 Generating SolveCraft 9:16 Promo Reel...")
    print(f"   Resolution: {WIDTH}x{HEIGHT} (Vertical 9:16)")
    print(f"   Duration:   {DURATION_SEC}s @ {FPS} fps ({TOTAL_FRAMES} frames)")
    print(f"   Output:     {output_mp4}")

    # Launch FFmpeg pipe
    ffmpeg_cmd = [
        FFMPEG_BIN,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "18",
        "-movflags", "+faststart",
        output_mp4
    ]

    try:
        proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception as e:
        print(f"❌ Failed to start FFmpeg: {e}")
        return 1

    for f in range(TOTAL_FRAMES):
        frame_img = render_frame(f)
        proc.stdin.write(frame_img.tobytes())
        if f % 60 == 0 or f == TOTAL_FRAMES - 1:
            pct = int((f / TOTAL_FRAMES) * 100)
            sys.stdout.write(f"\r⏳ Rendering video: {pct}% ({f}/{TOTAL_FRAMES} frames)...")
            sys.stdout.flush()

    proc.stdin.close()
    proc.wait()

    if proc.returncode != 0:
        print(f"\n❌ FFmpeg finished with code {proc.returncode}")
        return 1

    file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
    print(f"\n✅ Video successfully generated!")
    print(f"   Path: {output_mp4}")
    print(f"   Size: {file_size_mb:.2f} MB")
    return 0

if __name__ == "__main__":
    sys.exit(main())
