'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [role, setRole] = useState(currentRole);

  const handleChange = async (newRole: string) => {
    if (newRole === role) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setRole(newRole);
      router.refresh();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isUpdating}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        role === 'ADMIN'
          ? 'border-neon-cyan/30 bg-neon-cyan/20 text-neon-cyan'
          : 'border-white/10 bg-white/10 text-white'
      } ${isUpdating ? 'opacity-50' : ''}`}
    >
      <option value="MEMBER" className="bg-midnight text-white">Member</option>
      <option value="ADMIN" className="bg-midnight text-white">Admin</option>
    </select>
  );
}
