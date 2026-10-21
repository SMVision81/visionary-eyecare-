const TZ = 'Asia/Kuala_Lumpur';

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeZone: TZ }).format(new Date(iso));
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat('en-MY', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(new Date());
}

export function timeAgo(iso: string, now = Date.now()): string {
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(iso);
}
