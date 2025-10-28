import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthenticationRouter from "./components/ui/AuthenticationRouter";
import NotFound from "./pages/NotFound";
import CustomerWorkspacePortal from './pages/customer-workspace-portal';
import AdministrativeCommandCenter from './pages/administrative-command-center';
import AuthenticationPortal from './pages/authentication-portal';
import SystemErrorRecoveryInterface from './pages/system-error-recovery-interface';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={
          <AuthenticationRouter>
            <AuthenticationPortal />
          </AuthenticationRouter>
        } />
        <Route path="/customer-workspace-portal" element={
          <AuthenticationRouter>
            <CustomerWorkspacePortal userRole="" onLogout={() => {}} isAuthenticated={true} />
          </AuthenticationRouter>
        } />
        <Route path="/administrative-command-center" element={
          <AuthenticationRouter>
            <AdministrativeCommandCenter userRole="" onLogout={() => {}} isAuthenticated={true} />
          </AuthenticationRouter>
        } />
        <Route path="/authentication-portal" element={
          <AuthenticationRouter>
            <AuthenticationPortal />
          </AuthenticationRouter>
        } />
        <Route path="/system-error-recovery-interface" element={
          <AuthenticationRouter>
            <SystemErrorRecoveryInterface onLogout={() => {}} />
          </AuthenticationRouter>
        } />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
