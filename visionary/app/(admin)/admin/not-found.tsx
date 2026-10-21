import Link from 'next/link';
import { EmptyState } from '@/components/admin/ui';

export default function AdminNotFound() {
  return (
    <main className="admin-page">
      <EmptyState title="Nothing here" text="That admin page does not exist." />
      <p>
        <Link className="link" href="/admin">
          ← Back to dashboard
        </Link>
      </p>
    </main>
  );
}
