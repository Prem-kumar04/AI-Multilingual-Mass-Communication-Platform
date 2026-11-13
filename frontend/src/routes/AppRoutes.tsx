import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleGuard } from './RoleGuard';

// Auth
import { Login } from '../pages/auth/Login';

// Admin Pages
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { RoleManagement } from '../pages/admin/RoleManagement';
import { AdminCampaigns } from '../pages/admin/AdminCampaigns';
import { AdminAudiences } from '../pages/admin/AdminAudiences';
import { AdminApprovals } from '../pages/admin/AdminApprovals';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { AuditLogs } from '../pages/admin/AuditLogs';
import { AdminSettings } from '../pages/admin/AdminSettings';

// Manager Pages
import { ManagerLayout } from '../layouts/ManagerLayout';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { CampaignList } from '../pages/manager/CampaignList';
import { CreateCampaign } from '../pages/manager/CreateCampaign';
import { CampaignDetail } from '../pages/manager/CampaignDetail';
import { AudienceManagement } from '../pages/manager/AudienceManagement';
import { SegmentBuilder } from '../pages/manager/SegmentBuilder';
import { TemplateLibrary } from '../pages/manager/TemplateLibrary';
import { ManagerReports } from '../pages/manager/ManagerReports';

// Comm Team Pages
import { CommunicationLayout } from '../layouts/CommunicationLayout';
import { CommDashboard } from '../pages/communication/CommDashboard';
import { PendingApprovals } from '../pages/communication/PendingApprovals';
import { CampaignReview } from '../pages/communication/CampaignReview';
import { ApprovedCampaigns } from '../pages/communication/ApprovedCampaigns';
import { DistributionCenter } from '../pages/communication/DistributionCenter';
import { DeliveryMonitoring } from '../pages/communication/DeliveryMonitoring';
import { DistributionReports } from '../pages/communication/DistributionReports';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    const roleNames = user.roles.map((r) => r.name.toUpperCase());
    if (roleNames.includes('ADMIN')) return <Navigate to="/admin/dashboard" replace />;
    if (roleNames.includes('COMMUNICATION_TEAM')) return <Navigate to="/comm/dashboard" replace />;
    return <Navigate to="/manager/dashboard" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={getHomeRedirect()} />
      <Route path="/login" element={<Login />} />

      {/* Admin Protected Routes */}
      <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="audiences" element={<AdminAudiences />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Manager Protected Routes */}
      <Route element={<RoleGuard allowedRoles={['MANAGER', 'ADMIN']} />}>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="campaigns" element={<CampaignList />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="audiences" element={<AudienceManagement />} />
          <Route path="segments" element={<SegmentBuilder />} />
          <Route path="templates" element={<TemplateLibrary />} />
          <Route path="reports" element={<ManagerReports />} />
        </Route>
      </Route>

      {/* Communication Team Protected Routes */}
      <Route element={<RoleGuard allowedRoles={['COMMUNICATION_TEAM', 'ADMIN']} />}>
        <Route path="/comm" element={<CommunicationLayout />}>
          <Route index element={<Navigate to="/comm/dashboard" replace />} />
          <Route path="dashboard" element={<CommDashboard />} />
          <Route path="approvals" element={<PendingApprovals />} />
          <Route path="review/:id" element={<CampaignReview />} />
          <Route path="approved" element={<ApprovedCampaigns />} />
          <Route path="distribution" element={<DistributionCenter />} />
          <Route path="monitoring" element={<DeliveryMonitoring />} />
          <Route path="reports" element={<DistributionReports />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

