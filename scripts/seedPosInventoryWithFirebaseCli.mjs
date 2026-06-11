import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../data/pos-ready-inventory.json');
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const FIREBASE_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

const categoryTypes = {
  Paper: 'office',
  'Writing Supplies': 'office',
  'Office Supplies': 'office',
  'School Supplies': 'school',
  Printers: 'office',
  'Printing Supplies': 'printing',
  Packaging: 'merchandise',
  Accessories: 'office',
  'Art Materials': 'school',
  'Cleaning Supplies': 'office',
  'Binding Supplies': 'printing',
  'Laminating Supplies': 'printing',
  'Merchandise Blanks': 'merchandise',
  'Sticker Supplies': 'printing',
  Electronics: 'office',
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getRefreshToken = () => {
  const configstorePath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(configstorePath, 'utf8'));
  const token = config.tokens?.refresh_token;

  if (!token) {
    throw new Error('Firebase CLI is logged in, but no refresh token was found.');
  }

  return token;
};

const getAccessToken = async () => {
  const body = new URLSearchParams({
    client_id: FIREBASE_CLIENT_ID,
    client_secret: FIREBASE_CLIENT_SECRET,
    refresh_token: getRefreshToken(),
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://www.googleapis.com/oauth2/v3/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Firebase CLI access token: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
};

const firestoreValue = (value) => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  return { stringValue: String(value) };
};

const firestoreFields = (object) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [key, firestoreValue(value)]));

const buildWrites = () => {
  const projectId = firebaseConfig.projectId;
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  const basePath = `projects/${projectId}/databases/${databaseId}/documents`;
  const now = new Date().toISOString();
  const writes = [];

  const categories = [...new Set(seedData.products.map(product => product.category))];
  for (const category of categories) {
    writes.push({
      update: {
        name: `${basePath}/categories/${slugify(category)}`,
        fields: firestoreFields({
          name: category,
          type: categoryTypes[category] || 'merchandise',
          source: 'pos-ready-inventory',
          updatedAt: now,
        }),
      },
    });
  }

  for (const product of seedData.products) {
    const productId = product.barcode;
    writes.push({
      update: {
        name: `${basePath}/products/${productId}`,
        fields: firestoreFields({
          name: product.name,
          brand: product.brand,
          unit: product.unit,
          description: `${product.brand} ${product.name} (${product.unit})`,
          price: product.price,
          wholesalePrice: product.wholesalePrice,
          category: product.category,
          stock: 10,
          imageUrl: '',
          barcode: product.barcode,
          source: 'pos-ready-inventory',
          updatedAt: now,
        }),
      },
    });
  }

  return { writes, categoryCount: categories.length, productCount: seedData.products.length };
};

const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const seed = async () => {
  const accessToken = await getAccessToken();
  const projectId = firebaseConfig.projectId;
  const databaseId = encodeURIComponent(firebaseConfig.firestoreDatabaseId || '(default)');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:commit`;
  const { writes, categoryCount, productCount } = buildWrites();

  for (const writesChunk of chunk(writes, 400)) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ writes: writesChunk }),
    });

    if (!response.ok) {
      throw new Error(`Firestore commit failed: ${response.status} ${await response.text()}`);
    }
  }

  console.log(`Seeded ${categoryCount} product categories and ${productCount} products.`);
};

seed().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
