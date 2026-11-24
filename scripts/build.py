"""Build the BOX catalog metadata and scoped design tokens."""
import json
from token_registry import BASE, OVERRIDES, ROOT, css, profiles, read
import shutil

OUT = ROOT / "dist"
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for filename in ["index.html", "catalog.css", "catalog.js"]:
    shutil.copy2(ROOT / "catalog" / filename, OUT / filename)

atoms = read(ROOT / "catalog/atoms.json")
registry = dict(profiles())
box = registry["box"]
notes = read(ROOT / "catalog/token-notes.json")
tokens = {"box": {
    group: [{**entry, "value": box[group][entry["key"]]} for entry in entries]
    for group, entries in notes.items()
}}
if any({entry["key"] for entry in notes[group]} != set(values) for group, values in box.items()):
    raise ValueError("Every device token must have a catalog entry")
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
# Package outputs are reconstructed exclusively from checked-in sources.
for package in ("tokens", "ui-core", "ui-box"):
    target = ROOT / "packages" / package / "dist"
    if target.exists():
        shutil.rmtree(target)
    target.mkdir()
base_dir = ROOT / "packages/tokens/dist"
box_dir = ROOT / "packages/ui-box/dist"
base_css = css(registry["base"], ":root")
overrides_css = css(read(OVERRIDES["box"]), '[data-family="box"]')
(base_dir / "tokens.css").write_text(base_css)
shutil.copy2(BASE, base_dir / "tokens.json")
shutil.copy2(OVERRIDES["box"], box_dir / "overrides.json")
(box_dir / "overrides.css").write_text(overrides_css)
(box_dir / "tokens.css").write_text(base_css + overrides_css)
(box_dir / "tokens.json").write_text(json.dumps(box, indent=2, ensure_ascii=False) + "\n")
(OUT / "tokens.css").write_text(base_css + overrides_css)
