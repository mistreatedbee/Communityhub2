# Community Hub Task To-Do List

## Phase 1 Foundation
- [x] Supabase client integration
- [x] Auth context and protected routes
- [x] Core RBAC + organization schema migration
- [x] License limits enforcement trigger
- [x] Initial admin/super-admin pages connected to live DB

## Phase 2 Core Operations
- [x] Public application submission persisted to DB
- [x] Admin applications inbox with filtering
- [x] Application review actions (approve/reject/info-requested)
- [x] Program management module (create/list/archive/duplicate/delete)
- [x] Forms list module with live response counts
- [x] Dynamic form builder save to `forms.schema`
- [x] Form responses inbox with review/flag workflow
- [x] CSV export from responses

## Phase 2.1 Supervisor Workflow
- [x] Submission assignment model and policies (`submission_assignments`)
- [x] Supervisor review queue page
- [x] Assignment-based filtering (supervisor sees assigned only)
- [x] Admin assignment controls from form responses page

## Route/UI Wiring
- [x] Added `/dashboard/reviews` route for supervisor queue
- [x] Sidebar role-aware link for Review Queue
- [x] Sign out wired to auth context

## Remaining Backlog (Phase 3)
- [x] Content & collaboration schema (announcements, news, groups, discussions, sessions, direct messaging)
- [x] Public pages switched to live data (home, announcements/news/events/calendar + detail pages)
- [x] Admin content operations switched to live data (announcements/news/groups/sessions/discussions)
- [x] Member collaboration pages switched to live data (dashboard/groups/discussions/threads/messages/profile)
- [x] Super-admin plan/dashboard analytics switched to live data
- [ ] Email notification delivery pipeline (SMTP/provider)
- [ ] PDF report generation
- [ ] Audit log UI and compliance dashboards
- [ ] Automated tests for RBAC and critical workflows
- [ ] Production observability (error tracking + metrics)
