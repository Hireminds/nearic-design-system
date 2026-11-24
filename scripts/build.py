"""Build the BOX catalog metadata and scoped design tokens."""
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for filename in ["index.html", "catalog.css", "catalog.js"]:
    shutil.copy2(ROOT / "catalog" / filename, OUT / filename)

atoms = json.loads((ROOT / "library/atoms.json").read_text())
tokens = json.loads((ROOT / "tokens/tokens.json").read_text())
components = [
    json.loads(path.read_text())
    for path in sorted((ROOT / "components").glob("*/component.json"))
]
if set(tokens) != {"box"} or any(atom["families"] != ["box"] for atom in atoms):
    raise ValueError("Expected BOX catalog data")
atom_ids = {atom["id"] for atom in atoms}
for component in components:
    if component["family"] != "box" or not set(component["uses"]).issubset(atom_ids):
        raise ValueError(f"Invalid component in BOX catalog: {component['id']}")
builder_source = (ROOT / "catalog/builder.tsx").read_text()
recipe = builder_source.split("// @example-start\n", 1)[1].split("// @example-end", 1)[0].strip()
data = {"tokens": tokens, "components": components, "atoms": atoms, "builderRecipe": recipe}
(OUT / "data.js").write_text("window.catalogData = " + json.dumps(data, ensure_ascii=False) + ";\n")
declarations = [
    f"  --{section}-{token['key']}: {token['value']};"
    for section, values in tokens["box"].items() for token in values
]
(OUT / "tokens.css").write_text('[data-family="box"] {\n' + "\n".join(declarations) + "\n}\n")
