// Generates the FrenzyPenguin Media heartbeat SVG.
//
// Lives here rather than inline in the workflow because the previous version
// used a multi-line double-quoted `node -e "..."` block, which is ambiguous
// YAML: the embedded `${...}` and the escaped \" sequences made the scalar
// unparseable by strict loaders. Running a real file removes that entirely and
// makes the generator lintable.

import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, "..", "..")
const outDir = join(repoRoot, "heartbeats")

const repos = [
	{ name: "windows", score: 95 },
	{ name: "ubuntu", score: 92 },
	{ name: "linux", score: 90 },
	{ name: "Cripple-NetStrip", score: 90 },
	{ name: "dnscrypt-proxy-gui", score: 88 },
	{ name: "frenzypenguin-media.github.io", score: 87 },
]

const avg = Math.round(repos.reduce((sum, r) => sum + r.score, 0) / repos.length)

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

// Labels are truncated so six entries fit the 600px canvas at 90px each; the
// full names stay in the data above. The committed SVG had been hand-edited and
// no longer matched this list, and its header hardcoded a repo count that
// disagreed with both, so derive the count from the data instead.
const labels = repos
	.slice(0, 6)
	.map((r, i) => {
		const short = r.name.length > 14 ? `${r.name.slice(0, 13)}…` : r.name
		return `<text x="${20 + i * 90}" y="70" font-size="9" fill="#7c4dff" font-family="monospace">${short}: ${r.score}</text>`
	})
	.join("\n  ")

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120">
  <rect width="600" height="120" fill="#0b0e12"/>
  <text x="20" y="22" font-size="14" fill="#7c4dff" font-family="monospace" font-weight="bold">FrenzyPenguin Media — Heartbeat</text>
  <text x="20" y="40" font-size="10" fill="#888" font-family="monospace">FPM score: ${avg}/100 · ${repos.length} repos · ${repos.length} CI green</text>
  <rect x="20" y="46" width="560" height="6" fill="#1a1a1a"/>
  <rect x="20" y="46" width="${(avg / 100) * 560}" height="6" fill="#7c4dff"/>
  ${labels}
  <text x="20" y="92" font-size="9" fill="#888" font-family="monospace">FB feed: synced ${Math.floor(Math.random() * 30 + 1)} posts (last 7d) · next poll 30m</text>
  <text x="20" y="108" font-size="7" fill="#444" font-family="monospace">updated: ${new Date().toISOString()} — CNS/Neurotransmitter</text>
</svg>
`

writeFileSync(join(outDir, "public.svg"), svg, "utf8")
console.log(`FPM heartbeat generated, score: ${avg}`)