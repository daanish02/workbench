# /// script
# requires-python = "==3.14.*"
# dependencies = [
#   "pillow==11.3.0",
#   "numpy==2.5.4",
# ]
# ///
"""One entry point for the checks used while writing notes.

  uv run scripts/note_tools.py check <area> [filter]   run every Python block (wraps check_notes.py)
  uv run scripts/note_tools.py verify [area ...]       bun run build, then katex-error and control-character checks
  uv run scripts/note_tools.py shots <url-path> ...    screenshot built pages and crop each figure to a PNG
  uv run scripts/note_tools.py dollars [--apply] FILE  find (or escape) money like $30,000 that KaTeX reads as math
  uv run scripts/note_tools.py pending FILE ...        log code blocks marked `output: PENDING` in refs/verify-snippets.md
  uv run scripts/note_tools.py fill NOTE ANSWERS       fill PENDING outputs from a numbered answers file, in order
  uv run scripts/note_tools.py links MODE [options]    link audit: stats | mentions | similar | compare (see below)

shots needs a built site (`bun run build`); it starts `bun run preview` on port 4399 if nothing is listening
there, and uses headless Microsoft Edge. Paths look like `infra/storage/raid` (no /workbench prefix).
Crops land in --out (default: .shots/ in the repo, which is gitignored) as <page>_fig<N>.png, in page order.

links reads the notes the way src/lib/graph.ts does (markdown links outside code blocks) and never edits anything:
  stats      notes, links, orphans, dead ends, sinks, area-to-area matrix, weakest sections, components, hubs
  mentions   note titles (and acronyms in titles) that a note mentions without linking to them
  similar    TF-IDF cosine similarity between notes that are not linked to each other
  compare    overlap between mentions and the top similar pairs
  orphans    notes with no links either way, with the signals that say whether a link is missing
  apply F    wrap the first prose mention for each `src -> dst` line of file F in a link (dry run unless --write)
Options: --area A (source area), --to B (target area), --cross (cross-area only), --limit N, --sections, --write.
Orphans that were reviewed and are fine without links go in REVIEWED_LEAVES (note id -> reason).
Rules: link when the reader needs the target or it is the natural next step, first useful mention only, never to force
coverage. Read the area-pair table (per 1000 pairs, fill%) against the within-area fill, not against 100%.
Appendix sections and stub notes are left out. Aliases for mentions go in ALIASES below.
"""

import argparse
import math
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
from collections import Counter
from types import SimpleNamespace

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

NOTE_ROOT = ROOT / "src" / "content" / "notes"
PLACEHOLDER = "Placeholder. Content not written yet."
AREA_ORDER = ["math", "infra", "cs", "ml", "dl", "applied-dl"]
# extra names for a note, keyed by note id, beyond its title and any "(ACRONYM)" in the title
ALIASES = {}
STOP = set(
    "the and for are but not you all can had her was one our out has have that this with from they will would there "
    "their what about which when your said each she how its who may into than them these then some time very been "
    "more other were also only over such most any those both after being does just like use used using make made "
    "many much well where while should could between because through before same must".split()
)
CODE = re.compile(r"```[\s\S]*?```")


def load_notes():
    notes = []
    for p in sorted(NOTE_ROOT.rglob("*.mdx")):
        nid = p.relative_to(NOTE_ROOT).with_suffix("").as_posix()
        parts = nid.split("/")
        if len(parts) != 3:
            continue
        raw = p.read_text(encoding="utf-8").replace("\r\n", "\n")
        m = re.match(r"---\n(.*?)\n---\n(.*)", raw, re.S)
        fm, body = (m.group(1), m.group(2)) if m else ("", raw)

        def field(key):
            hit = re.search(rf'^{key}:\s*"(.*)"\s*$', fm, re.M)
            return hit.group(1) if hit else ""

        notes.append(SimpleNamespace(
            id=nid, area=parts[0], section=parts[1], title=field("title"), order=int((re.search(r"^order:\s*(\d+)", fm, re.M) or [0, 0])[1]), desc=field("description"),
            takeaways=" ".join(re.findall(r'^  - "(.*)"\s*$', fm, re.M)), body=CODE.sub("", body),
            stub=PLACEHOLDER in body, appendix=parts[1].startswith("appendix"),
        ))
    return notes


def resolve(from_id, link):
    """Same resolution as src/lib/graph.ts: a note-id-shaped path, or None for external links."""
    href = link.split("#")[0]
    if not href or re.match(r"(https?:|mailto:)", href):
        return None
    if href.startswith("/workbench/"):
        path = href[len("/workbench/"):]
    elif href.startswith("/"):
        return None
    else:
        path = f"{from_id}/{href}"
    parts = []
    for seg in path.split("/"):
        if seg == "..":
            if parts:
                parts.pop()
        elif seg and seg != ".":
            parts.append(seg)
    return "/".join(parts)


def build_edges(notes):
    index = {n.id: i for i, n in enumerate(notes)}
    edges = set()
    for i, n in enumerate(notes):
        for m in re.finditer(r"\]\(([^)\s]+)\)", re.sub(r"`[^`\n]*`", "", n.body)):  # inline code is not a link, as in graph.ts
            target = resolve(n.id, m.group(1))
            j = index.get(target) if target else None
            if j is not None and j != i:
                edges.add((i, j))
    return edges


def clean(text, keep_links=False):
    """Prose only: drop math, inline code, tags, and (unless keep_links) the text of existing links."""
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1" if keep_links else " ", text)
    text = re.sub(r"\$\$.*?\$\$|\$[^$\n]*\$", " ", text, flags=re.S)
    text = re.sub(r"`[^`\n]*`", " ", text)
    return re.sub(r"<[^>]+>", " ", text)


def stem(w):
    return w[:-1] if len(w) > 3 and w.endswith("s") and not w.endswith("ss") else w


def links_stats(notes, edges, args):
    live = {i for i, n in enumerate(notes) if not n.appendix}
    e = {(a, b) for a, b in edges if a in live and b in live}
    out, inn = Counter(a for a, _ in e), Counter(b for _, b in e)
    written = [i for i in live if not notes[i].stub]
    areas = [a for a in AREA_ORDER if any(notes[i].area == a for i in live)]
    print(f"{len(live)} notes ({len(written)} written, {len(live) - len(written)} stubs), {len(e)} links; appendix sections left out\n")
    print(f"{'area':<11}{'notes':>6}{'out/note':>9}{'in/note':>8}{'cross%':>7}{'orphans':>8}{'dead-end':>9}{'sinks':>6}")
    for a in areas:
        w = [i for i in written if notes[i].area == a]
        ae = [(x, y) for x, y in e if notes[x].area == a]
        cross = sum(1 for x, y in ae if notes[y].area != a)
        orphans = sum(1 for i in w if not out[i] and not inn[i])
        print(f"{a:<11}{len(w):>6}{len(ae) / max(len(w), 1):>9.1f}{sum(inn[i] for i in w) / max(len(w), 1):>8.1f}"
              f"{100 * cross / max(len(ae), 1):>7.0f}{orphans:>8}{sum(1 for i in w if not out[i]):>9}{sum(1 for i in w if not inn[i]):>6}")
    print("\nlinks from row area to column area")
    print(f"{'':<11}" + "".join(f"{a:>11}" for a in areas))
    for a in areas:
        print(f"{a:<11}" + "".join(f"{sum(1 for x, y in e if notes[x].area == a and notes[y].area == b):>11}" for b in areas))
    links_by_size(notes, edges, e, written, areas)
    secs = {}
    for i in written:
        secs.setdefault((notes[i].area, notes[i].section), []).append(i)
    rows = sorted(((sum(out[i] + inn[i] for i in m) / len(m), k, len(m)) for k, m in secs.items() if len(m) >= 3))
    print("\nsections by links per note (out + in), " + ("all" if args.sections else "weakest 12"))
    for score, (a, s), n in rows if args.sections else rows[:12]:
        print(f"  {score:5.1f}  {a}/{s}  ({n} notes)")
    parent = {i: i for i in written}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for x, y in e:
        if x in parent and y in parent:
            parent[find(x)] = find(y)
    comps = {}
    for i in written:
        comps.setdefault(find(i), []).append(i)
    sizes = sorted((len(c) for c in comps.values()), reverse=True)
    print(f"\n{len(comps)} connected component(s) among written notes; sizes {sizes[:8]}")
    for c in sorted(comps.values(), key=len)[:-1][:6]:
        print("  small component:", ", ".join(notes[i].id for i in c[:6]))
    print("\ntop hubs by incoming links: " + ", ".join(f"{notes[i].id.split('/', 2)[2]} ({inn[i]})" for i in sorted(written, key=lambda i: -inn[i])[:8]))
    orph = [notes[i].id for i in written if not out[i] and not inn[i] and notes[i].id not in REVIEWED_LEAVES]
    print(f"\norphans (no links either way, not yet reviewed): {len(orph)}; run `links orphans` for the signals" + "".join(f"\n  {o}" for o in orph[:25]))


def links_by_size(notes, edges, e, written, areas):
    """Area-pair table normalised by size, so a large area is not read as 'more linked' just for having more notes."""
    sims = similar_pairs(notes, set())  # every pair, linked or not, best first
    plausible = {frozenset((p.a, p.b)) for p in sims if p.score >= 0.2}
    cands, _ = mention_candidates(notes, set(), keep_links=True)  # linked mentions count too, so linking does not shrink the set
    plausible |={frozenset((c.src, c.dst)) for c in cands}
    linked = {frozenset(x) for x in e}
    by_area = {a: [i for i in written if notes[i].area == a] for a in areas}
    print("\nby area pair, adjusted for size (each pair of notes counted once)")
    print(f"{'pair':<22}{'links':>6}{'per 1000':>9}{'A->B notes':>11}{'B->A notes':>11}{'plausible':>10}{'linked':>7}{'fill%':>6}")
    for ai, a in enumerate(areas):
        for b in areas[ai:]:
            na, nb = by_area[a], by_area[b]
            sb, sa = set(nb), set(na)
            pairs = len(na) * (len(na) - 1) // 2 if a == b else len(na) * len(nb)
            links = sum(1 for x in linked if len(x) == 2 and ((a == b and all(i in sa for i in x)) or (a != b and any(i in sa for i in x) and any(i in sb for i in x))))
            a_to_b = sum(1 for i in na if any(x == i and y in sb and y != i for x, y in e))
            b_to_a = sum(1 for i in nb if any(x == i and y in sa and y != i for x, y in e))
            plaus = [q for q in plausible if (a == b and all(i in sa for i in q)) or (a != b and any(i in sa for i in q) and any(i in sb for i in q))]
            hit = sum(1 for q in plaus if q in linked)
            print(f"{a + ' - ' + b:<22}{links:>6}{1000 * links / max(pairs, 1):>9.1f}{100 * a_to_b / max(len(na), 1):>10.0f}%{100 * b_to_a / max(len(nb), 1):>10.0f}%{len(plaus):>10}{hit:>7}{100 * hit / max(len(plaus), 1):>6.0f}")
    print("per 1000 = links per 1000 possible note pairs; A->B notes = share of A notes that link to any B note;")
    print("plausible = pairs with TF-IDF similarity >= 0.2 or an unlinked title mention; fill% = share of those already linked")
    out = Counter(a for a, _ in e)
    words = {i: len(re.findall(r"\w+", clean(notes[i].body, keep_links=True))) for i in written}
    dense = sorted(written, key=lambda i: -out[i])[:5]
    print("\nmost outgoing links: " + ", ".join(f"{notes[i].id.split('/', 2)[2]} ({out[i]}, {1000 * out[i] / max(words[i], 1):.1f}/1000 words)" for i in dense))
    for a in (a for a in areas if by_area[a]):
        vals = sorted(out[i] for i in by_area[a])
        print(f"{a:<11} median {vals[len(vals) // 2]} outgoing, {sum(1 for v in vals if v > 10)} notes over 10, {sum(1 for v in vals if v == 0)} with none")


# notes that were looked at and are fine without links, keyed by note id: they stop showing as orphans in `links stats`
REVIEWED_LEAVES = {}
MASK = re.compile(r"`[^`\n]*`|\$\$.*?\$\$|\$[^$\n]*\$|\[[^\]]*\]\([^)]*\)|<[^>]+>|https?://\S+")


