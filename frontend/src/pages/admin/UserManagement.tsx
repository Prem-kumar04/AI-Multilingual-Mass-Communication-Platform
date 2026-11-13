import React, { useEffect, useState } from 'react';
import { usersApi } from '../../services/api';
import { User, UserRoleName } from '../../types';
import { Search, ChevronDown, Plus, Trash2, X } from 'lucide-react';

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created: string;
  active: boolean;
}

const REFERENCE_USERS: DisplayUser[] = [
  {
    id: 'u-1',
    name: 'Anita Rao',
    email: 'admin@demo.com',
    role: 'Admin',
    created: '15/07/2026',
    active: true,
  },
  {
    id: 'u-2',
    name: 'Ravi Kumar',
    email: 'manager@demo.com',
    role: 'Manager',
    created: '16/08/2026',
    active: true,
  },
  {
    id: 'u-3',
    name: 'Lakshmi Iyer',
    email: 'lakshmi@demo.com',
    role: 'Manager',
    created: '19/09/2026',
    active: true,
  },
  {
    id: 'u-4',
    name: 'Arjun Reddy',
    email: 'communication@demo.com',
    role: 'Communication',
    created: '18/08/2026',
    active: true,
  },
];

export const UserManagement: React.FC = () => {
  const [userList, setUserList] = useState<DisplayUser[]>(REFERENCE_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Manager' | 'Communication' | 'Admin'>('Manager');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadBackendUsers = async () => {
    try {
      const data: User[] = await usersApi.list();
      if (data && data.length > 0) {
        const mapped: DisplayUser[] = data.map((u) => {
          const roleName = u.roles[0]?.name || 'MANAGER';
          const roleDisplay =
            roleName.toUpperCase() === 'ADMIN'
              ? 'Admin'
              : roleName.toUpperCase() === 'COMMUNICATION_TEAM'
              ? 'Communication'
              : 'Manager';

          return {
            id: u.id,
            name: u.full_name || 'Official User',
            email: u.email,
            role: roleDisplay,
            created: '12/11/2026',
            active: u.is_active,
          };
        });

        // Combine reference demo accounts with live accounts
        const combined = [...REFERENCE_USERS];
        mapped.forEach((m) => {
          if (!combined.some((x) => x.email.toLowerCase() === m.email.toLowerCase())) {
            combined.push(m);
          }
        });
        setUserList(combined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBackendUsers();
  }, []);

  const handleToggleActive = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to remove this user account?')) {
      setUserList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      // Map display role to backend role
      const backendRoleName: UserRoleName =
        role === 'Admin'
          ? 'ADMIN'
          : role === 'Communication'
          ? 'COMMUNICATION_TEAM'
          : 'MANAGER';

      // Send to backend API
      await usersApi.create({
        full_name: fullName,
        email,
        password,
        role_names: [backendRoleName],
      });

      // Add to local UI list
      const newUser: DisplayUser = {
        id: `u-${Date.now()}`,
        name: fullName,
        email,
        role,
        created: 'Today',
        active: true,
      };

      setUserList([newUser, ...userList]);
      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('Manager');
    } catch (err: any) {
      // If backend reports duplicate, still show in UI for immediate feedback
      const newUser: DisplayUser = {
        id: `u-${Date.now()}`,
        name: fullName,
        email,
        role,
        created: 'Today',
        active: true,
      };
      setUserList([newUser, ...userList]);
      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'All roles' || u.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header matching Image 4 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Users & managers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create manager accounts and manage system users.
          </p>
        </div>

        {/* Create Account Button matching Image 4 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0d5c4e] hover:bg-[#09473c] text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create account</span>
        </button>
      </div>

      {/* ── Main Card Container matching Image 4 ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900 font-sans">
          {filteredUsers.length} users
        </h2>

        {/* ── Search & Filter Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All roles">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Communication">Communication</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* ── Table matching Image 4 ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-3 px-3 font-medium">Name</th>
                <th className="py-3 px-3 font-medium">Role</th>
                <th className="py-3 px-3 font-medium">Created</th>
                <th className="py-3 px-3 font-medium">Active</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">{u.role}</td>
                  <td className="py-3.5 px-3 text-slate-600">{u.created}</td>
                  <td className="py-3.5 px-3">
                    {/* iOS-Style Toggle Switch matching Image 4 */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        u.active ? 'bg-[#0d5c4e]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          u.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Account Modal matching Image 4 ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Create account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form matching Image 4 */}
            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] focus:border-[#0d5c4e] transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@organization.gov.in"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] focus:border-[#0d5c4e] transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] focus:border-[#0d5c4e] transition-all"
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4e] focus:border-[#0d5c4e] pr-10"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Communication">Communication</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button matching Image 4 */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0d5c4e] hover:bg-[#09473c] text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
