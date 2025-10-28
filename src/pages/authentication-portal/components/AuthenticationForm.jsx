import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const AuthenticationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
    rememberDevice: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Mock credentials for demonstration
  const mockCredentials = {
    admin: { email: 'admin@cybercafe.com', password: 'admin123' },
    customer: { email: 'customer@cybercafe.com', password: 'customer123' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setErrors({});
    // Auto-fill credentials when role changes for demo purposes
    const roleCredentials = mockCredentials?.[role];
    if (roleCredentials) {
      setFormData(prev => ({
        ...prev,
        role,
        email: roleCredentials?.email,
        password: roleCredentials?.password
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const expectedCredentials = mockCredentials?.[formData?.role];
      
      if (formData?.email === expectedCredentials?.email && formData?.password === expectedCredentials?.password) {
        // Successful authentication
        const authData = {
          email: formData?.email,
          role: formData?.role,
          timestamp: new Date()?.toISOString(),
          rememberDevice: formData?.rememberDevice
        };

        localStorage.setItem('cyberCafeAuth', JSON.stringify(authData));
        
        // Reset login attempts on successful login
        setLoginAttempts(0);
        
        // Route based on role
        if (formData?.role === 'admin') {
          navigate('/administrative-command-center');
        } else {
          navigate('/customer-workspace-portal');
        }
      } else {
        // Failed authentication
        setLoginAttempts(prev => prev + 1);
        setErrors({ 
          general: `Invalid credentials. Check your email and password.\n\nFor testing purposes:\n• Admin: ${mockCredentials?.admin?.email} / ${mockCredentials?.admin?.password}\n• Customer: ${mockCredentials?.customer?.email} / ${mockCredentials?.customer?.password}` 
        });
      }
    } catch (error) {
      setErrors({ general: 'Authentication service unavailable. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = () => {
    // In a real app, this would trigger password reset flow
    alert('Password reset link would be sent to your email address.');
  };

  const handleEmergencyAccess = () => {
    navigate('/system-error-recovery-interface');
  };

  const handleQuickLogin = (role) => {
    const credentials = mockCredentials?.[role];
    if (credentials) {
      setFormData({
        ...formData,
        role,
        email: credentials?.email,
        password: credentials?.password
      });
      setErrors({});
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Access Level</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange('customer')}
              className={`p-4 rounded-xl border-2 transition-all spring-hover ${
                formData?.role === 'customer' ?'border-primary bg-primary/5 text-primary' :'border-border bg-card text-muted-foreground hover:border-primary/50'
              }`}
              disabled={isLoading}
            >
              <Icon name="User" size={24} className="mx-auto mb-2" />
              <div className="text-sm font-medium">Customer</div>
              <div className="text-xs opacity-70">File Management</div>
            </button>
            
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`p-4 rounded-xl border-2 transition-all spring-hover ${
                formData?.role === 'admin' ?'border-primary bg-primary/5 text-primary' :'border-border bg-card text-muted-foreground hover:border-primary/50'
              }`}
              disabled={isLoading}
            >
              <Icon name="Settings" size={24} className="mx-auto mb-2" />
              <div className="text-sm font-medium">Administrator</div>
              <div className="text-xs opacity-70">Full Access</div>
            </button>
          </div>
        </div>

        {/* Quick Login Helpers */}
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
            disabled={isLoading}
          >
            Fill Admin Credentials
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('customer')}
            className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
            disabled={isLoading}
          >
            Fill Customer Credentials
          </button>
        </div>

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData?.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          error={errors?.email}
          required
          disabled={isLoading}
        />

        {/* Password Input */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            error={errors?.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>

        {/* Remember Device */}
        <Checkbox
          label="Remember this device for 30 days"
          checked={formData?.rememberDevice}
          onChange={(e) => setFormData(prev => ({ ...prev, rememberDevice: e?.target?.checked }))}
          disabled={isLoading}
        />

        {/* General Error */}
        {errors?.general && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
              <div className="text-sm text-error whitespace-pre-line">{errors?.general}</div>
            </div>
          </div>
        )}

        {/* Login Attempts Warning */}
        {loginAttempts >= 3 && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="text-sm text-warning">
                Multiple failed attempts detected. Account may be locked after 5 attempts.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="LogIn"
          iconPosition="right"
          className="spring-hover"
          disabled={loginAttempts >= 5}
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </Button>

        {/* Additional Options */}
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-primary hover:text-primary/80 transition-colors"
            disabled={isLoading}
          >
            Forgot Password?
          </button>
          
          <button
            type="button"
            onClick={handleEmergencyAccess}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            Emergency Access
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthenticationForm;