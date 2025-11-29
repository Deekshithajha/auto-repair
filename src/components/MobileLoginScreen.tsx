import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import carAnimation from '../assets/lottie/Car Services.json';
import carLoaderAnimation from '../assets/lottie/carr.json';

export const MobileLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Demo credentials for each role
  const demoCredentials = {
    customer: {
      username: 'customer@demo.com',
      password: 'demo123',
      dashboard: '/customer',
      label: 'Customer Dashboard',
    },
    employee: {
      username: 'employee@demo.com',
      password: 'demo123',
      dashboard: '/employee',
      label: 'Employee Dashboard',
    },
    admin: {
      username: 'admin@demo.com',
      password: 'demo123',
      dashboard: '/admin',
      label: 'Admin Dashboard',
    },
  };

  const handleDemoLogin = (role: 'customer' | 'employee' | 'admin') => {
    const creds = demoCredentials[role];
    setUsername(creds.username);
    setPassword(creds.password);
    setShowDemoCredentials(false);
    
    // Auto-login after setting credentials
    setTimeout(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate(creds.dashboard);
      }, 2000);
    }, 100);
  };

  const getDashboardPath = () => {
    // Check if credentials match any demo account
    if (username === demoCredentials.customer.username && password === demoCredentials.customer.password) {
      return '/customer';
    }
    if (username === demoCredentials.employee.username && password === demoCredentials.employee.password) {
      return '/employee';
    }
    if (username === demoCredentials.admin.username && password === demoCredentials.admin.password) {
      return '/admin';
    }
    // Default to customer dashboard
    return '/customer';
  };

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Logged in!', { username, rememberMe });
      // Navigate to appropriate dashboard based on credentials
      navigate(getDashboardPath());
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <motion.div
        className="w-full max-w-sm relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="font-semibold text-white text-sm">Stay</span>
            </div>
            <span className="text-lg font-medium text-[#5a2ad1] lowercase">connected</span>
          </div>
        </div>

        {/* Lottie Car Animation */}
        <div className="w-64 h-64 mx-auto mb-4">
          <Lottie animationData={carAnimation} loop autoplay />
        </div>

        {/* Welcome Back Heading */}
        <h1 className="text-2xl font-bold text-[#1A093E] mb-4 text-center">
          Welcome Back!
        </h1>

        {/* Form Card */}
        <form onSubmit={handleLogin} className="space-y-3">
          {/* Username Input */}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) {
                  setErrors({ ...errors, username: undefined });
                }
              }}
              disabled={isLoading}
              className={`w-full h-12 px-4 rounded-lg bg-[#F6F6F9] border ${
                errors.username ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-gray-400`}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1 ml-1">{errors.username}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              disabled={isLoading}
              className={`w-full h-12 px-4 rounded-lg bg-[#F6F6F9] border ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-gray-400`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="rememberMe"
              className="text-xs text-[#6B6B80] cursor-pointer select-none disabled:opacity-70"
            >
              Remember password and auto login
            </label>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className={`w-full h-[52px] rounded-full bg-gradient-to-r from-[#ff3d9a] via-[#d130ce] to-[#5a2ad1] text-white font-semibold text-sm tracking-wide shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-5 ${
              isLoading ? 'cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6">
                  <Lottie animationData={carLoaderAnimation} loop autoplay />
                </div>
                <span className="text-sm font-semibold tracking-wide">Logging in…</span>
              </div>
            ) : (
              <span className="text-sm font-semibold tracking-wide">LOGIN</span>
            )}
          </motion.button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <button
            type="button"
            disabled={isLoading}
            className="text-sm text-[#7B3FE4] hover:underline transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Forgot your password?
          </button>
        </div>

        {/* Demo Credentials Section */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            disabled={isLoading}
            className="w-full text-sm text-[#7B3FE4] hover:underline transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            {showDemoCredentials ? 'Hide' : 'Show'} Demo Credentials
          </button>
          
          {showDemoCredentials && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-[#1A093E] mb-3 text-center">Quick Login to Dashboards</p>
                <div className="space-y-2">
                  <motion.button
                    type="button"
                    onClick={() => handleDemoLogin('customer')}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-4 bg-white border border-purple-300 rounded-lg text-sm font-medium text-[#7B3FE4] hover:bg-purple-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    🚗 Customer Dashboard
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleDemoLogin('employee')}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-4 bg-white border border-purple-300 rounded-lg text-sm font-medium text-[#7B3FE4] hover:bg-purple-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    🔧 Employee Dashboard
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-4 bg-white border border-purple-300 rounded-lg text-sm font-medium text-[#7B3FE4] hover:bg-purple-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    👨‍💼 Admin Dashboard
                  </motion.button>
                </div>
                <p className="text-xs text-[#6B6B80] mt-3 text-center">
                  Or use credentials manually:
                  <br />
                  <span className="font-mono text-[10px]">
                    customer@demo.com / employee@demo.com / admin@demo.com
                    <br />
                    Password: demo123
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sign Up Button */}
        <motion.button
          type="button"
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="w-full h-12 rounded-full border-2 border-[#7B3FE4] text-[#7B3FE4] bg-white font-semibold text-sm tracking-wide mt-5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          SIGN UP HERE
        </motion.button>

        {/* Loading Overlay - Subtle backdrop */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-lg z-10 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20">
                <Lottie animationData={carLoaderAnimation} loop autoplay />
              </div>
              <span className="text-sm font-medium text-gray-600">Logging in...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

