# Device-only uploads: changes and test checklist

Admins can no longer upload images or files via URL. All uploads must be from the device (file picker) only.

## 1. List of URL-based upload inputs found and changed

| Location | What existed | What was done |
|----------|--------------|----------------|
| **TenantAdminSettingsPage.tsx** | "Logo URL" text input; profile saved with `logoUrl` | Removed URL input. Added file picker ("Choose file" / "Replace"), image preview, Remove button. Logo is uploaded via `POST /api/upload/logo`; profile is saved with `logoFileId` (and backend clears `logoUrl`). Validation: image type and 5 MB max. |
| **TenantAdminHomeBuilderPage.tsx** | Theme "Logo URL (optional)"; Hero "Background image URL"; Hero "Hero logo URL" | Theme logo: file picker only; upload via logo API, store returned URL in `theme.logoUrl`. Hero background and hero logo: file pickers only; images stored as data URLs in home-settings. Gallery: already device-only; added `validateImageFile` for each file. |
| **SetupCommunityPage.tsx** | Logo URL text input alongside file upload | Removed Logo URL input. Submit uses only `logoFileId`; `logoUrl` sent as built URL from `logoFileId` when present. Added `validateImageFile` before upload. |
| **TenantAdminResourcesPage.tsx** | Type "file" \| "link"; "Link URL" input when link | Removed "Link" type and Link URL. Resources are file-only. Added `validateResourceFile` and `validateImageFile` (thumbnail). Create requires a selected file. |
| **TenantAdminResourceEditPage.tsx** | Type "link" \| "file"; "Link URL" and "Thumbnail image URL" | Removed Link/File radio and both URL inputs. For existing `link` resources: show read-only message (only title/description editable). For `file` resources: keep file replacement + optional thumbnail upload; added validation. |
| **TenantAdminEventsPage.tsx** | No URL input in UI; payload still sent `thumbnailUrl` | Removed `thumbnailUrl` state and from create payload. Thumbnail is file-only. Added `validateImageFile` before upload. |
| **TenantAdminEventEditPage.tsx** | No URL input in UI; save() sent `thumbnailUrl` | Removed `thumbnailUrl` from state and save payload. Thumbnail only via file. Existing `event.thumbnailUrl` still displayed for already-saved events. Added `validateImageFile` before upload. |
| **PlatformUsersPage.tsx** (super-admin) | "Logo URL (optional)" when promoting to new tenant | Replaced with file picker + preview. On promote: upload logo via logo API, then send `logoUrl` as built URL in request. Added `validateImageFile`. |

**Already device-only (validation added only):**

- **TenantAdminAnnouncementsPage.tsx**: Attachments were file picker only; added `validateResourceFile` for each attachment.

## 2. New / updated files

- **src/lib/uploadValidation.ts** (new): `validateImageFile`, `validateDocumentFile`, `validateResourceFile`; image 5 MB, document 10 MB defaults; allowed types as per plan.
- **src/lib/tenantUpload.ts**: Added `uploadLogo(file)` and `getLogoUrl(fileId)`.
- **server**: `tenants.controller.ts` – `updateTenant` accepts `logoFileId` and clears `logoUrl` when `logoFileId` is set; `getTenantById` returns `logoFileId`.

## 3. Manual test checklist

- [ ] **Community logo (Settings)**  
  Go to tenant admin → Settings. Use "Choose file" to upload a logo; see preview. Save. Refresh; logo still shows. Use "Replace" and "Remove" and save again.

- [ ] **Theme logo and hero (Home Builder)**  
  Go to Home Page Builder. Theme: upload theme logo via "Choose file". Hero: upload background image and hero logo via file pickers. Save. View member feed; hero and theme logo display. Confirm there is no text field for pasting URLs.

- [ ] **Setup Community**  
  Run through community setup (onboarding). Confirm only logo file upload is available (no Logo URL field). Create community with uploaded logo; logo appears after creation.

- [ ] **Announcements**  
  Create/edit announcement; add attachment(s) via file picker only. Confirm no URL input for attachments. Invalid file type/size shows error.

- [ ] **Events**  
  Create event with thumbnail via "Thumbnail image" file input only. Edit event; change thumbnail via file only. Existing events with `thumbnailUrl` still show thumbnail. No thumbnail URL field.

- [ ] **Resources**  
  Add resource: only "File" path; no "Link" option or Link URL. Upload a PDF/image; add optional thumbnail from file. Edit a file resource: replace file or thumbnail from device. Edit a link resource: only title/description editable; read-only note shown. No URL inputs.

- [ ] **Promote to tenant (super-admin)**  
  Promote user to new tenant. Use "Choose file" for logo (optional). Confirm no Logo URL text field. After promotion, tenant has logo if one was uploaded.

- [ ] **No URL upload anywhere**  
  Search admin UI for any remaining "URL", "link", or "paste" for images/files. Confirm no field allows pasting a URL to set an image or file.
