"""Optional asset maintenance: python3 -m pip install Pillow; python3 scripts/optimize-images.py.

Originals are kept in src/assets/. The regular Node build uses committed WebP files.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/assets/img'
OUT.mkdir(parents=True, exist_ok=True)
sources = {
    'header': ROOT / 'src/assets/img/header.png',
    'logo': ROOT / 'src/assets/img/logo_car3001.png',
    **{name: ROOT / f'src/assets/img/portfolio/{name}.{ext}' for name, ext in [
        ('gomma','jpeg'), ('carrozzeria','jpeg'), ('fanale','jpeg'),
        ('pulizia','jpeg'), ('bolli','jpeg'), ('elettrauto','jpg'), ('cerchio','jpeg')
    ]}
}
manifest = {}
original_bytes = optimized_bytes = 0
for key, source in sources.items():
    im = ImageOps.exif_transpose(Image.open(source)).convert('RGBA' if key == 'logo' else 'RGB')
    im.thumbnail((440,440) if key == 'logo' else (1600,1600), Image.Resampling.LANCZOS)
    destination = OUT / f'{key}.webp'
    im.save(destination, 'WEBP', quality=85, method=6)
    original_bytes += source.stat().st_size
    optimized_bytes += destination.stat().st_size
    manifest[key] = {'src':f'/assets/img/{key}.webp','width':im.width,'height':im.height}
    if key != 'logo':
        small = im.copy()
        small.thumbnail((960,960) if key == 'header' else (320,320), Image.Resampling.LANCZOS)
        small_name = f'{key}-{small.width}.webp'
        small.save(OUT / small_name,'WEBP',quality=82,method=6)
        manifest[key]['small'] = {'src':f'/assets/img/{small_name}','width':small.width,'height':small.height}

# JPEG fallback for social clients, independent of the modern formats used on pages.
social = ImageOps.fit(Image.open(sources['header']).convert('RGB'),(1200,630),method=Image.Resampling.LANCZOS)
social.save(OUT / 'social-cover.jpg',quality=85,optimize=True)
manifest['social'] = {'src':'/assets/img/social-cover.jpg','width':1200,'height':630}
(ROOT / 'src/data/images.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT / 'seo').mkdir(exist_ok=True)
(ROOT / 'seo/asset-savings.json').write_text(json.dumps({
    'originalBytes':original_bytes,'webpBytes':optimized_bytes,
    'reductionPercent':round(100 * (1 - optimized_bytes / original_bytes),1),
    'note':'Comparison of originals with largest WebP equivalents; excludes responsive variants and social JPEG.'
},indent=2)+'\n')
print(f'WebP: {original_bytes:,} -> {optimized_bytes:,} bytes ({100 * (1 - optimized_bytes / original_bytes):.1f}% in meno).')
