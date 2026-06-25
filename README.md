# CareerHub: Job Application Tracker & Resume Version Controller

CareerHub is a premium, fully client-side single-page web application (SPA) designed to help job seekers manage their job search and resume versions in one unified interface.

## Key Features

1. **Job Application Tracker (Kanban Board)**
   - Drag-and-drop Kanban columns (Wishlist, Applied, Interviewing, Offer, Rejected).
   - Detailed job cards showing company, role, salary, date applied, and linked resume version.
   - Filter jobs by text search and status; sort by company name or application date.
   - Expandable slide-out panel for creating and editing applications.

2. **Resume Version Controller**
   - In-app Markdown editor with side-by-side live HTML rendering.
   - Version history tracking with version numbers (`v1.0`, `v1.1`, etc.) and commit messages describing changes.
   - Interactive line-by-line Diff Viewer to compare revisions (additions highlighted in green, deletions in red).
   - Quick export to HTML or print to PDF.

3. **Analytics Dashboard**
   - KPI counters for total applications, interviewing stages, conversion ratios, and offers.
   - Dynamic SVG-based charts:
     - Application Status Distribution (Donut Chart).
     - Response Funnel (from application to interview to offer).
     - Application Timeline (tracking applications over time).

## Tech Stack & Architecture

- **Frontend**: Vanilla HTML5, modern CSS3 (custom CSS variables, flexbox, grid, glassmorphic styles, keyframe animations).
- **Logic**: Pure Javascript ES6 (Modular architecture, HTML5 Drag & Drop API, SVG drawing helper functions).
- **Storage**: HTML5 `localStorage` for complete data persistence, initialized with high-quality seed data.

## Getting Started

Simply open `index.html` in any modern web browser. No server setup or Node.js dependencies are required!

```bash
# To run local development (optional, any web server works):
npx serve .
```

## Folder Structure

- `index.html` - The main layout skeleton and views.
- `styles.css` - Custom styling tokens, layout grids, animations, and markdown formatting.
- `js/`
  - `app.js` - Global coordinator, tab router, and event registry.
  - `storage.js` - Data layer for loading, saving, and seeding data.
  - `dashboard.js` - Analytics calculation and SVG rendering.
  - `tracker.js` - Kanban board manager, form handler, and drag-and-drop logic.
  - `resume.js` - Markdown parser, resume editor, version history, and diff comparison.
