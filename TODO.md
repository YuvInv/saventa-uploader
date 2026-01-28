# Saventa Uploader - Status & TODO

## Current Status (2026-01-28)

### Working Features
- Schema parsing from API (fixed stale cache issue)
- Column mapping from CSV to CRM fields
- **UPLOADING WORKS** - Successfully creates deals in Sevanta CRM
  - Uses form-urlencoded format (not JSON)
  - Sends data with field dbnames (CompanyName, URL, etc.)

### Fixed Issues
1. **Schema cache** - Added "Clear Cache & Refresh" button + auto-clear on startup
2. **API response parsing** - Fixed to read `response.data` (not `response.deals`)
3. **Create deal** - Changed from JSON to `application/x-www-form-urlencoded`

---

## TODO

### 1. Duplicate Check Enhancement (High Priority)
**Problem:** The API filter doesn't work as expected. When searching for a specific company:
- Request: `filter[CompanyName]=DELETETEST_FakeCompany_001`
- Response: Returns ALL 8227 deals (paginated to 100)

**Current Workaround:** Client-side filtering of results for exact match

**Potential Solutions:**
- Investigate correct API filter syntax (maybe `filter[CompanyName][eq]=` or `filter[CompanyName][like]=`)
- Check if there's a search endpoint that works better
- Consider using a different API parameter for exact matching
- If API doesn't support filtering, implement smarter pagination to search through results

**File:** `src/lib/api.ts` - `checkDuplicate()` and `searchDeals()` functions

### 2. Add Contacts/Founders Upload (Medium Priority)
**Feature:** Allow uploading contacts (company founders) alongside deals from the same CSV

**API Endpoint:** `POST /contact/add`
- Required field: `Name`
- Link to deal: Include `CompanyID` (the deal's ID) and optionally `ContactTypeID` (e.g., "MGT" for management, "SRC" for source)

**Implementation:**
- Add contact columns to CSV (e.g., `FounderName`, `FounderEmail`, `FounderLinkedIn`)
- After creating deal, use returned `CompanyID` to create linked contact
- Schema endpoint: `GET /schema/contacts` for contact field definitions

**Files to modify:**
- `src/lib/types.ts` - Add Contact types
- `src/lib/api.ts` - Add `createContact()` function
- `src/popup/components/ColumnMapper.tsx` - Support contact field mapping

### 3. CSV Template Download (Medium Priority)
**Feature:** Add button to download a CSV template with all available CRM fields

**Implementation:**
- Add "Download CSV Template" button in `CsvUpload.tsx` component
- Generate CSV with headers from schema fields (use `field.name` or `field.label`)
- Include a sample row with field descriptions or example values
- Use browser download API (create blob, trigger download)

**Files to modify:**
- `src/popup/components/CsvUpload.tsx` - Add download button
- Could create helper in `src/lib/csv.ts` - `generateTemplate(schema)`

**Example output:**
```csv
CompanyName,URL,DescriptionShort,StageID,VerticalID,...
"Company Name (required)","https://example.com","Short description","0=Screening, 1=Scheduling, 9=Portfolio",...
```

---

## API Notes

### Endpoints
- `GET /schema/deals` - Returns field definitions (object keyed by field name)
- `GET /deal/list?filter[Field]=value&_x[]=Field` - List/search deals
- `POST /deal/add` - Create deal (form-urlencoded, not JSON)

### Field Naming
- Schema returns `dbname` (e.g., "CompanyName") and `label` (e.g., "Deal Name")
- List endpoint returns data with LABELS as keys (e.g., `"Deal Name": "Acme"`)
- Create endpoint accepts DBNAMES (e.g., `CompanyName=Acme`)

### Response Format
```javascript
// Schema
{ status: "ok", data: { CompanyName: { dbname, label, type, optionlist }, ... } }

// List
{ status: "ok", data: [...], count_returned: 100, count_total: 8227 }

// Create (success)
{ status: "ok", CompanyID: 123 }

// Create (error)
{ error: "Error: Deal Name cannot be blank." }
```
