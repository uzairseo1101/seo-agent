import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('POSTGRES_URL environment variable is required to run migrations.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected successfully!');

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261103_subscriptions_and_entitlements.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Executing migration 20261103_subscriptions_and_entitlements.sql...');
  await client.query(sql);
  console.log('Migration executed successfully!');

  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('subscriptions', 'subscription_entitlements', 'usage_records')
  `);
  console.log('Created tables verified:', res.rows.map(r => r.table_name));

  await client.end();
}

run().catch(err => {
  console.error('Fatal Migration error:', err);
  process.exit(1);
});
