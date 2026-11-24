"""Build the static design system catalog from its token and sample sources."""
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
OUT.mkdir(exist_ok=True)
shutil.copytree(ROOT / "catalog", OUT, dirs_exist_ok=True)
tokens = json.loads((ROOT / "tokens/tokens.json").read_text())
components = []
for directory in sorted((ROOT / "components").iterdir()):
    component = json.loads((directory / "component.json").read_text())
    component["example"] = (directory / "preview.html").read_text()
    components.append(component)
data = {"tokens": tokens, "components": components}
(OUT / "data.js").write_text("window.catalogData = " + json.dumps(data, ensure_ascii=False) + ";\n")
scopes = []
for family, sections in tokens.items():
    declarations = [
        f"  --{section}-{token['key']}: {token['value']};"
        for section, values in sections.items() for token in values
    ]
    scopes.append(f'[data-family="{family}"] {{\n' + "\n".join(declarations) + "\n}")
for family, sections in tokens.items():
    overrides = {}
    for section, values in sections.items():
        for token in values:
            for platform, value in token.get("platforms", {}).items():
                overrides.setdefault(platform, []).append(f"  --{section}-{token['key']}: {value};")
    for platform, declarations in overrides.items():
        scope = f'[data-platform="{platform}"]'
        sample = f'[data-family="{family}"]'
        scopes.append(f'{scope}{sample}, {scope} {sample} {{\n' + "\n".join(declarations) + "\n}")
(OUT / "tokens.css").write_text("\n".join(scopes) + "\n")
