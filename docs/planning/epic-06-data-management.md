# Epic 06: Data Management

## Context

- **Epic ID**: EPIC-06
- **Status**: Complete
- **Priority**: High
- **Estimated Effort**: 0.5 Sprint
- **Dependencies**: Epic-02 (Subscription CRUD) - Complete
- **Completed**: January 12, 2026

---

## Goal

Enable users to export and import their subscription data for backup and restore purposes.

---

## User Stories

### STORY-06.1: Data Export

**Status**: Complete

**As a** user  
**I want** to export my subscriptions to a JSON file  
**So that** I can back up my data

**Acceptance Criteria**:

- [x] Export button in Settings page
- [x] Exports subscriptions, categories, payments, settings
- [x] Downloads as `subby-backup-{date}.json`
- [x] Includes version for future compatibility

---

### STORY-06.2: Data Import

**Status**: Complete

**As a** user  
**I want** to import subscriptions from a backup file  
**So that** I can restore my data

**Acceptance Criteria**:

- [x] Import button in Settings page
- [x] File picker for JSON files
- [x] Validates JSON structure before import
- [x] Confirmation dialog before overwriting
- [x] Shows success/error toast

---

## Technical Implementation

### Backup Schema

```typescript
interface BackupData {
  version: string
  exportedAt: string
  subscriptions: Subscription[]
  categories: Category[]
  payments: Payment[]
  settings: Omit<Settings, 'id'>
}
```

### Files Created

| File                                          | Purpose                 |
| --------------------------------------------- | ----------------------- |
| `src/lib/data-management.ts`                  | Export/import utilities |
| `src/components/settings/data-management.tsx` | UI component            |

---

## Definition of Done

- [x] Export downloads valid JSON backup
- [x] Import restores all data correctly
- [x] Validation prevents corrupt imports
- [x] TypeScript compiles without errors
