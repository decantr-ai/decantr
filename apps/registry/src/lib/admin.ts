const ADMIN_EMAILS: string[] = process.env.DECANTR_ADMIN_EMAILS
  ? process.env.DECANTR_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  : ['davidaimi@gmail.com']; // fallback for local dev

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
