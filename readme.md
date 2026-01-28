# Saventa Uploader - Product Requirements Document

## Executive Summary

Saventa Uploader is a web tool for bulk uploading companies to Sevanta Dealflow CRM. It validates data, checks for duplicates, and ensures all required fields are populated before upload. The tool eliminates the tedious manual entry of companies one-by-one through the CRM interface.

---

## Problem Statement

Uploading companies to Sevanta Dealflow CRM is slow and error-prone:
- Manual entry through the web interface is tedious for bulk imports
- No built-in duplicate checking before creating records
- Easy to miss required fields, causing failed submissions
- No validation of dropdown field values before upload

---

## Target Users

### Primary: VC Associates & Analysts
- Need to log multiple companies quickly (from events, lists, referrals)
- Want to avoid duplicate entries in the CRM
- Need clear feedback on what data is missing

---

## Core User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. CONNECT CRM                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Enter your Sevanta Dealflow API Key: [________________]    │    │
│  │                                        [Connect]            │    │
│  │  ✓ Connected to: YourFund Dealflow                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              ▼                                       │
├─────────────────────────────────────────────────────────────────────┤
│  2. INPUT COMPANIES                                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Paste company data or upload CSV                            │    │
│  │  ─────────────────────────────────────────────────────────   │    │
│  │  CompanyName, Website, Sector, Stage, Source                 │    │
│  │  Monday.com, monday.com, SaaS, Growth, Conference            │    │
│  │  Notion, notion.so, SaaS, Growth, Referral                   │    │
│  │  ...                                                         │    │
│  │                                                              │    │
│  │  [Upload CSV]  [Parse Input]                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              ▼                                       │
├─────────────────────────────────────────────────────────────────────┤
│  3. VALIDATE & CHECK DUPLICATES                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Validation Results:                                         │    │
│  │  ─────────────────────────────────────────────────────────   │    │
│  │  ✓ Monday.com ............ Valid, ready to upload           │    │
│  │  ⚠ Notion ................ DUPLICATE: exists in CRM (ID:42) │    │
│  │  ✗ Acme Corp ............. Missing required: Sector         │    │
│  │  ⚠ FooBar Inc ............ Invalid Sector value "Tech"      │    │
│  │                                                              │    │
│  │  Summary: 1 valid, 2 warnings, 1 error                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              ▼                                       │
├─────────────────────────────────────────────────────────────────────┤
│  4. REVIEW & FIX                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Company: Acme Corp                              [✗] Error   │    │
│  │  ─────────────────────────────────────────────────────────   │    │
│  │  CompanyName: [Acme Corp        ]                            │    │
│  │  Website:     [acme.com         ]                            │    │
│  │  Sector:      [Select... ▼      ]  ← Required, missing       │    │
│  │  Stage:       [Seed ▼           ]                            │    │
│  │  Source:      [Cold Outreach ▼  ]                            │    │
│  │  Description: [Enterprise software for...]                   │    │
│  │                                                              │    │
│  │  [Save Changes]                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              ▼                                       │
├─────────────────────────────────────────────────────────────────────┤
│  5. UPLOAD TO CRM                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Ready to upload: 3 companies                                │    │
│  │  Skipping: 1 duplicate                                       │    │
│  │                                                              │    │
│  │  [Upload All Valid]  [Upload Selected]                       │    │
│  │                                                              │    │
│  │  ✓ Monday.com .............. Uploaded (ID: 156)             │    │
│  │  ✓ Acme Corp ............... Uploaded (ID: 157)             │    │
│  │  ◉ FooBar Inc .............. Uploading...                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Feature Specifications

### F1: CRM Connection

**F1.1: API Key Setup**
- User enters their Sevanta Dealflow API key
- System validates the key by calling the API
- Store key in browser localStorage (MVP) or secure backend (later)
- Show connection status and connected account info

**F1.2: Schema Fetching**
- On connection, fetch `/inv/api/schema/deals` to get:
  - All available fields
  - Required fields
  - Dropdown field options (optionlist)
  - Field data types
- Cache schema locally for validation

---

### F2: Company Input

**F2.1: CSV Upload**
- Accept CSV file with company data
- First row treated as headers
- Map CSV columns to CRM fields (auto-match by name, allow manual mapping)
- Preview parsed data before processing

**F2.2: Text/Paste Input**
- Paste tab-separated or comma-separated data
- Support simple "one company name per line" mode
- Parse and display in editable table

**F2.3: Field Mapping UI**
- Show which CSV columns map to which CRM fields
- Highlight unmapped columns
- Allow manual column-to-field mapping

---

### F3: Validation Engine

**F3.1: Required Field Validation**
- Check all required fields are populated
- CompanyName is always required
- Additional required fields from schema

**F3.2: Value Validation**
- For dropdown fields, validate value is in allowed optionlist
- Suggest closest match for typos
- Flag invalid values with specific error

