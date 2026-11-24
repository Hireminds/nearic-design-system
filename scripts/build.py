"""Build the static design system catalog from its token and sample sources."""
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
OUT.mkdir(exist_ok=True)
shutil.copytree(
    ROOT / "catalog", OUT, dirs_exist_ok=True,
    ignore=shutil.ignore_patterns("*.ts", "*.tsx")
)
(OUT / "library").mkdir(exist_ok=True)
shutil.copy2(ROOT / "library/atoms.css", OUT / "library/atoms.css")
atoms = json.loads((ROOT / "library/atoms.json").read_text())
tokens = json.loads((ROOT / "tokens/tokens.json").read_text())
components = []
for directory in sorted((ROOT / "components").iterdir()):
    component = json.loads((directory / "component.json").read_text())
    component["example"] = (directory / "preview.html").read_text()
    components.append(component)
atom_ids = {atom["id"] for atom in atoms}
for component in components:
    for atom in component["uses"]:
        if atom not in atom_ids:
            raise ValueError(f"Unknown atom '{atom}' in {component['id']}")
builder_source = (ROOT / "catalog/builder.tsx").read_text()
recipe = builder_source.split("// @example-start\n", 1)[1].split("// @example-end", 1)[0].strip()
data = {"tokens": tokens, "components": components, "atoms": atoms, "builderRecipe": recipe}
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
