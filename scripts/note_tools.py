# /// script
# requires-python = "==3.14.*"
# dependencies = [
#   "pillow==11.3.0",
# ]
# ///
"""One entry point for the checks used while writing notes.

  uv run scripts/note_tools.py check <area> [filter]   run every Python block (wraps check_notes.py)
  uv run scripts/note_tools.py verify [area ...]       bun run build, then katex-error and control-character checks
  uv run scripts/note_tools.py shots <url-path> ...    screenshot built pages and crop each figure to a PNG
  uv run scripts/note_tools.py dollars [--apply] FILE  find (or escape) money like $30,000 that KaTeX reads as math
  uv run scripts/note_tools.py pending FILE ...        log code blocks marked `output: PENDING` in refs/verify-snippets.md
  uv run scripts/note_tools.py fill NOTE ANSWERS       fill PENDING outputs from a numbered answers file, in order

shots needs a built site (`bun run build`); it starts `bun run preview` on port 4399 if nothing is listening
there, and uses headless Microsoft Edge. Paths look like `infra/storage/raid` (no /workbench prefix).
Crops land in --out (default: .shots/ in the repo, which is gitignored) as <page>_fig<N>.png, in page order.
"""

import argparse
import os
import pathlib
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import uuid

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORT = 4399
EDGE = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]
# headless Edge fails above roughly 10,000 px, so pages are shot at 0.7 scale to fit long notes
SCALE, WIDTH, HEIGHT = 0.7, 1300, 9500


def run(cmd, **kw):
    print("$", " ".join(cmd), flush=True)
    return subprocess.run(cmd, cwd=ROOT, **kw)


def cmd_check(args):
    return run(["uv", "run", "scripts/check_notes.py", args.area, *([args.filter] if args.filter else [])]).returncode


def cmd_verify(args):
    bun = shutil.which("bun") or "bun"
    build = run([bun, "run", "build"], capture_output=True, text=True)
    out = build.stdout + build.stderr
    pages = re.search(r"Indexed (\d+) pages", out)
    print(f"build exit {build.returncode}" + (f", {pages.group(1)} pages indexed" if pages else ""))
    if build.returncode:
        print(out[-3000:])
        return 1
    bad = 0
    dist = ROOT / "dist"
    for area in args.areas or [p.name for p in dist.iterdir() if p.is_dir() and not p.name.startswith(("_", "pagefind"))]:
        hits = [p for p in (dist / area).rglob("*.html") if "katex-error" in p.read_text(encoding="utf-8", errors="ignore")]
        for p in hits:
            print("katex-error:", p.relative_to(dist))
        bad += len(hits)
    ctrl = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
    for p in (ROOT / "src").rglob("*"):
        if p.suffix in {".mdx", ".astro", ".ts", ".css"} and ctrl.search(p.read_text(encoding="utf-8", errors="ignore")):
            print("control character:", p.relative_to(ROOT))
            bad += 1
    print("verify:", "ok" if not bad else f"{bad} problem(s)")
    return 1 if bad else 0


def port_open():
    with socket.socket() as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", PORT)) == 0


def find_figures(png, out_dir, stem):
    from PIL import Image

    im = Image.open(png).convert("RGB")
    w, h = im.size
    # pages are loaded with ?figmarks, which gives every <figure> a magenta top border (see Figure.astro)
    x0, x1 = int(330 * SCALE), int(1000 * SCALE)
    tops = []
    for y in range(h):
        row = [im.getpixel((x, y)) for x in range(x0, x1, 8)]
        if sum(1 for r, g, b in row if r > 200 and g < 60 and b > 200) > 0.8 * len(row):
            if not tops or y - tops[-1] > 20:
                tops.append(y)
    files = []
    for i, y in enumerate(tops):
        bottom = min(h, y + int(900 * SCALE), tops[i + 1] - 10 if i + 1 < len(tops) else h)
        f = out_dir / f"{stem}_fig{i}.png"
        im.crop((int(320 * SCALE), y, int(1025 * SCALE), bottom)).save(f)
        files.append(f)
    return files


