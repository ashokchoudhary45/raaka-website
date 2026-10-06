import fs from 'node:fs';
import path from 'node:path';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve('.env.local'));
loadEnvFile(path.resolve('.env'));

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY || !BUCKET || !PUBLIC_URL) {
  console.error('Missing R2 environment variables. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL');
  process.exit(1);
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

function metaKey(imageKey) {
  return `fan-art-meta/${imageKey.replace(/^fan-art\//, '')}.json`;
}

async function listKeys(prefix) {
  const keys = [];
  let token;
  do {
    const result = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
    }));
    for (const item of result.Contents ?? []) if (item.Key) keys.push(item.Key);
    token = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function readJson(key) {
  const result = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  if (!result.Body) return null;
  return JSON.parse(await result.Body.transformToString());
}

async function writeJson(key, value) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(value, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-store',
  }));
}

const imageKeys = (await listKeys('fan-art/')).filter(k => !k.endsWith('/'));
const metadataKeys = new Set(await listKeys('fan-art-meta/'));

console.log(`Found ${imageKeys.length} existing fan-art image(s) in R2.`);
console.log('Moving all existing artwork to PENDING for re-approval...');

let reset = 0;
let created = 0;

for (const imageKey of imageKeys) {
  const key = metaKey(imageKey);
  let meta = metadataKeys.has(key) ? await readJson(key) : null;

  if (!meta) {
    meta = {
      id: Date.now() + reset,
      r2Key: imageKey,
      imageUrl: `${PUBLIC_URL.replace(/\/$/, '')}/${imageKey}`,
      fanName: 'Unknown fan',
      title: 'RAAKA Fan Art',
      socialLink: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    created++;
  } else {
    meta.status = 'pending';
  }

  await writeJson(key, meta);
  reset++;
  console.log(`PENDING: ${imageKey}`);
}

console.log('');
console.log('DONE');
console.log(`Total images: ${imageKeys.length}`);
console.log(`Reset to pending: ${reset}`);
console.log(`Metadata created: ${created}`);
console.log('');
console.log('New uploads are NOT affected. They will continue to enter as pending normally.');
