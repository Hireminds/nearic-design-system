"""Load the shared semantic tokens and apply sparse theme overrides."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "packages/tokens/tokens.json"
OVERRIDES = {"box": ROOT / "packages/ui-box/overrides.json"}


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def profiles():
    base = read(BASE)
    yield "base", base
    for name, filename in OVERRIDES.items():
        values = {group: dict(entries) for group, entries in base.items()}
        for group, entries in read(filename).items():
            for key, value in entries.items():
                if values.get(group, {}).get(key) == value:
                    raise ValueError(f"Redundant {name} override: {group}.{key}")
            values.setdefault(group, {}).update(entries)
        yield name, values


def css(values, selector):
    properties = [
        f"  --{group}-{key}: {value};"
        for group, entries in values.items() for key, value in entries.items()
    ]
    return selector + " {\n" + "\n".join(properties) + "\n}\n"
