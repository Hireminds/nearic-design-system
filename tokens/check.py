"""Check the designed text and control color pairs in the BOX profile."""

import json
from pathlib import Path


TEXT_PAIRS = [
    ("text", "surface"), ("on-action", "action"), ("muted", "surface"),
    ("on-accent", "accent"), ("on-destructive", "destructive"),
    ("accent", "accent-surface"), ("info", "surface"), ("success", "surface"),
    ("warning", "surface"), ("error", "surface"),
]
GRAPHIC_PAIRS = [
    ("network", "surface"), ("sound", "surface"), ("accent", "track"),
    ("outline", "surface"), ("outline", "control"), ("focus", "canvas"),
    ("focus", "surface"),
]


def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
              for c in channels]
    return sum(channel * weight for channel, weight in zip(linear, (0.2126, 0.7152, 0.0722)))


def check(tokens):
    colors = {t["key"]: t["value"]
              for t in tokens["colors"]}
    failures = []
    for minimum, pairs in [(4.5, TEXT_PAIRS), (3.0, GRAPHIC_PAIRS)]:
        for foreground, background in pairs:
            low, high = sorted(luminance(colors[key]) for key in (foreground, background))
            ratio = (high + 0.05) / (low + 0.05)
            if ratio < minimum:
                failures.append(f"BOX {foreground} on {background}: {ratio:.2f} < {minimum}")
    return failures


if __name__ == "__main__":
    source = json.loads(Path(__file__).with_name("tokens.json").read_text(encoding="utf-8"))
    if set(source) != {"box"}:
        raise ValueError("Expected a single BOX token profile")
    errors = check(source["box"])
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"{len(TEXT_PAIRS) + len(GRAPHIC_PAIRS)} contrast pairs passed in the BOX profile.")
