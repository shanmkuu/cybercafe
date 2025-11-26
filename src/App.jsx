import React, { useState } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import AdministrativeCommandCenter from "./pages/administrative-command-center";
import CustomerWorkspacePortal from "./pages/customer-workspace-portal";
import { createSession, endSession } from "./lib/db";
import { signIn, signUp } from "./lib/auth";

function App() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Attempt Supabase Sign In
      const { data: authData, error: authError } = await signIn({
        email: formData.email,
        password: formData.password
      });

      let user = authData?.user;

      // 2. If Sign In fails, check if we should auto-signup (for demo purposes)
      if (authError) {
        console.log('Sign in failed, attempting signup if demo user...', authError.message);

        // Check if it's a demo user or just try to signup anyway for this dev environment
        // For better UX in this specific "cybercafe" project context, we'll try to signup
        // if the error is invalid credentials or user not found.
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('User not found')) {
          const { data: signUpData, error: signUpError } = await signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: { role: formData.role }
            }
          });

          if (signUpError) {
            throw signUpError;
          }
          user = signUpData?.user;

          // If signup requires email confirmation, we might be stuck here depending on Supabase config.
          // Assuming "Enable Confirm Email" is OFF for this dev environment or auto-confirmed.
          if (user && !user.session) {
            // If no session, try signing in again (sometimes needed after auto-confirm)
            const { data: retryData } = await signIn({
              email: formData.email,
              password: formData.password
            });
            user = retryData?.user;
          }
        } else {
          throw authError;
        }
      }

      if (user) {
        // Successful login
        setIsAuthenticated(true);
        setUserRole(formData.role);

        // Session Management
        const startTime = new Date();
        setSessionStartTime(startTime);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('sessionStartTime', startTime.toISOString());

        // Create DB Session for customer
        if (formData.role === 'customer') {
          const { data: session } = await createSession(user.id, 'WS-007'); // Hardcoded WS ID for now
          if (session) {
            localStorage.setItem('sessionId', session.id);
          }
        }
        // Notify local Node server to unlock desktop (for kiosk flow)
        try {
          await fetch('http://localhost:3001/api/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('Failed to signal unlock to local server:', err);
          // Optional: Alert admin if the local server isn't running.
        }
      } else {
        throw new Error('Authentication failed. Please check your email for confirmation or try again.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  const handleLogout = async () => {
    // End DB Session if exists
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      await endSession(sessionId);
      localStorage.removeItem('sessionId');
    }

    setIsAuthenticated(false);
    setUserRole(null);
    setSessionStartTime(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionStartTime');
    setFormData({ email: '', password: '', role: 'customer' });
    setErrors({});
  };

  // Check for existing authentication on component mount
  React.useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('userRole');
    const storedStartTime = localStorage.getItem('sessionStartTime');

    if (storedAuth === 'true' && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      if (storedStartTime) {
        setSessionStartTime(new Date(storedStartTime));
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center p-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🛡️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">CyberCafe Tracker</h1>
                    <p className="text-gray-600">Secure Workstation Management System</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('customer')}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.role === 'customer'
                          ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                          }`}
                        disabled={isLoading}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👤</div>
                          <div className="font-medium">Customer</div>
                          <div className="text-xs opacity-70">File Management</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleChange('admin')}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.role === 'admin'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
                          }`}
                        disabled={isLoading}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">⚙️</div>
                          <div className="font-medium">Admin</div>
                          <div className="text-xs opacity-70">Full Access</div>
                        </div>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email address"
                          className={`w-full p-3 rounded-lg border transition-all ${errors.email
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                            : 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                            }`}
                          disabled={isLoading}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Password"
                          className={`w-full p-3 rounded-lg border transition-all ${errors.password
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                            : 'border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                            }`}
                          disabled={isLoading}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>
                    </div>

                    {errors.general && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className={`w-full py-3 rounded-lg font-medium transition-all ${isFormValid && !isLoading
                        ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>



                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>System Online</span>
                      <span>•</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to={userRole === 'admin' ? '/admin' : '/customer'} replace />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AdministrativeCommandCenter
                userRole={userRole}
                onLogout={handleLogout}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/customer"
          element={
            isAuthenticated && userRole === 'customer' ? (
              <CustomerWorkspacePortal
                userRole={userRole}
                onLogout={handleLogout}
                isAuthenticated={isAuthenticated}
                sessionStartTime={sessionStartTime}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}

export default App;
