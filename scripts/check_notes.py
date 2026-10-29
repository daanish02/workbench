# /// script
# requires-python = "==3.14.*"
# dependencies = [
#   "numpy==2.5.4",
#   "scipy==1.18.1",
#   "sympy==1.14.0",
#   "networkx==3.7",
#   "statsmodels==0.15.0",
#   "cryptography==50.0.2",
#   "packaging==26.3",
#   "capstone==5.0.9",
#   "scikit-fuzzy==0.5.0",
# ]
# ///
"""Run every Python block in one area's notes on its own and check its printed output.

Expected output is written in a block in one of two ways:
  - inline:    print(x)  # prints: 42 | second line
  - trailing:  a run of comment lines at the very end of the block, one per output line.
Whitespace is normalised before comparing, and '...' marks an omitted tail.

Usage: uv run scripts/check_notes.py <area> [path-filter]   e.g. math, cs, infra

Migration (old inline outputs to the output block): add --migrate to list what would change (a diff per block) and
--write to apply it. Each block that has `print(x)  # prints: ...` comments is run; those comments are removed and the
real printed output is appended as trailing `# ...` lines. Blocks that already end in an output block, do not run,
print nothing or print more than 40 lines are skipped and reported. Through scripts/note_tools.py: `outputs`.
"""

import difflib
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


def run_code(code):
    return subprocess.run(
        [sys.executable, "-c", "\n".join(code)],
        capture_output=True, text=True, encoding="utf-8", timeout=300,
        env={**os.environ, "PYTHONIOENCODING": "utf-8"},
    )


INLINE_PRINTS = re.compile(r"\s+#\s*prints:\s*(.*)$")


def migrate_block(code):
    """(new_lines, note) for a block to rewrite, (None, reason) to skip it, (None, None) when it has nothing to move."""
    inline = [i for i, line in enumerate(code) if not line.lstrip().startswith("#") and INLINE_PRINTS.search(line)]
    if not inline:
        return None, None
    last = max((i for i, line in enumerate(code) if line.strip() and not line.startswith("#")), default=-1)
    if any(line.startswith("# ") for line in code[last + 1 :]):
        return None, "already ends in an output block"
    run = run_code(code)
    if run.returncode:
        return None, "does not run: " + (run.stderr.strip().splitlines() or ["?"])[-1][:100]
    out = [line.rstrip() for line in run.stdout.splitlines() if line.strip()]
    if not out:
        return None, "prints nothing"
    if len(out) > 40:
        return None, f"prints {len(out)} lines, over the 40-line limit"
    dropped = [m.group(1) for i in inline if (m := INLINE_PRINTS.search(code[i])) and "<-" in m.group(1)]
    new = [INLINE_PRINTS.sub("", line).rstrip() if i in inline else line for i, line in enumerate(code)]
    while new and not new[-1].strip():
        new.pop()
    note = f"dropped annotation: {dropped[0][:80]}" if dropped else None
    return new + ["# " + line for line in out], note


def migrate_file(path, rel, write):
    """Rewrite the blocks of one note; keeps the file's own line endings."""
    with open(path, encoding="utf-8", newline="") as f:
        text = f.read()
    eol = "\r\n" if "\r\n" in text else "\n"
    lines = text.split(eol)
    changed = skipped = 0
    for start, code in reversed(list(blocks(path))):
        new, info = migrate_block(code)
        if new is None:
            if info:
                skipped += 1
                print(f"SKIP {rel}:{start}  {info}")
            continue
        changed += 1
        print(f"--- {rel}:{start}" + (f"  ({info})" if info else ""))
        for d in difflib.unified_diff(code, new, lineterm="", n=0):
            if not d.startswith(("---", "+++", "@@")):
                print("   ", d)
        lines[start - 1 : start - 1 + len(code)] = new
    if write and changed:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(eol.join(lines))
    return changed, skipped


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args or not (NOTES / args[0]).is_dir():
        sys.exit("usage: uv run scripts/check_notes.py <area> [path-filter] [--migrate [--write]]")
    ROOT = NOTES / args[0]
    filt = args[1] if len(args) > 1 else ""
    if "--migrate" in sys.argv:
        changed = skipped = 0
        for path in sorted(ROOT.rglob("*.mdx")):
            rel = path.relative_to(ROOT).as_posix()
            if filt in rel:
                c, k = migrate_file(path, rel, "--write" in sys.argv)
                changed, skipped = changed + c, skipped + k
        verb = "rewritten" if "--write" in sys.argv else "would be rewritten (add --write to apply)"
        print(f"{changed} blocks {verb}, {skipped} skipped")
        return
    failures = total = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        rel = path.relative_to(ROOT).as_posix()
        if filt not in rel:
            continue
        for start, code in blocks(path):
            total += 1
            run = run_code(code)
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
