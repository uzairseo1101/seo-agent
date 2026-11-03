'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.users) {
          setUsers(json.users);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' || user.role === 'superadmin' ? 'user' : 'admin';
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
        setActionNotice(`Role updated: ${user.email} is now ${newRole}.`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (e: any) {
      alert(`Failed to update role: ${e.message}`);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cascades and removes all associated data.`)) {
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setActionNotice(`User ${email} was deleted.`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (e: any) {
      alert(`Failed to delete user: ${e.message}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-head text-text">User Accounts & Access Management</h1>
          <p className="text-xs text-muted mt-1">
            Manage registered clients, grant administrative privileges, and audit account access
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-card hover:bg-slate-50 border border-border text-text rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by email address or user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:border-primary"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Administrators</option>
            <option value="user">Standard Clients</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg border-b border-border text-[11px] font-semibold text-muted font-sans uppercase">
              <tr>
                <th className="px-5 py-3.5">User / Email</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-medium text-text">{u.email}</div>
                      <div className="text-[10px] text-muted font-mono mt-0.5">ID: {u.id}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-text">
                      {u.fullName || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin' || u.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(u)}
                          className="px-2.5 py-1 rounded-md border border-border text-[11px] font-medium text-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Toggle Admin Privilege"
                        >
                          {u.role === 'admin' || u.role === 'superadmin' ? 'Demote to User' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 text-muted hover:text-error rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
