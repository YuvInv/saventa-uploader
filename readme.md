# Saventa Uploader

A Chrome Extension for bulk uploading companies to Sevanta Dealflow CRM.

## Features

- **No API Key Required** - Uses your existing Sevanta login session
- **CSV Upload** - Drag-and-drop or browse for CSV files
- **Smart Column Mapping** - Auto-detects and maps CSV columns to CRM fields
- **Validation** - Checks required fields, dropdown values, and data formats
- **Duplicate Detection** - Warns about existing companies before upload
- **Inline Editing** - Fix issues directly in the review table
- **Progress Tracking** - See upload status in real-time

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/saventa-uploader.git
   cd saventa-uploader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. **Log into Sevanta** - Go to [run.mydealflow.com](https://run.mydealflow.com) and log in
2. **Click the extension icon** - You should see "Connected to Sevanta"
3. **Upload CSV** - Drag and drop or select your CSV file
4. **Map columns** - Review and adjust the column mappings
5. **Review data** - Check for validation errors and duplicates
6. **Upload** - Click "Upload X Companies" to start

## CSV Format

Your CSV should have:
- A header row with column names
- A `CompanyName` column (required)
- Other columns matching CRM fields (Website, Sector, Stage, etc.)

Example:
```csv
CompanyName,Website,Sector,Stage
Acme Corp,acme.com,SaaS,Seed
Beta Inc,beta.io,Fintech,Series A
```

## Development

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Generate icons (if needed)
node scripts/generate-icons.js
```

## Tech Stack

- React 18 + TypeScript
- Vite + CRXJS (Chrome Extension bundling)
- TailwindCSS
- Papa Parse (CSV parsing)

## Troubleshooting

**"Not connected" message**
- Make sure you're logged into Sevanta at run.mydealflow.com
- Try refreshing the Sevanta page and reopening the extension

**Validation errors**
- Check that required fields (like CompanyName) are filled in
- Verify dropdown values match the CRM's options

**Upload failures**
- Check your internet connection
- Some companies may fail due to server-side validation
- Review the error message for each failed company

## Architecture

```
Chrome Extension (Manifest V3)
├── Popup UI (React + TypeScript)
│   ├── CSV upload & parsing
│   ├── Column mapping
│   ├── Data validation
│   ├── Review & edit table
│   └── Upload progress
│
└── Background Service Worker
    ├── API calls to Sevanta
    ├── Rate limiting
    └── Schema caching
```

The extension uses your browser's existing login session to Sevanta Dealflow - no API key configuration needed.

## License

MIT
