import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../data/printing-services-price-list.json');
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getAdminCredentials = () => {
  const email = process.env.PRINTHIVE_ADMIN_EMAIL || process.env.FIREBASE_ADMIN_EMAIL;
  const password = process.env.PRINTHIVE_ADMIN_PASSWORD || process.env.FIREBASE_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      [
        'Missing admin credentials.',
        'Set PRINTHIVE_ADMIN_EMAIL and PRINTHIVE_ADMIN_PASSWORD, then rerun:',
        'npm run seed:services',
      ].join('\n')
    );
  }

  return { email, password };
};

const getExistingCategoryIds = async () => {
  const snapshot = await getDocs(query(collection(db, 'categories')));
  const idsByName = new Map();

  snapshot.docs.forEach((categoryDoc) => {
    const data = categoryDoc.data();
    if (typeof data.name === 'string') {
      idsByName.set(data.name.toLowerCase(), categoryDoc.id);
    }
  });

  return idsByName;
};

const seed = async () => {
  const { email, password } = getAdminCredentials();
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);

  const existingCategoryIds = await getExistingCategoryIds();
  const batch = writeBatch(db);
  let categoryCount = 0;
  let serviceCount = 0;

  for (const category of seedData.categories) {
    const categoryId = existingCategoryIds.get(category.name.toLowerCase()) || slugify(category.name);
    const categoryRef = doc(db, 'categories', categoryId);

    batch.set(
      categoryRef,
      {
        name: category.name,
        type: category.type,
        source: 'printing-services-price-list',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    categoryCount += 1;

    for (const service of category.services) {
      const serviceId = `${categoryId}-${slugify(service.title)}`;
      const serviceRef = doc(db, 'services', serviceId);
      const description = `${category.name}. Starting price: ${service.priceLabel}.`;

      batch.set(
        serviceRef,
        {
          title: service.title,
          description,
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
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      serviceCount += 1;
    }
  }

  await batch.commit();
  await auth.signOut();

  console.log(`Seeded ${categoryCount} categories and ${serviceCount} services.`);
};

seed().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
