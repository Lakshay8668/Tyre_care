# What was fixed and added

This project was reviewed against the original Admin Panel spec and repaired/extended. Everything below was verified by running `npx tsc --noEmit` (0 errors) and exercising the real API endpoints.

## Critical fix: the app didn't run as delivered

`@types/react` and `@types/react-dom` were missing from `package.json`, which silently disabled all JSX prop type-checking. Once added, `tsc` surfaced 35 real errors: `App.tsx` was passing the wrong props to nearly every view component (Navbar, Sidebar, Dashboard, TyreMaster, Sales, Purchases, Customers, Suppliers), and the Employee/Supplier forms referenced fields that didn't exist on those types. All of this is now fixed and `App.tsx` correctly drives every view.

## 1. Roles & Permissions (real access control)

- New `Permission` type (18 granular permissions) with per-role defaults and per-user overrides (`src/types.ts`).
- Backend: `GET/POST/PUT /api/users`, `POST /api/users/:id/reset-login`.
- New **Admin → Users & Roles** screen (`UsersRolesView.tsx`): create logins, change role, toggle individual permissions, reset login, activate/deactivate.
- The sidebar now filters menu items by the logged-in user's actual resolved permissions.
- **Caveat:** login is still a stub (no password). This is a real permissions model + admin UI, not server-enforced authentication. Add real auth (sessions/JWT + bcrypt) before handling real money with multiple logins.

## 2. Brands / Models / Sizes / Categories as master data

- New `MasterListItem` / `TyreModel` types; brands, categories, and sizes are no longer plain strings but admin-managed records with `active` flags; models are linked to a brand.
- Backend CRUD: `/api/master/brands|categories|sizes|models` (GET/POST/PUT/DELETE), with delete guarded against records still referenced by a tyre (forces deactivation instead).
- New **Admin → Master Data** screen (`MasterDataView.tsx`) with tabs for each list.
- The Tyre Master "Add Tyre" form's Brand/Model/Size fields are now cascading dropdowns sourced from this master data instead of free-text inputs.

## 3. GST/Tax config + Excel import/export

- `BusinessSettings` extended with `gst_rates` (now actually editable), `default_gst_rate`, and `tax_calculation_method`.
- New GST/Tax Configuration section in Settings: add/remove GST slabs, set the default, choose exclusive/inclusive.
- The Tyre Master GST% dropdown now reads from `settings.gst_rates` instead of a hardcoded list.
- New **Admin → Data Management** screen (`DataManagementView.tsx`):
  - Export: Database (JSON backup), Inventory, Customers, Suppliers, Sales, Invoices, Purchases — all real `.xlsx` files (via SheetJS).
  - Import: Tyres, Customers, Suppliers from `.xlsx`, each with a downloadable template and a per-row success/skip/error report.
- Verified end-to-end: exported real `.xlsx` files, round-tripped a filled template back through import, confirmed duplicate rows are correctly skipped with a clear error message.

## Known remaining gaps (not in scope for this pass)

- No real password authentication / sessions (see caveat above).
- Business Settings' GST/Tax section doesn't yet compute CGST vs SGST vs IGST configuration per state pair beyond what invoicing already does at calculation time.
- No automated test suite — everything above was verified manually via `tsc` and live API calls during this session.
