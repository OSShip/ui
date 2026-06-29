export interface NavLink {
  href: string;
  label: string;
}

export function defaultDashboard(role: string) {
  if (role === 'admin') return '/dashboard/admin/applications';
  if (role === 'mentor') return '/dashboard/mentor';
  return '/dashboard/student';
}

export function getNavLinks(role?: string): NavLink[] {
  const links: NavLink[] = [];

  if (role === 'student' || role === 'admin') {
    links.push({ href: '/dashboard/student', label: 'Student' });
  }

  if (role === 'mentor' || role === 'admin') {
    links.push({ href: '/dashboard/mentor', label: 'Mentor' });
  }

  if (role === 'admin') {
    links.push({ href: '/dashboard/admin/applications', label: 'Applications' });
    links.push({ href: '/dashboard/admin/ledger', label: 'Ledger' });
  }

  return links;
}

export function canAccessPath(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  if (pathname.startsWith('/dashboard/admin')) return role === 'admin';
  if (pathname.startsWith('/dashboard/mentor')) return role === 'mentor' || role === 'admin';
  if (pathname.startsWith('/dashboard/student')) return role === 'student' || role === 'admin';
  return true;
}
