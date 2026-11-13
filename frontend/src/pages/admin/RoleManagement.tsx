import React, { useEffect, useState } from 'react';
import { rolesApi } from '../../services/api';
import { Role, Permission } from '../../types';
import { ShieldCheck, Lock, Check } from 'lucide-react';

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p] = await Promise.all([rolesApi.listRoles(), rolesApi.listPermissions()]);
        setRoles(r);
        setPermissions(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Role & Permission Matrix</h1>
        <p className="text-sm text-slate-500 mt-1">
          Role-Based Access Control (RBAC) capability definitions and policy enforcement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">{r.name}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                System Role Enforcement: Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <h2 className="text-base font-bold text-slate-900">Registered Platform Capabilities</h2>
          <p className="text-xs text-slate-500">Total {permissions.length} granular security permissions mapped in database.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Permission Code</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-mono text-xs text-purple-700 font-semibold">{p.code}</td>
                  <td className="py-2.5 px-4 text-slate-700 font-medium">{p.resource}</td>
                  <td className="py-2.5 px-4 text-slate-500 text-xs uppercase">{p.action}</td>
                  <td className="py-2.5 px-4 text-slate-600 text-xs">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