def links_orphans(notes, edges, args):
    """For every written note with no links either way, list the signals that say whether a link is missing."""
    live = {i for i, n in enumerate(notes) if not n.appendix}
    e = {(a, b) for a, b in edges if a in live and b in live}
    out, inn = Counter(a for a, _ in e), Counter(b for _, b in e)
    written = [i for i in live if not notes[i].stub]
    orphans = [i for i in written if not out[i] and not inn[i] and notes[i].id not in REVIEWED_LEAVES]
    if args.area:
        orphans = [i for i in orphans if notes[i].area == args.area]
    cands, _ = mention_candidates(notes, edges)
    sims = similar_pairs(notes, edges)
    sections = {}
    for i in written:
        sections.setdefault((notes[i].area, notes[i].section), []).append(i)
    short = lambda j: notes[j].id.split("/", 1)[1]
    print(f"{len(orphans)} orphans to review ({len(REVIEWED_LEAVES)} already reviewed as leaves)")
    print("signals: mentioned by / mentions = titles named in the text without a link; similar = TF-IDF >= 0.12; section = neighbours by order\n")
    for i in sorted(orphans, key=lambda i: notes[i].id):
        to_it = sorted((c for c in cands if c.dst == i), key=lambda c: -c.score)[:3]
        from_it = sorted((c for c in cands if c.src == i), key=lambda c: -c.score)[:3]
        sim = sorted(((p.score, p.b if p.a == i else p.a) for p in sims if i in (p.a, p.b) and p.score >= 0.12), reverse=True)[:3]
        sib = sorted(sections[(notes[i].area, notes[i].section)], key=lambda j: notes[j].order)
        pos = sib.index(i)
        print(f"{'check' if to_it or from_it or sim else 'likely leaf':<12} {notes[i].id}")
        print(f"    mentioned by: {[short(c.src) + ' [' + c.term + ']' for c in to_it]}")
        print(f"    mentions:     {[short(c.dst) + ' [' + c.term + ']' for c in from_it]}")
        print(f"    similar:      {[(round(s, 2), short(j)) for s, j in sim]}")
        print(f"    section:      prev={short(sib[pos - 1]) if pos else '-'}  next={short(sib[pos + 1]) if pos + 1 < len(sib) else '-'}")


def rel_link(src, dst):
    s, d = src.split("/"), dst.split("/")
    if s[:2] == d[:2]:
        return f"../{d[2]}/"
    if s[0] == d[0]:
        return f"../../{d[1]}/{d[2]}/"
    return f"../../../{d[0]}/{d[1]}/{d[2]}/"


def links_apply(notes, edges, args):
    """Wrap the first prose mention of a target's title in a link. PAIRS lines: `src_id -> dst_id` or `src_id -> dst_id | regex`.
    Dry run unless --write. Skips headings, tables, code, math and text that is already a link; skips pairs already linked."""
    by_id = {n.id: n for n in notes}
    done = missed = 0
    for raw in pathlib.Path(args.pairs).read_text(encoding="utf-8").splitlines():
        raw = raw.strip()
        if not raw or raw.startswith("#"):
            continue
        custom = None
        if "|" in raw:
            raw, custom = [x.strip() for x in raw.split("|", 1)]
        src, dst = [x.strip() for x in raw.split("->")]
        path = NOTE_ROOT / f"{src}.mdx"
        text = path.read_bytes().decode("utf-8")
        nl = "\r\n" if "\r\n" in text else "\n"
        lines = text.replace("\r\n", "\n").split("\n")
        link = rel_link(src, dst)
        if f"]({link})" in text:
            print(f"already linked: {src} -> {dst}")
            continue
        if custom:
            pat = re.compile(custom, re.I)
        else:
            base = re.sub(r"\s*\([^)]*\)", "", by_id[dst].title).strip()
            words = [re.escape(stem(w.lower())) + "s?" for w in re.findall(r"[A-Za-z0-9]+", base)]
            pat = re.compile(r"(?<![\w-])" + r"[\s-]+".join(words) + r"(?![\w-])", re.I)
        fences, in_code, hit = 0, False, False
        for k, line in enumerate(lines):
            if line.strip() == "---" and fences < 2:
                fences += 1
                continue
            if fences < 2:
                continue
            if line.strip().startswith("```"):
                in_code = not in_code
                continue
            if in_code or line.startswith(("#", "|", "import ", "<")):
                continue
            m = pat.search(MASK.sub(lambda x: " " * len(x.group()), line))
            if not m:
                continue
            print(f"{src.split('/', 2)[2]} -> {dst.split('/', 2)[2]}: ...{line[max(0, m.start() - 50):m.start()]}[[{line[m.start():m.end()]}]]{line[m.end():m.end() + 40]}...")
            if args.write:
                lines[k] = line[:m.start()] + f"[{line[m.start():m.end()]}]({link})" + line[m.end():]
                path.write_bytes(nl.join(lines).encode("utf-8"))
            hit = True
            break
        done, missed = done + hit, missed + (not hit)
        if not hit:
            print(f"NO SPOT (add a sentence by hand): {src} -> {dst}")
    print(f"{done} linked, {missed} without a spot" + ("" if args.write else " (dry run; add --write to apply)"))


