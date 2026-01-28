# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saventa Uploader is a web tool for bulk uploading companies to Sevanta Dealflow CRM. It validates required fields, checks for duplicates, and provides an editable interface before upload.

**MVP Focus**: Semi-automatic bulk upload with validation. No research/enrichment engine yet.

## Architecture (MVP)

Single-page app with direct API calls to Sevanta Dealflow:

```
Next.js Frontend  →  Sevanta Dealflow API
     ↓
localStorage (API key, cached schema)
```

No backend needed for MVP. API calls made from browser or via Next.js API routes if CORS is an issue.

## Sevanta Dealflow API

Base URL: `https://run.mydealflow.com/inv/api`

Authentication header: `Authorization: API-Key API_KEY`

Key endpoints:
- `GET /schema/deals` - Get field schema (names, types, required, dropdown options)
- `GET /deal/list?filter&_x[]=fields` - Search deals (for duplicate detection)
- `POST /deal/add` - Create deal (CompanyName required)

Rate limit: 100 requests/minute. Handle 429 with exponential backoff.

## Core Features

1. **CRM Connection**: Validate API key, fetch and cache schema
2. **CSV/Text Input**: Parse company data, map columns to CRM fields
3. **Validation**: Required fields, dropdown values, data types
4. **Duplicate Detection**: Search existing deals by CompanyName/Website
5. **Review/Edit**: Editable table with validation feedback
6. **Upload**: Sequential upload with progress and error handling

## Tech Stack

- Next.js 14+ (App Router)
- React + TypeScript
- TailwindCSS for styling
- No database (localStorage for MVP)
