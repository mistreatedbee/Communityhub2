# Community Hub: Programs, Modules, Resources, Groups & Profile – What Was Fixed

This document summarizes the changes made so that Programs, Modules, Resources, Groups, and Community Profile are fully editable, clickable, assignable, and provide clear feedback (notifications) to the admin/tenant.

---

## 1. Backend

### Programs
- **Model** (`server/src/models/TenantFeatureModels.ts`): Added `status` to Program schema (`DRAFT` | `ACTIVE`).
- **Program–group assignment**: Added unique index on `(tenantId, programId, groupId)` so the same program cannot be assigned to the same group twice.
- **New endpoints** (tenant features):
  - `GET /programs/:programId` – single program with modules and assigned groups.
  - `PUT /programs/:programId` – update title, description, status.
  - `DELETE /programs/assign` – unassign program from group (body: `programId`, `groupId`).
- **Controller**: `getProgram`, `updateProgram`, `unassignProgram`; `assignProgram` now uses `findOneAndUpdate` (upsert) so assign is idempotent.

### Modules
- **New endpoints**:
  - `GET /programs/:programId/modules/:moduleId` – single module with its resources.
  - `PUT /programs/:programId/modules/:moduleId` – update title, description, order.
  - `DELETE /programs/:programId/modules/:moduleId` – delete module and clear resource links.
  - `POST /programs/:programId/modules/:moduleId/resources` – add resource to module (body: `resourceId`).
  - `DELETE /programs/:programId/modules/:moduleId/resources/:resourceId` – remove resource from module.
- **Controller**: `getModule`, `updateModule`, `deleteModule`, `addResourceToModule`, `removeResourceFromModule`.

### Resources
- **Model**: Added optional `moduleId` and `programId` to Resource schema (link to module/program).
- **New endpoints**:
  - `GET /resources/:resourceId` – single resource.
  - `PUT /resources/:resourceId` – update title, description, url, type, moduleId, programId.
- **Controller**: `getResource`, `updateResource`; `createResource` accepts `moduleId` and `programId`.

### Groups
- **New endpoints**:
  - `GET /groups/:groupId` – single group with assigned programs.
  - `PUT /groups/:groupId` – update name, description, isPrivate.
  - `GET /groups/:groupId/programs` – list programs assigned to the group (kept for consistency; group detail already returns programs).
- **Controller**: `getGroup`, `updateGroup`, `listGroupPrograms`.

### Community Profile (Tenant)
- **New endpoint** (`server/src/routes/tenants.routes.ts`): `PUT /api/tenants/:tenantId` – update tenant name, description, logoUrl, category, location (admin/owner only).
- **Controller** (`tenants.controller.ts`): `updateTenant` – validates membership and role, updates allowed fields only (slug not changeable).

---

## 2. Frontend

### Programs
- **List** (`TenantAdminProgramsPage.tsx`): Program cards are **clickable** (link to program detail). **Toasts**: “Program created successfully.” (and navigate to detail), “Module created successfully.”, “Program assigned to group.”; errors shown on failure.
- **New page** `TenantAdminProgramDetailPage.tsx`: View/edit program (name, description, status); assign/unassign groups; list modules (links to module detail); add module. All saves and assign/unassign show success or error toasts.

### Modules
- **New page** `TenantAdminModuleDetailPage.tsx`: Edit module name/description; list resources in module (links to resource edit); add resource to module; remove resource from module. Toasts for save, add resource, remove resource.

### Resources
- **List** (`TenantAdminResourcesPage.tsx`): Each resource is **clickable** (link to resource edit page). **Toasts**: “Resource created successfully.”, “Resource deleted.”; errors on failure.
- **New page** `TenantAdminResourceEditPage.tsx`: Edit title, description, URL, type. Toast: “Resource updated successfully.”

### Groups
- **List** (`TenantAdminGroupsPage.tsx`): Group cards are **clickable** (link to group detail). **Toast**: “Group created successfully.”; error on load/create failure.
- **New page** `TenantAdminGroupDetailPage.tsx`: Edit group name/description; list assigned programs (links to program detail); assign program. Toasts for save and assign.

### Community Profile
- **Settings** (`TenantAdminSettingsPage.tsx`): Expanded into two sections:
  1. **Community profile**: name, description, logo URL, category, location. Loaded via `GET /api/tenants/id/:tenantId`; saved via `PUT /api/tenants/:tenantId`. **Toast**: “Community profile updated successfully.”; then `refresh()` on TenantContext so header/public page reflect changes.
  2. **Registration settings**: existing toggles (public signup, approval required, custom registration fields). **Toast**: “Registration settings saved successfully.”

### Routing (`App.tsx`)
- New admin routes: `programs/:programId`, `programs/:programId/modules/:moduleId`, `resources/:resourceId`, `groups/:groupId`.

### API client
- **tenantFeatures** (`src/lib/tenantFeatures.ts`): `tenantFeaturesDelete` now accepts optional `{ body }` for `DELETE /programs/assign` with `programId` and `groupId`.

---

## 3. Notifications (Toasts)

- Every create/update/delete and assign/unassign action on the above pages shows a **success** toast on success and an **error** toast (with message) on API failure.
- No silent failures: all `catch` blocks use `addToast(..., 'error')`.

---

## 4. What Was Missing Before (Summary)

- **Programs**: No detail page, no edit, no status, list items not clickable, no toasts, duplicate program–group assignments possible, no unassign.
- **Modules**: No get/update/delete, no link from program to module detail, no add/remove resource to module, no toasts.
- **Resources**: No get/update, no module/program link in schema, list items not clickable, no edit page, no toasts.
- **Groups**: No get/update, no detail page, list items not clickable, no program assignment from group view, no toasts.
- **Community Profile**: No API to update tenant (name, description, logo); Settings had only registration toggles and no success toast.

All of the above are now implemented and wired end-to-end with tenant-scoped APIs and admin-only permissions.
