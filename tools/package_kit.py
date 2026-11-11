"""Build a deterministic blind reviewer kit from the generated pack files."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

pack = Path(__file__).resolve().parents[1] / 'pack'
with ZipFile(pack / 'reviewer-kit.zip', 'w') as archive:
    for name in ['reviewer-instructions.txt', 'cases.jsonl', 'predictions-template.json']:
        info = ZipInfo(name, date_time=(2026, 11, 11, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, (pack / name).read_bytes())
