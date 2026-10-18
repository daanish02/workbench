# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "numpy==2.5.4",
#   "scipy==1.18.1",
#   "sympy==1.14.0",
#   "networkx==3.7",
#   "statsmodels==0.15.0",
#   "cryptography==50.0.2",
#   "packaging==26.3",
# ]
# ///
"""Run every Python block in one area's notes on its own and check its printed output.

Expected output is written in a block in one of two ways:
  - inline:    print(x)  # prints: 42 | second line
  - trailing:  a run of comment lines at the very end of the block, one per output line.
Whitespace is normalised before comparing, and '...' marks an omitted tail.

Usage: uv run scripts/check_notes.py <area> [path-filter]   e.g. math, cs, infra
"""

import os
import pathlib
import re
import subprocess
import sys

NOTES = pathlib.Path(__file__).resolve().parent.parent / "src" / "content" / "notes"


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def expected_fragments(code_lines):
    frags = []
    for line in code_lines:
        m = re.search(r"#\s*prints:\s*(.*)$", line)
        if m:
            frags += m.group(1).split(" | ")
    tail = []
    for line in reversed(code_lines):
        if line.startswith("# ") and "prints:" not in line:
            tail.append(line[2:])
        else:
            break
    frags += reversed(tail)
    out = []
    for f in frags:
        # "<- ..." after an output line is an annotation, not output
        f = re.sub(r"\s*<-\s.*$", "", f)
        f = norm(re.sub(r"\.\.\.\s*(\(\d+ lines\))?$", "", f))
        if f:
            out.append(f)
    return out


def blocks(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        if lines[i].strip() == "```python":
            j = i + 1
            while lines[j].strip() != "```":
                j += 1
            yield i + 2, lines[i + 1 : j]
            i = j
        i += 1


def main():
    if len(sys.argv) < 2 or not (NOTES / sys.argv[1]).is_dir():
        sys.exit("usage: uv run scripts/check_notes.py <area> [path-filter]")
    ROOT = NOTES / sys.argv[1]
    filt = sys.argv[2] if len(sys.argv) > 2 else ""
    failures = total = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        rel = path.relative_to(ROOT).as_posix()
        if filt not in rel:
            continue
        for start, code in blocks(path):
            total += 1
            run = subprocess.run(
                [sys.executable, "-c", "\n".join(code)],
                capture_output=True, text=True, encoding="utf-8", timeout=300,
                env={**os.environ, "PYTHONIOENCODING": "utf-8"},
            )
            actual = norm(run.stdout)
            problems = []
            if run.returncode:
                problems.append("error: " + (run.stderr.strip().splitlines() or ["?"])[-1])
            for frag in expected_fragments(code):
                if frag not in actual:
                    problems.append("missing: " + frag[:150])
            if problems:
                failures += 1
                print(f"FAIL {rel}:{start}")
                for p in problems:
                    print("   ", p)
                print("    actual:", run.stdout.strip()[:800].replace("\n", " | "))
    print(f"{total} blocks, {failures} failing")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
