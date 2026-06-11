import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../data/printing-services-price-list.json');
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const FIREBASE_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getConfigstorePath = () =>
  path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');

const getRefreshToken = () => {
  const configstorePath = getConfigstorePath();
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

  for (const category of seedData.categories) {
    const categoryId = slugify(category.name);
    writes.push({
      update: {
        name: `${basePath}/categories/${categoryId}`,
        fields: firestoreFields({
          name: category.name,
          type: category.type,
          source: 'printing-services-price-list',
          updatedAt: now,
        }),
      },
    });

    for (const service of category.services) {
      const serviceId = `${categoryId}-${slugify(service.title)}`;
      writes.push({
        update: {
          name: `${basePath}/services/${serviceId}`,
          fields: firestoreFields({
            title: service.title,
            description: `${category.name}. Starting price: ${service.priceLabel}.`,
            price: service.price,
            minPrice: service.minPrice,
            maxPrice: service.maxPrice,
            priceLabel: service.priceLabel,
            unit: service.unit || null,
            category: category.name,
            categoryId,
            iconName: category.iconName,
            active: true,
            source: 'printing-services-price-list',
            updatedAt: now,
          }),
        },
      });
    }
  }

  return writes;
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
  const writes = buildWrites();

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

  console.log(`Seeded ${seedData.categories.length} categories and ${writes.length - seedData.categories.length} services.`);
};

seed().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
