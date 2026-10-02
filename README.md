# All College Game Jam Works Archive

Static, data-driven archive for All College Game Jam student works. Each project uses the shared `team.html?id=…` detail page, and the home page combines year, campus, and keyword filters.

## 2025 archive

The original 2025 showcase remains available at [all-college-gamejam-2025](https://shahan-kimura.github.io/all-college-gamejam-2025/). This portal links to its already published proposal PDFs, slide images, thumbnails, and videos using absolute URLs. Those 2025 assets remain hosted by the existing showcase; they are not copied into this repository. The footer keeps a direct link to the original archive.

## 2026 catalog

The archive contains 69 works: 40 from 2025 and 29 from 2026, with combined year/campus filters across 14 campuses (13 represented in 2026). The 2026 set includes 29 interim reports (127 pages) and 21 proposal documents across 18 works (13 PDFs containing 90 pages, plus 8 image-only sheets). Published copies mask personal identifiers; original Google files and sharing permissions were not changed.

There are 23 game/play links for 2026: 13 Unity ZIPs checked from archive member listings, one game-only build folder, one Unityroom page, and 8 submitted build ZIPs identified from submission context and shown with an untested-build note. Games were not executed. Six works have no confirmed distribution artifact. Drive links may require sign-in.

The 2026 pages include 21 reviewed videos, with fixed crops where editor chrome appeared, metadata removed, and audio omitted because it was not reviewed. Each page states that its public video has no audio. Eight works have no video source.

The public `data/catalog.js` file contains the reviewed catalog used by the static pages. Public project details should use only reviewed, sanitized information and public assets under `assets/2026/`. Private source files, original personal Slides or Docs links, and working materials belong outside the published site.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages when changes land on `main`, or when run manually. All pages and catalog data are static; a local preview can be served from this folder with any basic HTTP server.
