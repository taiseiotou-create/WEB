# ============================
# 紙の質感画像をつくるプログラム（images/paper.jpg を生成）
#   使い方: python3 tools/make-paper.py
#   ・継ぎ目なく並べられる（タイル状に敷き詰めても境目が出ない）1024×1024 の画像
#   ・灰色(128)を基準に、明るい所・暗い所で紙の凹凸を表す
#     → CSS の「ソフトライト」で重ねると、どんな色の上にも紙の質感がのる
#   紙の要素：
#     1) 地合い（ちあい）：繊維の密度の差でできる、雲のようなムラ
#     2) 繊維：いろいろな向きに走る、細く長い繊維（少し暗いもの・光るもの）
#     3) 表面の細かな凹凸に、左上から光が当たったような陰影
# ============================
import numpy as np
from PIL import Image
from pathlib import Path

N = 1024
rng = np.random.default_rng(7)

def spectral_noise(beta, lo=1.0):
    """周期的な（継ぎ目のない）ノイズ。beta が大きいほど大きなムラになる"""
    white = rng.standard_normal((N, N))
    f = np.fft.fftfreq(N)
    fx, fy = np.meshgrid(f, f)
    k = np.sqrt(fx ** 2 + fy ** 2)
    k[0, 0] = 1
    amp = 1 / (k * N / lo) ** (beta / 2)
    amp[0, 0] = 0
    out = np.real(np.fft.ifft2(np.fft.fft2(white) * amp))
    return (out - out.mean()) / out.std()

def blur(img, sigma):
    """周期的なぼかし（端が反対側とつながる）"""
    f = np.fft.fftfreq(N)
    fx, fy = np.meshgrid(f, f)
    g = np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(img) * g))

# 1) 地合い：大きなムラ＋中くらいのムラ
formation = spectral_noise(3.2) * 0.7 + spectral_noise(2.2) * 0.3

# 2) 繊維：ゆるく曲がる線を、点を少しずつずらしながら置いていく
def fibers(count, length, width_sigma):
    acc = np.zeros((N, N))
    for _ in range(count):
        x, y = rng.uniform(0, N, 2)
        ang = rng.uniform(0, np.pi * 2)
        curve = rng.normal(0, 0.004)          # ほぼまっすぐ、ゆるく曲がる
        L = int(rng.uniform(*length))
        strength = rng.uniform(0.4, 1.0)
        for s in range(L):
            ang += curve + rng.normal(0, 0.006)
            x += np.cos(ang); y += np.sin(ang)
            ix, iy = int(x) % N, int(y) % N
            fade = np.sin(np.pi * s / L)        # 両端は細く消える
            acc[iy, ix] += strength * fade
    return blur(acc, width_sigma)

dark_fibers = fibers(650, (18, 80), 0.75)
light_fibers = fibers(1400, (25, 110), 1.0)
long_fibers = fibers(70, (120, 260), 1.1)      # ところどころ長い繊維

# 3) 表面の細かな凹凸
tooth = blur(rng.standard_normal((N, N)), 0.9)
tooth = tooth / tooth.std()

height = tooth * 0.55 + formation * 0.25 + (light_fibers - dark_fibers) * 2.2 + long_fibers * 1.5
gy, gx = np.gradient(height)
gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) / 2   # 端をつなげて傾きを求める
gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) / 2
shade = -(gx * 0.7 + gy * 0.7)                               # 左上から光が当たる

# まとめる：128を基準に、明るさの差として表す
tone = (
    formation * 6.0           # 地合いのムラ
    - dark_fibers * 16.0      # 暗い繊維
    + light_fibers * 20.0     # 光る繊維
    + long_fibers * 12.0
    + shade * 22.0            # 凹凸の陰影
    + tooth * 3.0
)
img = np.clip(128 + tone, 0, 255).astype(np.uint8)

out = Path(__file__).resolve().parent.parent / "images" / "paper.jpg"
out.parent.mkdir(exist_ok=True)
Image.fromarray(img, "L").save(out, quality=86, optimize=True)
print(f"saved {out} ({out.stat().st_size // 1024} KB)  mean={img.mean():.1f} std={img.std():.1f}")
