"""Rigenera gli asset WebP e la copertina social. Richiede Pillow."""
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / 'src/assets/img'
OUT = ROOT / 'public/assets/img'
OUT.mkdir(parents=True, exist_ok=True)
RESAMPLE = Image.Resampling.LANCZOS
manifest = {}
original_bytes = 0
optimized_bytes = 0


def read_image(source, mode='RGB'):
    with Image.open(source) as original:
        return ImageOps.exif_transpose(original).convert(mode)


def write_webp(key, image, name=None, variant_width=None):
    file = OUT / f'{name or key}.webp'
    image.save(file, 'WEBP', quality=85, method=6)
    entry = {'src': f'/assets/img/{file.name}', 'width': image.width, 'height': image.height}
    if variant_width and variant_width < image.width:
        variant = image.copy()
        variant.thumbnail((variant_width, image.height), RESAMPLE)
        small_file = OUT / f'{file.stem}-{variant.width}.webp'
        variant.save(small_file, 'WEBP', quality=82, method=6)
        entry['small'] = {
            'src': f'/assets/img/{small_file.name}', 'width': variant.width, 'height': variant.height,
        }
    manifest[key] = entry
    return file.stat().st_size


logo_source = SOURCES / 'logo_car3001.png'
logo = read_image(logo_source, 'RGBA')
logo.thumbnail((440, 440), RESAMPLE)
original_bytes += logo_source.stat().st_size
optimized_bytes += write_webp('logo', logo)

dent_source = SOURCES / 'portfolio' / 'bolli.jpeg'
dents = read_image(dent_source)
dents.thumbnail((1600, 1600), RESAMPLE)
original_bytes += dent_source.stat().st_size
optimized_bytes += write_webp('bolli', dents, variant_width=320)

cover_source = SOURCES / 'officina' / 'ingresso-nuova-car-3001.jpg'
for source in sorted(cover_source.parent.glob('*.jpg')):
    if source == cover_source:
        continue
    image = read_image(source)
    image.thumbnail((1440, 1440), RESAMPLE)
    original_bytes += source.stat().st_size
    optimized_bytes += write_webp(source.stem, image, variant_width=480)

entrance = read_image(cover_source)
# Ritaglio panoramico sopra e sotto per il desktop. Il mobile stringe l'inquadratura
# sull'ingresso, includendo tutta l'insegna, l'auto e un po' di spazio intorno.
desktop = entrance.crop((0, 195, 1448, 905))
mobile = entrance.crop((475, 260, 1275, 1070))
original_bytes += cover_source.stat().st_size
optimized_bytes += write_webp('header', desktop, cover_source.stem, variant_width=960)
write_webp('headerMobile', mobile, f'{cover_source.stem}-mobile', variant_width=480)

social = ImageOps.fit(desktop, (1200, 630), method=RESAMPLE)
social_name = f'{cover_source.stem}-condivisione.jpg'
social.save(OUT / social_name, quality=85, optimize=True)
manifest['social'] = {'src': f'/assets/img/{social_name}', 'width': 1200, 'height': 630}
(ROOT / 'src/data/images.json').write_text(json.dumps(manifest, indent=2) + '\n')
(ROOT / 'seo/asset-savings.json').write_text(json.dumps({
    'originalBytes': original_bytes,
    'webpBytes': optimized_bytes,
    'reductionPercent': round(100 * (1 - optimized_bytes / original_bytes), 1),
    'note': 'Comparison of source images with main WebP equivalents; excludes responsive variants and social JPEG.',
}, indent=2) + '\n')
print(f'WebP: {original_bytes:,} -> {optimized_bytes:,} byte.')
