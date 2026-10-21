import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { isDemoData, stats } from '@/lib/data';
import { GoogleStatus, PageHeader } from '@/components/admin/ui';
import GoogleImport from '@/components/admin/GoogleImport';

export const metadata: Metadata = { title: 'Import Google reviews' };

export default async function ImportPage() {
  await requireAdmin();
  const google = await stats.get();
  return (
    <main className="admin-page">
      <PageHeader
        title="Import Google reviews"
        subtitle="Every ~3 weeks: export from Google Takeout, then choose the folder here."
        actions={
          <>
            <GoogleStatus stats={google} demo={isDemoData} />
            <Link className="a-btn a-btn-ghost a-btn-sm" href="/admin/reviews">
              ← Back to reviews
            </Link>
          </>
        }
      />
      {isDemoData && (
        <p className="alert alert-warn" role="note">
          Demo mode: imported reviews are kept in memory only and disappear when the server restarts. Connect Supabase to save them.
        </p>
      )}
      <GoogleImport />
    </main>
  );
}
