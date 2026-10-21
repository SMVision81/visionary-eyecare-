'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/(admin)/admin/login/actions';

type Props = { newEnquiries: number; awaitingEnquiries: number; pendingReviews: number };

const icons = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  reviews: <path d="m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.3L12 17l-5.6 3.2 1.3-6.3L3 9.6l6.3-.7z" />,
  enquiries: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5" />,
};

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar({ newEnquiries, awaitingEnquiries, pendingReviews }: Props) {
  const pathname = usePathname();
  const links = [
    { href: '/admin', label: 'Dashboard', icon: 'home' as const, badge: 0 },
    { href: '/admin/enquiries', label: 'Enquiries', icon: 'enquiries' as const, badge: newEnquiries + awaitingEnquiries },
    { href: '/admin/reviews', label: 'Reviews', icon: 'reviews' as const, badge: pendingReviews },
  ];
  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="sidebar">
      <Link href="/admin" className="sidebar-brand" aria-label="Visionary Eyecare admin home">
        <img src="/images/logo-white.svg" alt="Visionary Eyecare" width={92} height={44} />
        <span>Admin</span>
      </Link>
      <nav aria-label="Admin">
        <p className="nav-group">Workspace</p>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? 'is-active' : undefined} aria-current={isActive(l.href) ? 'page' : undefined}>
            <Icon name={l.icon} />
            <span className="nav-label">{l.label}</span>
            {l.badge > 0 && (
              <span className="nav-badge" aria-label={`${l.badge} need attention`}>
                {l.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <a href="/" target="_blank" rel="noreferrer">
          View website ↗
        </a>
        <form action={logoutAction}>
          <button type="submit" className="a-btn a-btn-ghost a-btn-sm">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
