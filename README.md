# pkoiralap.github.io
Personal website hosted on GitHub Pages.

## Project Structure

- **index.html**: Main entry point.
- **js/**: Contains Vue.js application logic.
  - **index.js**: Router and app initialization.
  - **events.js**: Data for the timeline on the Home page.
  - **components/**: Vue components for each section.
- **blogs/**: Markdown files for blog posts.
- **projects/**: Markdown files for project descriptions.
- **data/**: JSON indices for blogs and projects.
- **styles.css**: Global styles.

## How to add content

### Adding a new Blog Post
1. Create a new `.md` file in the `blogs/` folder. Name it using the format `YYYY-MM-DD-title.md`.
2. Update `data/blogs.json` to include the new file's metadata:
   ```json
   {
       "filename": "YYYY-MM-DD-title.md",
       "title": "Your Title",
       "date": "YYYY-MM-DD",
       "summary": "Short summary..."
   }
   ```

### Adding a new Project
1. Create a new `.md` file in the `projects/` folder.
2. Update `data/projects.json` with the metadata.

### Updating Timeline
1. Edit `js/events.js` and add a new object to the list.