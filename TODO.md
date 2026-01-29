# Saventa Uploader - TODO

## Completed

- [x] **Duplicate Check** - Fixed using `_text=` and `_ss=` search parameters instead of broken `filter[]`
- [x] **Contacts/Founders Upload** - CSV can include founder columns, contacts created and linked to deals
- [x] **CSV Template Download** - Download button with field descriptions and optional contact fields
- [x] **Side Panel UI** - Modern side panel interface instead of popup

---

## Next Up

### 1. Simplified CSV Template (Priority: High)
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

### 2. Dealigence Integration (Priority: Medium)
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

### 3. IVC Integration (Priority: Medium)
Import companies directly from IVC (Israel Venture Capital) database.

**Approach:**
- Content script for `https://www.ivc-online.com/*`
- "Send to Sevanta" button on company profiles
- Map IVC fields to Sevanta CRM fields

**Files to create:**
- `src/content/ivc.ts` - Content script
- `src/lib/extractors/ivc.ts` - Data extraction
- Update `manifest.json` - Add content script config

**Notes for both integrations:**
- User must be logged into target platform
- Need to analyze DOM structure of target pages
- Handle gracefully if page structure changes

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
