# Epic 02: Subscription CRUD

## Context
- **Epic ID**: EPIC-02
- **Status**: In Progress
- **Priority**: Critical
- **Estimated Effort**: 1.5 Sprints
- **Dependencies**: Epic-01 (Foundation) - Complete
- **Target Sprints**: Sprint 01 (partial), Sprint 02

---

## Goal

Enable users to create, view, edit, and delete subscriptions with full data persistence and a polished UI experience.

---

## User Stories

### STORY-02.1: View Subscription List
**Status**: Complete

**Acceptance Criteria**:
- [x] List displays all subscriptions
- [x] Each item shows: name, amount, cycle, next payment, category color
- [x] Empty state with CTA to add first subscription
- [x] List is sorted by next payment date (default)

---

### STORY-02.2: Add New Subscription
**Status**: Complete

**Acceptance Criteria**:
- [x] "Add" button opens form dialog/sheet
- [x] Form fields: name*, amount*, currency, cycle*, category, color, notes
- [x] Validation with clear error messages
- [x] Next payment date picker
- [x] Success feedback on save (toast)
- [x] Form resets after successful save

---

### STORY-02.3: Edit Subscription
**Status**: Complete

**Acceptance Criteria**:
- [x] Edit button on subscription card/row
- [x] Form pre-populated with current values
- [x] Same validation as add form
- [x] Cancel returns to list without changes
- [x] Success feedback on update (toast)

---

### STORY-02.4: Delete Subscription
**Status**: Complete

**Acceptance Criteria**:
- [x] Delete action with confirmation dialog
- [x] Clear warning message
- [x] Success feedback on delete (toast)

---

## UI Components

| Component | Purpose | Status |
|-----------|---------|--------|
| SubscriptionForm | Form with validation | Complete |
| SubscriptionDialog | Sheet wrapper for add/edit | Complete |
| ConfirmDialog | Reusable confirmation modal | Complete |
| ColorPicker | Color swatch selector (inline in form) | Complete |

---

## Definition of Done

- [ ] All CRUD operations work end-to-end
- [ ] Data persists after app restart
- [ ] Form validation prevents bad data
- [ ] UI feedback for all actions (loading, success, error)
- [ ] Responsive on different window sizes
- [ ] Keyboard accessible (tab navigation, enter to submit)
