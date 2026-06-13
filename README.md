# pkoiralap.github.io
Personal website and interactive portfolio hosted on GitHub Pages.

## Project Structure

- **index.html**: Main SPA entry point and ES Module bootstrapper.
- **js/**: Core application logic.
  - **index.js**: Router and app initialization.
  - **utils.js**: The custom mounting engine (sandboxing, CSS scoping, script execution).
  - **components/**: Vue components for each section (Timeline, Projects, Blogs).
- **blogs/**: Markdown files for standard articles.
- **projects/**: Fully isolated HTML/CSS/JS packages for interactive showcases.
- **events/**: Isolated components for the interactive timeline.
- **data/**: JSON indices driving the dynamic content.
- **styles.css**: Global "Vintage Print" design system tokens.

## How to add content

### Adding a new Blog Post
1. Create a new `.md` file in the `blogs/` folder. Name it: `YYYY-MM-DD-title.md`.
2. Update `data/blogs.json` with metadata.

### Adding a new Project (Interactive Package)
1. Create a new directory in `projects/` (e.g., `projects/YYYY-MM-DD-my-project/`).
2. Include `main.html`, `style.css`, and `main.js`.
3. Update `data/projects.json` to register the new project path.

### Adding a new Event (Interactive Component)
1. Create a directory in `events/`.
2. Include necessary assets and register in `data/events.json`.

## Blogs
Latest Post: [The "Website Inception": Why I built my portfolio this way](blogs/2026-06-13-website-inception.md) - A humorous dive into the architectural madness of this site.
