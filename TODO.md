# Saventa Uploader - TODO

> All tasks are tracked in [GitHub Issues](https://github.com/YuvInv/saventa-uploader/issues)

## Completed

- [x] **Duplicate Check** - Fixed using `_text=` and `_ss=` search parameters instead of broken `filter[]`
- [x] **Contacts/Founders Upload** - CSV can include founder columns, contacts created and linked to deals
- [x] **CSV Template Download** - Download button with field descriptions and optional contact fields
- [x] **Side Panel UI** - Modern side panel interface instead of popup

---

## Next Up

### 1. Remove 'View Schema' Option ([#7](https://github.com/YuvInv/saventa-uploader/issues/7)) - Priority: Quick Fix
Remove debug feature from production UI.

---

### 2. Simplified CSV Template ([#1](https://github.com/YuvInv/saventa-uploader/issues/1)) - Priority: High
The CSV template currently includes ALL CRM fields. Simplify to only commonly used fields:

**Fields to include:**
- `CompanyName` (Deal Name) - required
- `Description`
- `Website`
- `SourceTypeID` (Source Type)
- `SourceNotes`
- `PastInvestments`
- Contact: `Name`, `Email`, `Phone`, `Title`

**Implementation:**
- Add `TEMPLATE_FIELDS` constant in `src/lib/csv.ts`
- Toggle between "Simple" and "Full" template in UI

---

### 3. Dealigence Integration ([#2](https://github.com/YuvInv/saventa-uploader/issues/2)) - Priority: Medium
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

---

### 4. IVC Integration ([#3](https://github.com/YuvInv/saventa-uploader/issues/3)) - Priority: Medium
Import companies directly from IVC (Israel Venture Capital) database.

**Approach:**
- Content script for `https://www.ivc-online.com/*`
- "Send to Sevanta" button on company profiles
- Map IVC fields to Sevanta CRM fields

**Files to create:**
- `src/content/ivc.ts` - Content script
- `src/lib/extractors/ivc.ts` - Data extraction
- Update `manifest.json` - Add content script config

**Notes for Dealigence & IVC integrations:**
- User must be logged into target platform
- Need to analyze DOM structure of target pages
- Handle gracefully if page structure changes

---

### 5. GitHub CI/CD for Build & Publish ([#4](https://github.com/YuvInv/saventa-uploader/issues/4)) - Priority: Low
Set up GitHub Actions to automatically build and publish the extension.

---

### 6. Auto-Updates from News ([#5](https://github.com/YuvInv/saventa-uploader/issues/5)) - Priority: Low
Automatically crawl news sites (Ctech, Geektime) to:
- Update existing companies with new funding rounds
- Add new companies with AI-generated summaries
- Match screening meeting summary format

---

### 7. AI Features: Company Enrichment ([#6](https://github.com/YuvInv/saventa-uploader/issues/6)) - Priority: Low
Integrate with Perplexity (or similar) for:
- Auto-enrichment of company profiles (funding, founders, history)
- AI-driven CRM updates for outdated/missing data
- User-controlled review and acceptance of changes

---

### 8. Additional Enhancements - Priority: Low
- Progress bar during CSV upload
- Error handling improvements
- Changing extension icon to our VC logo



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
