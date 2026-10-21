// Give someone access to /admin.  Usage (from visionary/):  npm run admin:add -- owner@example.com
// Creates the Supabase Auth user if needed (with a random temporary password, printed ONCE) and adds them to the
// `admins` allow-list. Reads keys from .env.local; uses the service-role key, so run it only on a trusted machine.
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const email = (process.argv[2] ?? '').trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: npm run admin:add -- owner@example.com');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser() {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit || data.users.length < 200) return hit ?? null;
  }
  return null;
}

let user = await findUser();
let tempPassword = null;
if (!user) {
  tempPassword = randomBytes(12).toString('base64url');
  const { data, error } = await db.auth.admin.createUser({ email, password: tempPassword, email_confirm: true });
  if (error) throw error;
  user = data.user;
}
const { error } = await db.from('admins').upsert({ user_id: user.id, email, role: 'owner' });
if (error) {
  console.error('Could not add to admins (did you run supabase/migrations/*.sql?):', error.message);
  process.exit(1);
}
console.log(`✓ ${email} can now sign in at /admin`);
if (tempPassword) console.log(`  Temporary password (shown once, change it in Supabase → Authentication): ${tempPassword}`);
