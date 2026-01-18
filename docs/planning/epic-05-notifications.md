# Epic 05: Notifications

## Context

- **Epic ID**: EPIC-05
- **Status**: Partial Complete (UI + utilities done, backend pending)
- **Priority**: High
- **Estimated Effort**: 1 Sprint (shared with Epic-04)
- **Dependencies**: Epic-02 (Subscription CRUD) - Complete
- **Started**: January 12, 2026

---

## Goal

Implement a notification system that reminds users of upcoming subscription payments via email (Resend) and/or native desktop notifications.

---

## User Stories

### STORY-05.1: Notification Settings UI

**Status**: Complete

**Acceptance Criteria**:

- [x] Toggle switch for notifications on/off
- [x] Multi-select for reminder days (1, 3, 7, 14, 30 days before)
- [x] Email notification option with email input
- [x] Desktop notification toggle
- [x] Integration with Settings page

---

### STORY-05.2: Email Notifications (Resend)

**Status**: Partial (utilities ready, backend needed)

**Acceptance Criteria**:

- [x] Email template with glass-morphic design
- [x] Notification payload builder
- [x] Upcoming payments filter by notification days
- [ ] Backend API endpoint for sending (requires serverless function)
- [ ] Actual Resend integration (blocked on backend)

---

### STORY-05.3: Native Desktop Notifications

**Status**: Pending (deferred)

**Acceptance Criteria**:

- [ ] Tauri notification API integration
- [ ] Permission request flow
- [ ] Notification with subscription details
- [ ] Click to open app/calendar

---

## Technical Implementation

### Settings Schema Update

Added to `src/types/settings.ts`:

```typescript
email: z.string().email().nullable().optional(),
notification_email_enabled: z.boolean().optional(),
notification_desktop_enabled: z.boolean().optional(),
```

### Database Migration

```sql
ALTER TABLE settings ADD COLUMN email TEXT;
ALTER TABLE settings ADD COLUMN notification_email_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN notification_desktop_enabled INTEGER NOT NULL DEFAULT 1;
```

### Components Created

| Component              | File                                                | Purpose                          |
| ---------------------- | --------------------------------------------------- | -------------------------------- |
| `NotificationSettings` | `src/components/settings/notification-settings.tsx` | Full notification preferences UI |

### Utilities Created

| File                       | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `src/lib/notifications.ts` | Email template, payload builder, filter utilities |

### Backend Requirements (Future)

Since Subby is a local-first app, email notifications require a backend service:

- Serverless function (Vercel/Cloudflare) with Resend API key
- Endpoint: `POST /api/notifications/send`
- Accepts: email, subscriptions array
- Returns: success/failure

---

## Definition of Done

- [x] Notification settings UI is functional
- [x] Settings persist to database
- [x] Email template ready
- [x] TypeScript compiles without errors
- [ ] Email notifications actually send (needs backend)
- [ ] Desktop notifications work via Tauri (deferred)
