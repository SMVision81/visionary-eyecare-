import { requireAdmin } from '@/lib/auth';
import { enquiries, isDemoData, reviews } from '@/lib/data';
import { purgeExpiredEnquiries } from '@/lib/retention';
import Sidebar from '@/components/admin/Sidebar';
import TopBar from '@/components/admin/TopBar';

// Shell for all signed-in admin pages. NOTE: layouts don't re-run on client navigation,
// so every page below ALSO calls requireAdmin() (and every Server Action does too).
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  await purgeExpiredEnquiries(); // before counting, so the nav never counts expired enquiries
  const [e, r] = await Promise.all([enquiries.counts(), reviews.counts()]);
  return (
    <div className="shell">
      <Sidebar newEnquiries={e.new} awaitingEnquiries={e.awaiting_reply} pendingReviews={r.pending} />
      <div className="shell-main">
        <TopBar email={session.email} attention={e.new + e.awaiting_reply} demo={isDemoData} />
        {children}
      </div>
    </div>
  );
}
