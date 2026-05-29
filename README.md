# FileBox

A clean and elegant local folder quick-access manager. A pure frontend single-file app — no installation needed, just open and use.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-2.6-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Element UI](https://img.shields.io/badge/Element_UI-2.15-409EFF?style=flat)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-6.5-528DD7?style=flat&logo=fontawesome&logoColor=white)

---

## Features

### 📂 Folder Management
- **Category Groups** — Folders organized by customizable categories with icons
- **Quick Open** — Click any card to open the local folder in your file explorer
- **Cover Images** — Upload custom images as folder covers with rounded corners
- **Icon Picker** — 200+ built-in Font Awesome icons to choose from
- **Sort** — Sort folders by name in ascending/descending order per category

### ✏️ CRUD Operations
- **Category CRUD** — Add, edit, and delete categories (deleting removes all folders within)
- **Folder CRUD** — Add, edit, and delete folders; move folders across categories
- **Browse to Select** — Use the system folder picker to select paths — no manual typing needed

### 🌐 Bilingual Support
- One-click toggle between Chinese and English
- Language preference is automatically saved

### 📱 Responsive Design
- Vertical sidebar navigation + content area layout
- Sidebar auto-hides on smaller screens for mobile compatibility

---

## Tech Stack

| Technology | Description |
|-------------|-------------|
| [Vue.js](https://vuejs.org/) 2.x | Reactive data-driven UI |
| [Element UI](https://element.eleme.io/) | UI component library (dialogs, forms, buttons, etc.) |
| [Font Awesome](https://fontawesome.com/) 6.x | Icon library |
| localStorage | Persistent data storage |
| File System Access API | System folder picker |

---

## Quick Start

### Option 1: Direct Open (Recommended)

Double-click `my-folders.html` to open it in your browser.

> ⚠️ Chrome or Edge is recommended for the best experience (full folder picker support).

### Option 2: Local Server

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Then visit `http://localhost:8080/my-folders.html`

---

## Usage

### Managing Categories
1. Click the **"Add Category"** button at the bottom of the sidebar to create a category
2. Hover over a category header to reveal the edit (✏️) and delete (🗑️) buttons
3. Click a category name in the sidebar to scroll to that section

### Managing Folders
1. Click the **dashed "Add Folder"** card in any category grid
2. Fill in the name and select a path (click **"Browse"** to use the system picker)
3. Optionally upload a cover image or select an icon
4. Hover over a folder card to reveal edit/delete buttons

### Sorting
- Hover over a category header and click the **A→Z** sort button
- Click again to toggle descending order

### Switching Language
- Click the **"EN / 中文"** button in the top-right corner of the navbar

---

## Data Storage

All data is persisted in the browser's `localStorage`:

| Key | Content |
|-----|---------|
| `my_folders_data_v2` | Categories and folders data (JSON) |
| `filebox_lang` | Language preference (`zh` / `en`) |

> 💡 Cover images are stored as Base64 strings. Each image is limited to 2MB.

---

## Project Structure

```
FileBox/
└── my-folders.html    # Single-file app (all HTML/CSS/JS included)
```

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 86+ | ✅ Full support (including folder picker) |
| Edge 86+ | ✅ Full support (including folder picker) |
| Firefox | ⚠️ Basic features work; folder picker requires manual path input |
| Safari | ⚠️ Basic features work; folder picker requires manual path input |

---

## License

MIT
