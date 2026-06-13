import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/jwt';
import DashboardLayoutClient from '@/components/DashboardLayoutClient';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload) {
    redirect('/login');
  }

  const user = {
    name: payload.name || 'Admin',
    email: payload.email || 'admin@nexgenaitech.com',
    role: payload.role || 'admin',
  };

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