**F3.3: Data Type Validation**
- Dates in correct format
- Numbers where expected
- URLs properly formatted

---

### F4: Duplicate Detection

**F4.1: Pre-Upload Check**
- Before upload, search CRM for existing companies
- Match by: CompanyName (fuzzy), Website (exact)
- Use `/inv/api/deal/list?filter` endpoint

**F4.2: Duplicate Display**
- Show potential duplicates with confidence score
- Display existing record details for comparison
- Options: Skip, Upload Anyway, View in CRM

**F4.3: Matching Strategy**
- Exact match on website domain (strip www, https)
- Fuzzy match on company name (Levenshtein distance)
- Configurable sensitivity

---

### F5: Review & Edit Interface

**F5.1: Company Table View**
- Display all companies in editable table
- Color coding: green (valid), yellow (warning), red (error)
- Sortable by status, name, etc.

**F5.2: Individual Company Editor**
- Click to expand/edit individual company
- Show all fields with appropriate input types
- Dropdowns populated from CRM schema
- Real-time validation feedback

**F5.3: Bulk Actions**
- Select multiple companies
- Bulk set field values (e.g., set Source for all)
- Bulk delete from batch

---

### F6: Upload Engine

**F6.1: Upload Execution**
- Upload companies via `/inv/api/deal/add`
- Sequential uploads with rate limiting (100/min max)
- Show real-time progress

**F6.2: Error Handling**
- Catch and display API errors
- Retry transient failures (429, 5xx)
- Don't retry permanent failures (400, 401)

**F6.3: Results Summary**
- Show success/failure count
- List failed uploads with error details
- Provide links to created records in CRM

---

## Technical Architecture (MVP)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Single Page App)                      │
│                         Next.js + React + TailwindCSS               │
│                                                                      │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │   API Key    │  │   Company    │  │    Upload    │             │
│   │   Setup      │  │   Editor     │  │    Manager   │             │
│   └──────────────┘  └──────────────┘  └──────────────┘             │
│                              │                                       │
│                      ┌───────┴───────┐                              │
│                      │  CRM Service  │ (API calls to Sevanta)       │
│                      └───────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SEVANTA DEALFLOW API                              │
│                 https://run.mydealflow.com/inv/api                   │
└─────────────────────────────────────────────────────────────────────┘
```

**MVP Simplification**:
- No backend server needed initially
- All API calls from browser (CORS permitting) or via serverless functions
- API key stored in localStorage
- No user accounts, no database

---

## CRM Field Mapping

Fields fetched dynamically from `/inv/api/schema/deals`. Common fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| CompanyName | text | Yes | Primary identifier |
| Website | url | No | Used for duplicate detection |
| Description | textarea | No | Company description |
| Sector | dropdown | Varies | Values from optionlist |
| Stage | dropdown | Varies | Values from optionlist |
| Source | dropdown | Varies | How deal was sourced |
| Location | text | No | HQ location |

Exact fields depend on user's CRM configuration.

---

## MVP Scope

### Included in MVP
- [x] API key connection and validation
- [x] Schema fetching and caching
- [x] CSV file upload and parsing
- [x] Text/paste input
- [x] Column-to-field mapping
- [x] Required field validation
- [x] Dropdown value validation
- [x] Duplicate detection (by CompanyName and Website)
- [x] Editable company table
- [x] Individual company editor
- [x] Upload with progress display
- [x] Basic error handling and retry
- [x] Results summary with CRM links

### Excluded from MVP (Future Phases)
- User accounts and authentication
- Persistent storage / upload history
- Contact creation (founders)
- Research engine / data enrichment
- Multiple CRM support
- Team collaboration
- Mobile optimization

---

## Future Phases

### Phase 2: Research Engine
- Auto-fetch company info from website
- Founder discovery and background enrichment
- Funding data from Crunchbase
- AI-powered classification

### Phase 3: Enhanced Features
- Contact creation alongside deals
- Upload history and re-processing
- Chrome extension
- Multiple CRM integrations

---

## API Reference (Sevanta Dealflow)

### Authentication
```
Authorization: API-Key YOUR_API_KEY
```

### Endpoints Used

**Get Schema**
```
GET /inv/api/schema/deals
Response: { data: [{ dbname, label, type, optionlist?, required? }] }
```

**Search Deals (Duplicate Check)**
```
GET /inv/api/deal/list?CompanyName=Acme&_x[]=CompanyName&_x[]=Website
Response: { data: [{ ID, CompanyName, Website, ... }] }
```

**Create Deal**
```
POST /inv/api/deal/add
Body: { CompanyName: "Acme", Website: "acme.com", ... }
Response: { data: { ID, CompanyName, ... } }
```

### Rate Limits
- 100 requests per minute
- Handle 429 with exponential backoff
- Batch duplicate checks efficiently

---

*Document Version: 2.0*
*Last Updated: January 2025*
