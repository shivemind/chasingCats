import { prisma } from '@/lib/prisma';
import { UserRoleSelect } from '@/components/admin/user-role-select';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import type { UserRole } from '@prisma/client';

type UserWithCount = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  _count: { memberships: number };
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          memberships: true
        }
      }
    }
  }) as unknown as UserWithCount[];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-white/50 sm:mt-2 sm:text-base">Manage user accounts and roles</p>
      </div>

      <div className="mb-6 grid gap-3 grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-sm text-white/50">Total Users</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="text-2xl font-bold text-neon-cyan">
            {users.filter(u => u.role === 'ADMIN').length}
          </div>
          <div className="text-sm text-white/50">Admins</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="text-2xl font-bold text-brand">
            {users.filter(u => u.role === 'MEMBER').length}
          </div>
          <div className="text-sm text-white/50">Members</div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 lg:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-white">{user.name ?? 'No name'}</p>
                <p className="text-sm text-white/50">{user.email}</p>
              </div>
              <UserRoleSelect userId={user.id} currentRole={user.role} />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/50">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <DeleteUserButton userId={user.id} userName={user.name} />
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
            No users found.
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden rounded-2xl border border-white/10 bg-white/5 overflow-hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-white/50">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Subscriptions</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">
                  <span className="font-medium text-white">{user.name ?? 'No name'}</span>
                </td>
                <td className="px-6 py-4 text-white/70">{user.email}</td>
                <td className="px-6 py-4">
                  <UserRoleSelect userId={user.id} currentRole={user.role} />
                </td>
                <td className="px-6 py-4 text-white/70">{user._count.memberships}</td>
                <td className="px-6 py-4 text-white/70">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4">
                  <DeleteUserButton userId={user.id} userName={user.name} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
