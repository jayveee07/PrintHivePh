# TODO

- [ ] Inspect admin products route wiring to confirm correct component is rendered.
- [ ] Fix `src/admin/Products.tsx` so it still renders when Firestore products are missing fields (e.g., `createdAt`, `imageUrl`, `description`, `price`, `stock`, `category`, `barcode`).
- [ ] Add safe fallback/dummy data when Firestore query fails so UI still shows items for debugging.
- [ ] Remove/adjust problematic Firestore `orderBy('createdAt','desc')` if `createdAt` is missing.
- [ ] Ensure numeric casting for `price` and `stock` and safe string coercion for `description`, `imageUrl`, `category`.
- [ ] Add UI error/toast when fetch fails to make the issue visible.
- [ ] Test in dev: verify /admin/products displays items.

