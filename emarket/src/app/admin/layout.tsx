import { cookies } from 'next/headers';
import AdminLogin from './AdminLogin';

// Simple admin password - in production, use proper authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dcat2024admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');

  // Check if user is authenticated
  const isAuthenticated = adminToken?.value === ADMIN_PASSWORD;

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}
