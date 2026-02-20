import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams } from
'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireSuperAdmin } from './components/auth/RequireSuperAdmin';
import { RequireTenantRole } from './components/auth/RequireTenantRole';
import { TenantRouteProvider } from './components/tenant/TenantRouteProvider';
import { TenantLayoutWrapper } from './components/tenant/TenantLayoutWrapper';
import { HomePage } from './pages/public/HomePage';
import { CommunitiesPage } from './pages/public/CommunitiesPage';
import { TenantPublicPage } from './pages/public/TenantPublicPage';
import { TenantJoinPage } from './pages/public/TenantJoinPage';
import { TenantPendingPage } from './pages/public/TenantPendingPage';
import { PricingPage } from './pages/public/PricingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminEntryPage } from './pages/auth/AdminEntryPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { EnterLicensePage } from './pages/auth/EnterLicensePage';
import { SignupPage } from './pages/auth/SignupPage';
import { SetupCommunityPage } from './pages/auth/SetupCommunityPage';
import { ContactSalesPage } from './pages/public/ContactSalesPage';
import { TenantMemberAnnouncementsPage } from './pages/tenant-member/TenantMemberAnnouncementsPage';
import { TenantMemberResourcesPage } from './pages/tenant-member/TenantMemberResourcesPage';
import { TenantMemberNotificationsPage } from './pages/tenant-member/TenantMemberNotificationsPage';
import { TenantMemberProfilePage } from './pages/tenant-member/TenantMemberProfilePage';
import { TenantMemberGroupsPage } from './pages/tenant-member/TenantMemberGroupsPage';
import { TenantMemberEventsPage } from './pages/tenant-member/TenantMemberEventsPage';
import { TenantMemberProgramsPage } from './pages/tenant-member/TenantMemberProgramsPage';
import { TenantAdminDashboardPage } from './pages/tenant-admin/TenantAdminDashboardPage';
import { TenantAdminAnnouncementsPage } from './pages/tenant-admin/TenantAdminAnnouncementsPage';
import { TenantAdminMembersPage } from './pages/tenant-admin/TenantAdminMembersPage';
import { TenantAdminInvitationsPage } from './pages/tenant-admin/TenantAdminInvitationsPage';
import { TenantAdminContentPage } from './pages/tenant-admin/TenantAdminContentPage';
import { TenantAdminResourcesPage } from './pages/tenant-admin/TenantAdminResourcesPage';
import { TenantAdminResourceEditPage } from './pages/tenant-admin/TenantAdminResourceEditPage';
import { TenantAdminGroupsPage } from './pages/tenant-admin/TenantAdminGroupsPage';
import { TenantAdminModuleDetailPage } from './pages/tenant-admin/TenantAdminModuleDetailPage';
import { TenantAdminEventsPage } from './pages/tenant-admin/TenantAdminEventsPage';
import { TenantAdminEventEditPage } from './pages/tenant-admin/TenantAdminEventEditPage';
import { TenantAdminProgramsPage } from './pages/tenant-admin/TenantAdminProgramsPage';
import { TenantAdminProgramDetailPage } from './pages/tenant-admin/TenantAdminProgramDetailPage';
import { TenantAdminGroupDetailPage } from './pages/tenant-admin/TenantAdminGroupDetailPage';
import { TenantAdminRegistrationFormPage } from './pages/tenant-admin/TenantAdminRegistrationFormPage';
import { TenantAdminAnalyticsPage } from './pages/tenant-admin/TenantAdminAnalyticsPage';
import { TenantAdminBillingPage } from './pages/tenant-admin/TenantAdminBillingPage';
import { TenantAdminOnboardingPage } from './pages/tenant-admin/TenantAdminOnboardingPage';
import { TenantAdminSettingsPage } from './pages/tenant-admin/TenantAdminSettingsPage';
import { TenantAdminHomeBuilderPage } from './pages/tenant-admin/TenantAdminHomeBuilderPage';
import { SuperAdminDashboardPage } from './pages/super-admin/SuperAdminDashboardPage';
import { OrganizationsPage } from './pages/super-admin/OrganizationsPage';
import { TenantDetailPage } from './pages/super-admin/TenantDetailPage';
import { PlatformUsersPage } from './pages/super-admin/PlatformUsersPage';
import { PlansPage } from './pages/super-admin/PlansPage';
import { SystemAnalyticsPage } from './pages/super-admin/SystemAnalyticsPage';
import { AuditLogsPage } from './pages/super-admin/AuditLogsPage';
import { SuperAdminSettingsPage } from './pages/super-admin/SuperAdminSettingsPage';
import { DebugSessionPage } from './pages/debug/DebugSessionPage';
import { MyCommunitiesPage } from './pages/my-communities/MyCommunitiesPage';

function RedirectAppToCommunity() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  if (!tenantSlug) return <Navigate to="/communities" replace />;
  return <Navigate to={`/c/${tenantSlug}`} replace />;
}

