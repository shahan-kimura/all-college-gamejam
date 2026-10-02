# All College Game Jam Works Archive

Static, data-driven archive for All College Game Jam student works. Each project uses the shared `team.html?id=…` detail page, and the home page combines year, campus, and keyword filters.

## 2025 archive

The original 2025 showcase remains available at [all-college-gamejam-2025](https://shahan-kimura.github.io/all-college-gamejam-2025/). This portal links to its already published proposal PDFs, slide images, thumbnails, and videos using absolute URLs. Those 2025 assets remain hosted by the existing showcase; they are not copied into this repository. The footer keeps a direct link to the original archive.

## 2026 catalog

The public `data/catalog.js` file contains the reviewed catalog used by the static pages. Public project details should use only reviewed, sanitized information and public assets under `assets/2026/`. Private source files, original personal Slides or Docs links, and working materials belong outside the published site.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages when changes land on `main`, or when run manually. All pages and catalog data are static; a local preview can be served from this folder with any basic HTTP server.
