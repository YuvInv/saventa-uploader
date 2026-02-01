# Sevanta Uploader - TODO

> All tasks are tracked in [GitHub Issues](https://github.com/YuvInv/sevanta-uploader/issues)

## Completed

- [x] **Duplicate Check** - Fixed using `_text=` and `_ss=` search parameters instead of broken `filter[]`
- [x] **Contacts/Founders Upload** - CSV can include founder columns, contacts created and linked to deals
- [x] **CSV Template Download** - Download button with field descriptions and optional contact fields
- [x] **Side Panel UI** - Modern side panel interface instead of popup
- [x] **Remove 'View Schema' Option** ([#7](https://github.com/YuvInv/sevanta-uploader/issues/7)) - Removed debug feature from UI
- [x] **Simplified CSV Template** ([#1](https://github.com/YuvInv/sevanta-uploader/issues/1)) - Template with commonly used fields only
- [x] **Fix Contacts Upload** ([#10](https://github.com/YuvInv/sevanta-uploader/issues/10)) - Fixed contact creation and linking to deals
- [x] **Set Automatic Default Fields** ([#8](https://github.com/YuvInv/sevanta-uploader/issues/8)) - Auto-populate Source Notes, DealTypes, and SourceType

---

## Next Up

### 1. Add Discard Row Option for Duplicates ([#9](https://github.com/YuvInv/sevanta-uploader/issues/9)) - Priority: High
When uploading CSV with companies that already exist:

- Allow users to "discard" individual rows
- Do NOT allow editing of existing companies through the extension
- Clear UI indication of which rows will be skipped

---

### 2. Dealigence Integration ([#2](https://github.com/YuvInv/sevanta-uploader/issues/2)) - Priority: Medium
Import companies directly from Dealigence platform.

**Approach:**
- Content script for `https://app.dealigence.com/*`
- "Send to Sevanta" button on company pages
- Extract: company name, description, website, founders
- Send to side panel for review before upload

**Files to create:**
- `src/content/dealigence.ts` - Content script
- `src/lib/extractors/dealigence.ts` - Data extraction
- Update `manifest.json` - Add content script config

**Notes:**
- User must be logged into Dealigence
- Need to analyze DOM structure of target pages
- Handle gracefully if page structure changes

---

### 3. IVC Integration ([#3](https://github.com/YuvInv/sevanta-uploader/issues/3)) - Priority: Medium
Import companies directly from IVC (Israel Venture Capital) database.

**Approach:**
- Content script for `https://www.ivc-online.com/*`
- "Send to Sevanta" button on company profiles
- Map IVC fields to Sevanta CRM fields

**Files to create:**
- `src/content/ivc.ts` - Content script
- `src/lib/extractors/ivc.ts` - Data extraction
- Update `manifest.json` - Add content script config

**Notes:**
- User must be logged into IVC
- Need to analyze DOM structure of target pages
- Handle gracefully if page structure changes

---

### 4. GitHub CI/CD for Build & Publish ([#4](https://github.com/YuvInv/sevanta-uploader/issues/4)) - Priority: Low
Set up GitHub Actions to automatically build and publish the extension.

---

### 5. Additional Enhancements - Priority: Low
- Progress bar during CSV upload
- Error handling improvements
- Changing extension icon to VC logo

---

## AI Features (Future)

### 6. Auto-Updates from News ([#5](https://github.com/YuvInv/sevanta-uploader/issues/5)) - Priority: Low
Automatically crawl news sites (Ctech, Geektime) to:
- Update existing companies with new funding rounds
- Add new companies with AI-generated summaries
- Match screening meeting summary format

---

### 7. AI Features: Company Enrichment ([#6](https://github.com/YuvInv/sevanta-uploader/issues/6)) - Priority: Low
Integrate with Perplexity (or similar) for:
- Auto-enrichment of company profiles (funding, founders, history)
- AI-driven CRM updates for outdated/missing data
- User-controlled review and acceptance of changes

---

## Field Reference (Commonly Used)

| DB Name | Label | Type |
|---------|-------|------|
| `CompanyName` | Deal Name | string (required) |
| `Description` | Description | textarea |
| `Website` | Website | url |
| `SourceTypeID` | Source Type | dropdown |
| `SourceNotes` | Source Notes | textarea |
| `PastInvestments` | Past Investments | textarea |
| `StageID` | Stage | dropdown |
| `SectorID` | Sector | dropdown |