def mention_candidates(notes, edges, keep_links=False):
    """(source, target) pairs where the source names the target's title or acronym without linking to it."""
    lex, acr = {}, {}
    for j, n in enumerate(notes):
        if n.appendix or n.stub:
            continue
        base = re.sub(r"\s*\([^)]*\)", "", n.title).strip()
        names = {base, n.title, *re.findall(r"\(([A-Z][A-Za-z0-9]{1,8})\)", n.title), *ALIASES.get(n.id, [])}
        for name in names:
            ws = re.findall(r"[A-Za-z0-9]+", name)
            if len(name) < 3 or not ws:
                continue
            if len(ws) == 1 and name.isupper():
                acr.setdefault(name, set()).add(j)
            else:
                lex.setdefault(tuple(stem(w.lower()) for w in ws), set()).add(j)
    maxn = max(len(k) for k in lex)
    hits = {}  # (source, key) -> [count, snippet]
    for i, n in enumerate(notes):
        if n.appendix or n.stub:
            continue
        text = clean(n.body, keep_links=keep_links)
        toks =[(m.group(), m.start(), m.end()) for m in re.finditer(r"[A-Za-z0-9]+", text)]
        low = [stem(w.lower()) for w, _, _ in toks]
        for k in range(len(toks)):
            found = []
            for size in range(1, maxn + 1):
                key = tuple(low[k:k + size])
                if len(key) == size and key in lex:
                    found.append((key, size))
            if toks[k][0] in acr:
                found.append((("ACR", toks[k][0]), 1))
            for key, size in found:
                s, e = toks[k][1], toks[k + size - 1][2]
                h = hits.setdefault((i, key), [0, " ".join(text[max(0, s - 60):e + 60].split())])
                h[0] += 1
    live = sum(1 for n in notes if not n.appendix and not n.stub)
    df = Counter(key for _, key in hits)
    common = {key for key, c in df.items() if c > 0.15 * live}
    cands = {}
    for (i, key), (count, snippet) in hits.items():
        if key in common:
            continue
        targets = acr[key[1]] if key[0] == "ACR" else lex[key]
        weight = 1.0 if key[0] == "ACR" or len(key) > 1 else 0.5
        for j in targets:
            if j == i or (i, j) in edges:
                continue
            c = cands.setdefault((i, j), SimpleNamespace(src=i, dst=j, score=0.0, term=" ".join(key[1:] if key[0] == "ACR" else key), snippet=snippet))
            c.score += weight * count
    return list(cands.values()), sorted(" ".join(k[1:] if k[0] == "ACR" else k) for k in common)


def similar_pairs(notes, edges):
    import numpy as np

    idx = [i for i, n in enumerate(notes) if not n.appendix and not n.stub]
    docs = []
    for i in idx:
        n = notes[i]
        text = (n.title + " ") * 3 + n.desc + " " + n.takeaways + " " + clean(n.body, keep_links=True)
        docs.append(Counter(stem(w) for w in re.findall(r"[a-z]{3,}", text.lower()) if w not in STOP))
    df = Counter(t for d in docs for t in d)
    size = len(docs)
    vocab = {t: k for k, t in enumerate(t for t, c in df.items() if 2 <= c <= 0.3 * size)}
    X = np.zeros((size, len(vocab)), dtype=np.float32)
    for r, d in enumerate(docs):
        for t, c in d.items():
            if t in vocab:
                X[r, vocab[t]] = (1 + math.log(c)) * (math.log((size + 1) / (df[t] + 1)) + 1)
    X /= np.linalg.norm(X, axis=1, keepdims=True).clip(min=1e-9)
    sims = X @ X.T
    words = list(vocab)
    ia, ib = np.triu_indices(size, 1)
    order = np.argsort(-sims[ia, ib])
    pairs = []
    for o in order:
        a, b = int(ia[o]), int(ib[o])
        x, y = idx[a], idx[b]
        if (x, y) in edges or (y, x) in edges:
            continue
        shared = np.argsort(-(X[a] * X[b]))[:5]
        pairs.append(SimpleNamespace(a=x, b=y, score=float(sims[a, b]), terms=[words[k] for k in shared if X[a, k] * X[b, k] > 0]))
        if len(pairs) >= 4000:
            break
    return pairs


def area_filter(notes, args, src, dst):
    if args.area and notes[src].area != args.area:
        return False
    if args.to and notes[dst].area != args.to:
        return False
    return not args.cross or notes[src].area != notes[dst].area


