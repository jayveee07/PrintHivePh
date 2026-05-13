# Security Specification for PrintHive PH

## 1. Data Invariants
- Admin-only areas (POS, Analytics, Inventory Management) must be strictly restricted to authenticated users whose UID exists in the `/admins` collection.
- Products, Categories, and Portfolio items are public for reading but admin-only for writing.
- Inquiries can be created by anyone but only read/deleted by admins.
- Users can read and update their own profiles.
- Transactions and Expenses are strictly admin-only.
- Orders can be created by customers (authenticated or not, as per flow, but let's assume authenticated for tracking), but managed by admins.

## 2. The "Dirty Dozen" Payloads

1. **Self-Promotion**: An authenticated user tries to update their own profile to `role: 'admin'`.
2. **Ghost Product**: An unauthenticated user tries to `create` a product.
3. **Price Manipulation**: An authenticated user tries to `update` a product price.
4. **ID Poisoning**: A user tries to create an inquiry with a 2KB string as the ID.
5. **PII Leak**: An unauthenticated user tries to `list` the `/users` collection.
6. **Orphaned Transaction**: Creating a transaction without a valid `createdAt` server timestamp.
7. **Cross-User Snooping**: User A tries to `get` User B's profile.
8. **Admin Bypass**: A user tries to `read` `/transactions` without being in the `/admins` collection.
9. **Inventory Wipe**: An unauthenticated user tries to `delete` a product.
10. **State Skipping**: Updating an order status from `pending` directly to `completed` without `processing` (if we want to be strict, but for now let's just check auth).
11. **Mass Inquiry Retrieval**: An unauthenticated user tries to `list` inquiries.
12. **Malicious Image Injection**: Updating a portfolio item `imageUrl` to a malicious script (validated as string size).

## 3. Test Runner (Draft)

```typescript
// firestore.rules.test.ts
// Mock tests logic
// describe('PrintHive PH Security Rules', () => {
//   test('Non-admin cannot create product', () => { ... });
//   test('Anyone can create inquiry', () => { ... });
//   test('Only admin can see transactions', () => { ... });
// });
```
