export function getDashboardRoute(platformRole?: string | null): string {
  if (!platformRole) return '/user-dashboard';
  switch (platformRole) {
    case 'PLATFORM_ADMIN':
      return '/platform-admin';
    case 'TEAM_ADMIN':
      return '/team-admin';
    case 'USER':
    default:
      return '/user-dashboard';
  }
}
