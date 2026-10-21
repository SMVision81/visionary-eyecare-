import type { Metadata } from 'next';
import '../styles/tokens.css';
import '../styles/admin-tokens.css';
import '../styles/admin.css';
import { fontVars } from '../fonts';

export const metadata: Metadata = {
  title: { default: 'Admin | Visionary Eyecare', template: '%s | Visionary Eyecare Admin' },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: '/images/logo.svg' },
};

// Separate root layout: no public Header/Footer/WhatsApp, no analytics.
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars}>
      <body className="admin-body" suppressHydrationWarning>
        {/* Apply the saved admin theme before paint to avoid a dark flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('ad-theme')==='light')document.body.dataset.theme='light'}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