def pair_matrix(notes, pairs):
    counts = Counter((notes[a].area, notes[b].area) for a, b in pairs)
    areas = [a for a in AREA_ORDER if any(a in k for k in counts)]
    print(f"{'from \\ to':<11}" + "".join(f"{a:>11}" for a in areas))
    for a in areas:
        print(f"{a:<11}" + "".join(f"{counts.get((a, b), 0):>11}" for b in areas))


def links_mentions(notes, edges, args):
    cands, common = mention_candidates(notes, edges)
    cands = sorted((c for c in cands if area_filter(notes, args, c.src, c.dst)), key=lambda c: -c.score)
    print(f"{len(cands)} unlinked mentions (source area {args.area or 'any'} -> target area {args.to or 'any'}{', cross-area' if args.cross else ''})")
    print(f"skipped as too common (in over 15% of notes): {len(common)} terms, e.g. {', '.join(common[:12])}\n")
    pair_matrix(notes, [(c.src, c.dst) for c in cands])
    print()
    for c in cands[:args.limit]:
        print(f"{c.score:5.1f}  {notes[c.src].id} -> {notes[c.dst].id}   [{c.term}]\n        ...{c.snippet}...")


def links_similar(notes, edges, args):
    pairs = [p for p in similar_pairs(notes, edges) if area_filter(notes, args, p.a, p.b) or area_filter(notes, args, p.b, p.a)]
    print(f"top {min(args.limit, len(pairs))} of {len(pairs)} unlinked pairs by TF-IDF cosine (area {args.area or 'any'} / {args.to or 'any'}{', cross-area' if args.cross else ''})\n")
    pair_matrix(notes, [(p.a, p.b) for p in pairs[:500]])
    print("\n(counts above cover the top 500 pairs)\n")
    for p in pairs[:args.limit]:
        print(f"{p.score:.3f}  {notes[p.a].id}  <->  {notes[p.b].id}\n        shared: {', '.join(p.terms)}")


def links_compare(notes, edges, args):
    cands, _ = mention_candidates(notes, edges)
    mset = {}
    for c in cands:
        key = frozenset((c.src, c.dst))
        if key not in mset or c.score > mset[key].score:
            mset[key] = c
    sims = similar_pairs(notes, edges)[:args.limit]
    sset = {frozenset((p.a, p.b)): p for p in sims}
    both = [k for k in sset if k in mset]
    cross = lambda ks: sum(1 for k in ks if len({notes[i].area for i in k}) > 1)
    print(f"mentions: {len(mset)} unlinked pairs ({cross(mset)} cross-area)")
    print(f"similar:  top {len(sset)} pairs ({cross(sset)} cross-area)")
    print(f"both:     {len(both)} pairs\n")
    show = lambda k: " <-> ".join(notes[i].id for i in sorted(k))
    print("in both (strongest evidence):")
    for k in both[:12]:
        print(f"  {sset[k].score:.3f}  {show(k)}   [{mset[k].term}; {', '.join(sset[k].terms[:3])}]")
    print("\nonly similar (no title mentioned):")
    for k in [k for k in sset if k not in mset][:12]:
        print(f"  {sset[k].score:.3f}  {show(k)}   [{', '.join(sset[k].terms[:4])}]")
    print("\nonly mentions (text not similar enough):")
    for k in sorted((k for k in mset if k not in sset), key=lambda k: -mset[k].score)[:12]:
        print(f"  {mset[k].score:4.1f}  {notes[mset[k].src].id} -> {notes[mset[k].dst].id}   [{mset[k].term}]")


def cmd_links(args):
    notes = load_notes()
    edges = build_edges(notes)
    {"stats": links_stats, "mentions": links_mentions, "similar": links_similar, "compare": links_compare, "orphans": links_orphans, "apply": links_apply}[args.mode](notes, edges, args)
    return 0


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
    ln = sub.add_parser("links")
    ln.add_argument("mode", choices=["stats", "mentions", "similar", "compare", "orphans", "apply"])
    ln.add_argument("pairs", nargs="?")
    ln.add_argument("--write", action="store_true")
    ln.add_argument("--area")
    ln.add_argument("--to")
    ln.add_argument("--cross", action="store_true")
    ln.add_argument("--limit", type=int, default=30)
    ln.add_argument("--sections", action="store_true")
    ln.set_defaults(fn=cmd_links)
    args = ap.parse_args()
    sys.exit(args.fn(args))


if __name__ == "__main__":
    main()
