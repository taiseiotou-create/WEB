# ============================
# 紙の質感画像をつくるプログラム
#   元素材：ambientCG「Paper 001」（実際に撮影した白い紙の写真。CC0＝自由に使える）
#           https://ambientcg.com/a/Paper001 の 2K-JPG をダウンロードして使う
#   使い方: python3 tools/make-paper.py <Paper001_2K-JPG_Color.jpg のパス>
#   作るもの：
#     images/paper-white.jpg … 白い地の背景。紙の写真そのもの（明るさだけ整える）
#     images/paper.jpg       … 凹凸だけを取り出した灰色の画像。黒や朱の面の上に重ねて、同じ紙に刷ったように見せる
#   どちらも継ぎ目なく並べられるよう、端どうしを少しずつ重ねて混ぜている
# ============================
import sys
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

src = Image.open(sys.argv[1]).convert("RGB")
src = src.crop((0, 0, 1900, 1200))          # 右端にある筋（写真のムラ）を切り落とす
OUT = Path(__file__).resolve().parent.parent / "images"
OUT.mkdir(exist_ok=True)

def seamless(a, ov):
    """端を ov ピクセル重ねて混ぜ、上下左右がつながる画像にする"""
    h, w = a.shape[:2]
    t = np.linspace(0, 1, ov)[None, :, None] if a.ndim == 3 else np.linspace(0, 1, ov)[None, :]
    out = a[:, : w - ov].copy()
    out[:, :ov] = a[:, w - ov:] * (1 - t) + a[:, :ov] * t
    h2 = out.shape[0]
    t = np.linspace(0, 1, ov)[:, None, None] if a.ndim == 3 else np.linspace(0, 1, ov)[:, None]
    res = out[: h2 - ov].copy()
    res[:ov] = out[h2 - ov:] * (1 - t) + out[:ov] * t
    return res

rgb = np.asarray(src).astype(np.float32)
rgb = seamless(rgb, 160)
mean = rgb.mean(axis=(0, 1))
white = (rgb - mean) * 1.25 + np.array([250, 249, 246], np.float32)   # ほんのり温かい白に
Image.fromarray(np.clip(white, 0, 255).astype(np.uint8)).resize((1024, 584), Image.LANCZOS).save(OUT / "paper-white.jpg", quality=84, optimize=True)

g = np.asarray(Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).convert("L")).astype(np.float32)
low = np.asarray(Image.fromarray(g.astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))).astype(np.float32)
hp = g - low
hp = hp / hp.std() * 14 + 128
Image.fromarray(np.clip(hp, 0, 255).astype(np.uint8)).resize((1024, 584), Image.LANCZOS).save(OUT / "paper.jpg", quality=84, optimize=True)
print("saved", OUT / "paper-white.jpg", OUT / "paper.jpg")
