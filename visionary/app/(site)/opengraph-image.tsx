import { ImageResponse } from 'next/og';

// Social preview (WhatsApp, Facebook, Google) shared by every public page. Brand colours from tokens.css.
export const alt = 'Visionary Eyecare, an independent optical shop at OUG Parklane, Kuala Lumpur';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80, background: '#0a1f4f', color: '#fcfbf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="120" height="52" viewBox="0 0 120 52">
            <circle cx="30" cy="26" r="22" fill="none" stroke="#c9a96a" strokeWidth="5" />
            <circle cx="90" cy="26" r="22" fill="none" stroke="#c9a96a" strokeWidth="5" />
            <path d="M52 22 Q60 12 68 22" fill="none" stroke="#c9a96a" strokeWidth="5" />
          </svg>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 8, color: '#c9a96a' }}>VISIONARY EYECARE</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.05 }}>Good vision changes</div>
          <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.05, color: '#f0697a' }}>the whole day.</div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(252, 251, 248, .8)' }}>
          In-house optometrist & optician · 20 years of optical experience · OUG Parklane, KL
        </div>
      </div>
    ),
    size,
  );
}
