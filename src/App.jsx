import React, { useState } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import AdministrativeCommandCenter from "./pages/administrative-command-center";
import CustomerWorkspacePortal from "./pages/customer-workspace-portal";

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

  // Demo credentials
  const demoCredentials = {
    admin: { email: 'admin@cybercafe.com', password: 'admin123' },
    customer: { email: 'customer@cybercafe.com', password: 'customer123' }
  };

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
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const expectedCredentials = demoCredentials[formData.role];
      
      if (formData.email === expectedCredentials.email && formData.password === expectedCredentials.password) {
        // Successful login
        setIsAuthenticated(true);
        setUserRole(formData.role);
        // Store auth data in localStorage for persistence
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('userEmail', formData.email);
      } else {
        setErrors({ general: 'Invalid credentials. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setFormData({ email: '', password: '', role: 'customer' });
    setErrors({});
  };

  // Check for existing authentication on component mount
  React.useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('userRole');
    if (storedAuth === 'true' && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
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
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === 'customer' 
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
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === 'admin' 
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
                          className={`w-full p-3 rounded-lg border transition-all ${
                            errors.email 
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
                          className={`w-full p-3 rounded-lg border transition-all ${
                            errors.password 
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
                      className={`w-full py-3 rounded-lg font-medium transition-all ${
                        isFormValid && !isLoading
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

                  {/* Demo credentials helper */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm font-medium mb-2">Demo Credentials:</p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div><strong>Admin:</strong> admin@cybercafe.com / admin123</div>
                      <div><strong>Customer:</strong> customer@cybercafe.com / customer123</div>
                    </div>
                  </div>
                  
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
