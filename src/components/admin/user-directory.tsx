'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt?: string;
  subscriptionTier?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  totalWatchTime?: number;
  completedLessons?: number;
  location?: string;
  status: 'active' | 'suspended' | 'banned';
}

interface UserDirectoryProps {
  users: User[];
  onSelectUser: (userId: string) => void;
  onSelectMultiple: (userIds: string[]) => void;
  selectedUsers: string[];
}

export function UserDirectory({ users, onSelectUser, onSelectMultiple, selectedUsers }: UserDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'MEMBER'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'elite'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastActiveAt' | 'watchTime'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.location?.toLowerCase().includes(query)
      );
    }

    // Filters
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (tierFilter !== 'all') result = result.filter(u => u.subscriptionTier === tierFilter);
    if (statusFilter !== 'all') result = result.filter(u => u.status === statusFilter);

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastActiveAt':
          comparison = new Date(a.lastActiveAt || 0).getTime() - new Date(b.lastActiveAt || 0).getTime();
          break;
        case 'watchTime':
          comparison = (a.totalWatchTime || 0) - (b.totalWatchTime || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, searchQuery, roleFilter, tierFilter, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      onSelectMultiple([]);
    } else {
      onSelectMultiple(paginatedUsers.map(u => u.id));
    }
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'elite': return 'bg-cat-eye/20 text-cat-eye';
      case 'pro': return 'bg-neon-purple/20 text-neon-purple';
      default: return 'bg-white/10 text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'suspended': return 'bg-yellow-500/20 text-yellow-400';
      case 'banned': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or location..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-neon-cyan/50 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="MEMBER">Members</option>
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-neon-cyan/50 focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-neon-cyan/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as typeof sortOrder);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-neon-cyan/50 focus:outline-none"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="lastActiveAt-desc">Recently Active</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="watchTime-desc">Most Watch Time</option>
          </select>
        </div>

        {/* Results summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {paginatedUsers.length} of {filteredUsers.length} users
            {selectedUsers.length > 0 && ` (${selectedUsers.length} selected)`}
          </span>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => onSelectMultiple([])}
              className="text-neon-cyan hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-white/20"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Watch Time</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Last Active</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr 
                key={user.id} 
                className={`border-b border-white/5 hover:bg-white/5 ${
                  selectedUsers.includes(user.id) ? 'bg-neon-cyan/5' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {
                      if (selectedUsers.includes(user.id)) {
                        onSelectMultiple(selectedUsers.filter(id => id !== user.id));
                      } else {
                        onSelectMultiple([...selectedUsers, user.id]);
                      }
                    }}
                    className="rounded border-white/20"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.name || ''} width={40} height={40} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name || 'No name'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    user.role === 'ADMIN' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getTierBadge(user.subscriptionTier)}`}>
                    {user.subscriptionTier || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {user.totalWatchTime ? `${Math.round(user.totalWatchTime / 60)}h` : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelectUser(user.id)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedUsers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  currentPage === page ? 'bg-neon-cyan text-black' : 'bg-white/5 text-white'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
