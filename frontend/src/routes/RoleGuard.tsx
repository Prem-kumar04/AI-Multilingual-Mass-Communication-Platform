import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRoleName } from '../types';
import { Globe2 } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRoleName[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Globe2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"
            style={{ borderWidth: '3px' }} />
          <p className="text-slate-500 text-sm font-medium">Verifying your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = user.roles.some((r) =>
    allowedRoles.map((ar) => ar.toUpperCase()).includes(r.name.toUpperCase() as UserRoleName)
  );

  if (!hasRequiredRole) {
    const userRoleNames = user.roles.map((r) => r.name.toUpperCase());
    if (userRoleNames.includes('ADMIN')) return <Navigate to="/admin/dashboard" replace />;
    if (userRoleNames.includes('COMMUNICATION_TEAM')) return <Navigate to="/comm/dashboard" replace />;
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Outlet />;
};