function RedirectAppSplatToCommunity() {
  const { tenantSlug } = useParams<{ tenantSlug: string; '*': string }>();
  const rest = useParams<{ tenantSlug: string; '*': string }>()['*'];
  if (!tenantSlug) return <Navigate to="/communities" replace />;
  if (rest) return <Navigate to={`/c/${tenantSlug}/${rest}`} replace />;
  return <Navigate to={`/c/${tenantSlug}`} replace />;
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact-sales" element={<ContactSalesPage />} />
              <Route element={<TenantRouteProvider />}>
                <Route path="/c/:tenantSlug" element={<TenantPublicPage />} />
                <Route path="/c/:tenantSlug/join" element={<TenantJoinPage />} />
                <Route path="/c/:tenantSlug/pending" element={<TenantPendingPage />} />
              </Route>
              </Route>

              <Route path="/admin" element={<AdminEntryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/enter-license" element={<EnterLicensePage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/setup-community" element={<SetupCommunityPage />} />
              <Route path="/register" element={<Navigate to="/enter-license" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/my-communities" element={<RequireAuth><MyCommunitiesPage /></RequireAuth>} />
              <Route path="/debug-session" element={import.meta.env.DEV ? <DebugSessionPage /> : <Navigate to="/" replace />} />
              <Route path="/debug-auth" element={import.meta.env.DEV ? <DebugSessionPage /> : <Navigate to="/" replace />} />

              <Route element={<TenantRouteProvider />}>
                <Route path="/c/:tenantSlug/app" element={<RedirectAppToCommunity />} />
                <Route path="/c/:tenantSlug/app/*" element={<RedirectAppSplatToCommunity />} />
                <Route
                  element={
                    <RequireAuth>
                      <RequireTenantRole roles={['member', 'employee', 'supervisor', 'admin', 'owner']}>
                        <TenantLayoutWrapper variant="tenant-member" />
                      </RequireTenantRole>
                    </RequireAuth>
                  }
                >
                  <Route path="/c/:tenantSlug/announcements" element={<TenantMemberAnnouncementsPage />} />
                  <Route path="/c/:tenantSlug/events" element={<TenantMemberEventsPage />} />
                  <Route path="/c/:tenantSlug/groups" element={<TenantMemberGroupsPage />} />
                  <Route path="/c/:tenantSlug/resources" element={<TenantMemberResourcesPage />} />
                  <Route path="/c/:tenantSlug/programs" element={<TenantMemberProgramsPage />} />
                  <Route path="/c/:tenantSlug/notifications" element={<TenantMemberNotificationsPage />} />
                  <Route path="/c/:tenantSlug/profile" element={<TenantMemberProfilePage />} />
                </Route>

                <Route
                  path="/c/:tenantSlug/admin"
                  element={
                    <RequireAuth>
                      <RequireTenantRole roles={['admin', 'owner', 'supervisor']}>
                        <TenantLayoutWrapper variant="tenant-admin" />
                      </RequireTenantRole>
                    </RequireAuth>
                  }
                >
                  <Route index element={<TenantAdminDashboardPage />} />
                  <Route path="onboarding" element={<TenantAdminOnboardingPage />} />
                  <Route path="home-builder" element={<TenantAdminHomeBuilderPage />} />
                  <Route path="announcements" element={<TenantAdminAnnouncementsPage />} />
                  <Route path="members" element={<TenantAdminMembersPage />} />
                  <Route path="invitations" element={<TenantAdminInvitationsPage />} />
                  <Route path="content" element={<TenantAdminContentPage />} />
                  <Route path="resources" element={<TenantAdminResourcesPage />} />
                  <Route path="resources/:resourceId" element={<TenantAdminResourceEditPage />} />
                  <Route path="groups" element={<TenantAdminGroupsPage />} />
                  <Route path="groups/:groupId" element={<TenantAdminGroupDetailPage />} />
                  <Route path="events" element={<TenantAdminEventsPage />} />
                  <Route path="events/:eventId" element={<TenantAdminEventEditPage />} />
                  <Route path="programs" element={<TenantAdminProgramsPage />} />
                  <Route path="programs/:programId" element={<TenantAdminProgramDetailPage />} />
                  <Route path="programs/:programId/modules/:moduleId" element={<TenantAdminModuleDetailPage />} />
                  <Route path="registration-form" element={<TenantAdminRegistrationFormPage />} />
                  <Route path="settings" element={<TenantAdminSettingsPage />} />
                  <Route path="analytics" element={<TenantAdminAnalyticsPage />} />
                  <Route path="billing" element={<TenantAdminBillingPage />} />
                </Route>
              </Route>

              <Route
                path="/super-admin"
                element={
                  <RequireAuth>
                    <RequireSuperAdmin>
                      <AuthenticatedLayout variant="super-admin" />
                    </RequireSuperAdmin>
                  </RequireAuth>
                }
              >
                <Route index element={<SuperAdminDashboardPage />} />
                <Route path="tenants" element={<OrganizationsPage />} />
                <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
                <Route path="users" element={<PlatformUsersPage />} />
                <Route path="licenses" element={<PlansPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="settings" element={<SuperAdminSettingsPage />} />
                <Route path="analytics" element={<SystemAnalyticsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>);

}
