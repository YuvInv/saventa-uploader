# Saventa Uploader - TODO

> All tasks are tracked in [GitHub Issues](https://github.com/YuvInv/saventa-uploader/issues)

## Completed

- [x] **Duplicate Check** - Fixed using `_text=` and `_ss=` search parameters instead of broken `filter[]`
- [x] **Contacts/Founders Upload** - CSV can include founder columns, contacts created and linked to deals
- [x] **CSV Template Download** - Download button with field descriptions and optional contact fields
- [x] **Side Panel UI** - Modern side panel interface instead of popup
- [x] **Remove 'View Schema' Option** ([#7](https://github.com/YuvInv/saventa-uploader/issues/7)) - Removed debug feature from UI
- [x] **Simplified CSV Template** ([#1](https://github.com/YuvInv/saventa-uploader/issues/1)) - Template with commonly used fields only

---

## Next Up

### 1. Fix Contacts Upload ([#10](https://github.com/YuvInv/saventa-uploader/issues/10)) - Priority: High (Bug)
Contacts upload is currently failing. Need to investigate schema and API documentation.

**To investigate:**
- Study the contact schema API response carefully
- Review contact API documentation
- Test contact creation with minimal required fields
- Check if CompanyID linking is working correctly

---

### 2. Set Automatic Default Fields ([#8](https://github.com/YuvInv/saventa-uploader/issues/8)) - Priority: High
Automatically set default fields when uploading companies:

- **Source Notes**: "Uploaded from CSV using Saventa Uploader" (or Dealigence/IVC variant)
- **DealTypes**: Always set to "INV" (map to correct DealTypeID using .schema_examples/ folder)
- **SourceType**: Always set to "Research" (map to correct SourceTypeID)

---

### 3. Add Discard Row Option for Duplicates ([#9](https://github.com/YuvInv/saventa-uploader/issues/9)) - Priority: Medium
When uploading CSV with companies that already exist:

- Allow users to "discard" individual rows
- Do NOT allow editing of existing companies through the extension
- Clear UI indication of which rows will be skipped

---

### 4. Dealigence Integration ([#2](https://github.com/YuvInv/saventa-uploader/issues/2)) - Priority: Medium
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

### 5. IVC Integration ([#3](https://github.com/YuvInv/saventa-uploader/issues/3)) - Priority: Medium
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

### 6. GitHub CI/CD for Build & Publish ([#4](https://github.com/YuvInv/saventa-uploader/issues/4)) - Priority: Low
Set up GitHub Actions to automatically build and publish the extension.

---

### 7. Additional Enhancements - Priority: Low
- Progress bar during CSV upload
- Error handling improvements
- Changing extension icon to VC logo

---

## AI Features (Future)

### 8. Auto-Updates from News ([#5](https://github.com/YuvInv/saventa-uploader/issues/5)) - Priority: Low
Automatically crawl news sites (Ctech, Geektime) to:
- Update existing companies with new funding rounds
- Add new companies with AI-generated summaries
- Match screening meeting summary format

---

### 9. AI Features: Company Enrichment ([#6](https://github.com/YuvInv/saventa-uploader/issues/6)) - Priority: Low
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
