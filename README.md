# All College Game Jam Works Archive

Static, data-driven archive for All College Game Jam student works. Each project uses the shared `team.html?id=…` detail page. Works appear newest year first, and the home page combines year and campus filters. Background playback prioritizes the newest available year. The 2026 thumbnails use game-video frames or representative final-presentation images when no video is available.

## 2025 archive

The original 2025 showcase remains available at [all-college-gamejam-2025](https://shahan-kimura.github.io/all-college-gamejam-2025/). This portal links to its already published proposal PDFs, slide images, thumbnails, and videos using absolute URLs. Those 2025 assets remain hosted by the existing showcase; they are not copied into this repository. The footer keeps a direct link to the original archive.

## 2026 catalog

The archive reuses the original 2025 showcase design and contains 69 works: 40 from 2025 and 29 from 2026, with combined year/campus filters across 14 campuses (13 represented in 2026). Every 2026 work has planning, interim, and final presentation materials: 78 planning pages, 127 interim pages, and 162 final pages. There are also 25 proposal documents across 22 works (17 PDFs containing 98 pages, plus 8 image-only sheets). Published copies mask personal identifiers; original Google files and sharing permissions were not changed.

There are 27 game/play links for 2026, including the four submissions linked through spreadsheet URL chips. Submitted games and archives were not modified or executed. Two works have no submitted distribution artifact. Drive links may require sign-in.

The 2026 pages include 26 videos with original audio preserved, including the Akihabara team 4 final play video and the newly submitted Akihabara team 3 and Omiya team 1 videos. The latter two are byte-identical original MP4s hosted in this repository's media-2026 GitHub Release to stay within the Pages size limit. Previously cropped frames have been restored. Video compression is retained where required for GitHub Pages hosting limits. Three works have no submitted video source.

The public `data/catalog.js` file contains the reviewed catalog used by the static pages. Public project details should use only reviewed, sanitized information and public assets under `assets/2026/` or reviewed video assets in this repository's `media-2026` GitHub Release. Private source files, original personal Slides or Docs links, and working materials belong outside the published site.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages when changes land on `main`, or when run manually. All pages and catalog data are static; a local preview can be served from this folder with any basic HTTP server.