def cmd_shots(args):
    edge = next((e for e in EDGE if os.path.exists(e)), None)
    if not edge:
        print("Microsoft Edge not found; shots needs a Chromium browser")
        return 1
    out_dir = pathlib.Path(args.out) if args.out else ROOT / ".shots"
    out_dir.mkdir(parents=True, exist_ok=True)
    server = None
    if not port_open():
        if not (ROOT / "dist").exists():
            print("no dist/: run `bun run build` first")
            return 1
        server = subprocess.Popen([shutil.which("bun") or "bun", "run", "preview", "--port", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(60):
            if port_open():
                break
            time.sleep(0.5)
    try:
        for path in args.paths:
            path = path.strip("/")
            stem = path.replace("/", "_")
            png = out_dir / f"{stem}.png"
            url = f"http://localhost:{PORT}/workbench/{path}/?figmarks"
            # Edge's launcher can exit before the browser has written the PNG, so wait for the file
            # to appear (and stop growing) instead of trusting the exit; retry with a fresh profile
            png.unlink(missing_ok=True)
            for _ in range(3):
                profile = pathlib.Path(tempfile.gettempdir()) / f"note-tools-edge-{uuid.uuid4().hex}"
                subprocess.run(
                    [edge, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--force-device-scale-factor={SCALE}",
                     f"--user-data-dir={profile}", "--virtual-time-budget=4000", f"--window-size={WIDTH},{HEIGHT}",
                     f"--screenshot={png}", url],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
                )
                size = -1
                for _ in range(60):
                    if png.exists() and png.stat().st_size == size > 0:
                        break
                    size = png.stat().st_size if png.exists() else -1
                    time.sleep(0.5)
                shutil.rmtree(profile, ignore_errors=True)
                if png.exists():
                    break
            if not png.exists():
                print(f"{path}: screenshot failed")
                continue
            figs = find_figures(png, out_dir, stem)
            print(f"{path}: {len(figs)} figure(s)")
            for f in figs:
                print("  ", f)
    finally:
        if server:
            server.terminate()
    return 0


MONEY = re.compile(r"(?<!\\)\$(?=\d)")
PAIR = re.compile(r"(?<!\\)\$([^$]+?)(?<!\\)\$")


def money_lines(text):
    """Yield (index, line, is_yaml) for prose lines whose $ signs look like money, not math."""
    in_code, fences = False, 0
    for i, line in enumerate(text.split("\n")):
        if line.strip() == "---":
            fences += 1
        if line.strip().startswith("```"):
            in_code = not in_code
            continue
        if in_code or not MONEY.search(line):
            continue
        is_yaml = fences == 1 and line.startswith('  - "')
        if fences == 1 and not is_yaml:
            continue
        # skip lines that contain real math: any $...$ span with TeX syntax inside
        spans = [m.group(1) for m in PAIR.finditer(line)]
        if any(re.search(r"[\\^_{}=]", s) for s in spans):
            continue
        # money shows up as a "span" running across prose ("$100 from Alice (balance $"); $0.7$ is math
        if any(re.search(r"[A-Za-z]{2,}\s", s) for s in spans):
            yield i, line, is_yaml


def cmd_dollars(args):
    found = 0
    files = []
    for name in args.files:  # a directory means every .mdx under it
        p = pathlib.Path(name)
        files += sorted(p.rglob("*.mdx")) if p.is_dir() else [p]
    for p in files:
        lines = p.read_text(encoding="utf-8").split("\n")
        for i, line, is_yaml in list(money_lines("\n".join(lines))):
            found += 1
            print(f"{p}:{i + 1}: {line.strip()[:120]}")
            if args.apply:
                lines[i] = MONEY.sub(lambda m: "\\\\$" if is_yaml else "\\$", line)
        if args.apply:
            p.write_text("\n".join(lines), encoding="utf-8")
    print(f"{found} line(s)" + (" escaped" if args.apply else " to review; rerun with --apply to escape"))
    return 0


FENCE = re.compile(r"^```(\w[\w+#-]*)\n(.*?)^```", re.S | re.M)


def cmd_pending(args):
    """Append every code block still marked `output: PENDING` to refs/verify-snippets.md, once."""
    log = ROOT / "refs" / "verify-snippets.md"
    text = log.read_text(encoding="utf-8")
    added = []
    for name in args.files:
        p = pathlib.Path(name).resolve()
        slug = p.relative_to(ROOT / "src" / "content" / "notes").with_suffix("").as_posix()
        body = p.read_text(encoding="utf-8")
        seen = {}
        for m in FENCE.finditer(body):
            lang, code = m.group(1), m.group(2)
            if "output: PENDING" not in code:
                continue
            heads = re.findall(r"^## (.+)$", body[: m.start()], re.M)
            label = heads[-1].strip() if heads else "intro"
            seen[(label, lang)] = seen.get((label, lang), 0) + 1
            n = seen[(label, lang)]
            title = f"### {slug} · {lang} · {label}" + (f" ({n})" if n > 1 else "")
            if title in text:
                continue
            added.append(f"{title}\n\n```{lang}\n{code.rstrip()}\n```\n\nOutput:\n```\nPENDING\n```\n")
    if added:
        text = text.replace("_None yet._\n", "")
        text = text.rstrip("\n") + "\n\n" + "\n".join(added)
        log.write_text(text, encoding="utf-8", newline="\n")
    print(f"{len(added)} snippet(s) added to {log.relative_to(ROOT)}")
    return 0


def parse_answers(text):
    """Split a pasted answers file ('1.', '2.', … headers) into outputs; None for runs that failed."""
    parts = re.split(r"^\s*\d+\.\s*$", text.replace("\r\n", "\n"), flags=re.M)[1:]
    outs = []
    for part in parts:
        lines = part.split("\n")
        if "=== Code Exited With Errors ===" in part or any(re.match(r"\s*error(\[E\d+\])?:", l) for l in lines):
            outs.append(None)
            continue
        for i, l in enumerate(lines):  # compiler warnings go to stderr: drop everything up to their summary
            if re.match(r"warning: \d+ warnings? emitted", l):
                lines = lines[i + 1:]
                break
        lines = [l.rstrip() for l in lines if l.strip() != "ERROR!"]
        while lines and not lines[0]:
            lines.pop(0)
        while lines and not lines[-1]:
            lines.pop()
        outs.append(lines)
    return outs


def cmd_fill(args):
    """Replace `output: PENDING` markers, in order, with the outputs from an answers file."""
    note = pathlib.Path(args.note).resolve()
    outs = parse_answers(pathlib.Path(args.answers).read_text(encoding="utf-8"))
    body = note.read_text(encoding="utf-8").replace("\r\n", "\n")
    marks = list(re.finditer(r"^([ \t]*\S+ ?)output: PENDING.*$", body, re.M))
    if len(marks) != len(outs):
        print(f"{len(marks)} PENDING blocks but {len(outs)} answers: not changing anything")
        return 1
    filled = skipped = 0
    for m, out in reversed(list(zip(marks, outs))):
        if out is None:
            skipped += 1
            continue
        prefix = m.group(1)
        new = "\n".join([f"{prefix}output:"] + [(prefix + l).rstrip() for l in out])
        body = body[: m.start()] + new + body[m.end():]
        filled += 1
    note.write_text(body, encoding="utf-8", newline="\n")
    # drop this note's entries from the log, then log what is still PENDING
    log = ROOT / "refs" / "verify-snippets.md"
    slug = note.relative_to(ROOT / "src" / "content" / "notes").with_suffix("").as_posix()
    text = log.read_text(encoding="utf-8")
    text = re.sub(rf"### {re.escape(slug)} · .*?(?=\n### |\Z)", "", text, flags=re.S).rstrip("\n") + "\n"
    log.write_text(text, encoding="utf-8", newline="\n")
    print(f"{filled} filled, {skipped} failed runs left as PENDING")
    return cmd_pending(argparse.Namespace(files=[str(note)]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check")
    c.add_argument("area")
    c.add_argument("filter", nargs="?")
    c.set_defaults(fn=cmd_check)
    v = sub.add_parser("verify")
    v.add_argument("areas", nargs="*")
    v.set_defaults(fn=cmd_verify)
    s = sub.add_parser("shots")
    s.add_argument("paths", nargs="+")
    s.add_argument("--out")
    s.set_defaults(fn=cmd_shots)
    d = sub.add_parser("dollars")
    d.add_argument("files", nargs="+")
    d.add_argument("--apply", action="store_true")
    d.set_defaults(fn=cmd_dollars)
    pe = sub.add_parser("pending")
    pe.add_argument("files", nargs="+")
    pe.set_defaults(fn=cmd_pending)
    fi = sub.add_parser("fill")
    fi.add_argument("note")
    fi.add_argument("answers")
    fi.set_defaults(fn=cmd_fill)
    args = ap.parse_args()
    sys.exit(args.fn(args))


if __name__ == "__main__":
    main()
