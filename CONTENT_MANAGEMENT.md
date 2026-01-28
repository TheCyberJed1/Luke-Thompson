# Content Management System

This portfolio site now includes a dynamic content management system that allows you to add and manage content without editing HTML files directly.

## Features

### 1. Scripts Tab
A dedicated "Scripts" section has been added to the website navigation. This section displays automation scripts and tools for SOC operations.

- **URL**: `/scripts/index.html`
- **Data Source**: `/data/scripts.json`

### 2. Dynamic Content Loading
The site now dynamically loads content from JSON files instead of hardcoding it in HTML:

- **Labs & Training**: `/data/labs.json`
- **Scripts**: `/data/scripts.json`
- **Incident Writeups**: `/data/incidents.json`

### 3. Admin Panel
A web-based admin panel for managing content:

- **URL**: `/admin.html`
- **Purpose**: Add, edit, and remove labs, scripts, and incident writeups

## How to Use the Admin Panel

### Step 1: Access the Admin Panel
Open `/admin.html` in your browser (or go to `https://yourusername.github.io/repository-name/admin.html` when deployed).

### Step 2: Manage Content
1. Click on the appropriate tab (Labs, Scripts, or Incidents)
2. Fill in the form with your content details:
   - **ID**: A unique identifier (lowercase, hyphens only, e.g., `my-new-script`)
   - **Tag**: Category tag (e.g., "Python", "TryHackMe", "Network")
   - **Title**: Display title for the item
   - **Description**: Brief description of the content
   - **Doc File**: Markdown file name (optional for scripts)

3. Click "Add Item" to add it to the list
4. Review the item in the list below the form

### Step 3: Download Updated JSON
1. Click the "Download JSON" button for the content type you edited
2. This downloads the updated JSON file (e.g., `scripts.json`)

### Step 4: Update Repository
1. Upload the downloaded JSON file to the `/data/` directory in your repository
2. Commit and push the changes:
   ```bash
   git add data/scripts.json
   git commit -m "Add new script to collection"
   git push
   ```

### Step 5: View Changes
The changes will appear live on your site after the repository is updated.

## JSON File Structure

### Labs (`/data/labs.json`)
```json
[
  {
    "id": "unique-lab-id",
    "tag": "Platform",
    "title": "Lab Title",
    "description": "Lab description",
    "docFile": "lab-file.md"
  }
]
```

### Scripts (`/data/scripts.json`)
```json
[
  {
    "id": "unique-script-id",
    "tag": "Language",
    "title": "Script Title",
    "description": "Script description",
    "docFile": "script-file.md"  // optional
  }
]
```

### Incidents (`/data/incidents.json`)
```json
[
  {
    "id": "unique-incident-id",
    "tag": "Category",
    "title": "Incident Title",
    "description": "Incident description",
    "meta": "Alert ID: XXX · MITRE: TAXXXX",  // optional
    "docFile": "incident-file.md"
  }
]
```

## Adding Markdown Documentation

When you add a new lab, script, or incident, you should also create the corresponding markdown file:

1. Create a `.md` file in the appropriate directory:
   - Labs: `/labs-training/your-file.md`
   - Scripts: `/osint-tools/your-file.md` (note: scripts use osint-tools directory for now)
   - Incidents: `/incident-writeups/your-file.md`

2. Write your documentation in markdown format

3. Commit and push the markdown file along with the JSON update

## Benefits

- **No Code Editing**: Add content through a user-friendly interface
- **Version Control**: All changes tracked through Git
- **Scalability**: Easy to add unlimited items
- **Consistency**: Enforced structure through forms
- **Flexibility**: Edit JSON files directly if preferred

## Technical Details

- **Dynamic Loading**: JavaScript fetches JSON files on page load
- **Client-Side**: Admin panel runs entirely in the browser
- **Local Storage**: Temporary storage between edits (doesn't persist across devices)
- **Static Site**: No server-side processing required

## Troubleshooting

**Q: Changes don't appear on the site**
- A: Make sure you uploaded the JSON file to `/data/` and pushed to the repository

**Q: Items disappeared from admin panel**
- A: The admin panel loads from the JSON files. Clear your browser cache and reload

**Q: Form validation errors**
- A: Ensure IDs use only lowercase letters, numbers, and hyphens
- A: Markdown files must end with `.md`

## Future Enhancements

Potential improvements for the system:
- Direct GitHub API integration for automatic updates
- Markdown editor built into the admin panel
- Image upload functionality
- Bulk import/export features
- Preview before publishing
