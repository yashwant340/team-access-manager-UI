export function getDashboardRoute(roles: string[]): string {
  if (roles.includes('PLATFORM_ADMIN')) return '/platform-admin';
  if (roles.includes('TEAM_ADMIN')) return '/team-admin';
  return '/user-dashboard';
}
