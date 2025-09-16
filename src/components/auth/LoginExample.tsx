import React, { useState } from 'react';
import Login from './Login';

/**
 * Refined Auto-repair Login Component Usage Example
 * 
 * This example demonstrates how to use the sophisticated Login component
 * with theme switching and proper event handling.
 */

const LoginExample: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'red' | 'blue'>('blue');

  // Handle login form submission
  const handleLogin = (credentials: { 
    email: string; 
    password: string; 
    rememberMe: boolean 
  }) => {
    console.log('Login credentials:', credentials);
    
    // Example: Send to your authentication service
    // await authService.login(credentials.email, credentials.password);
    
    // Example: Handle remember me functionality
    if (credentials.rememberMe) {
      localStorage.setItem('rememberedEmail', credentials.email);
    }
    
    // Example: Redirect to dashboard
    // navigate('/dashboard');
  };

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'red' ? 'blue' : 'red');
  };

  return (
    <div className="min-h-screen">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            currentTheme === 'red' 
              ? 'bg-auto-red-600 text-auto-blue-200 hover:bg-auto-red-700' 
              : 'bg-auto-blue-600 text-auto-red-200 hover:bg-auto-blue-700'
          }`}
        >
          Switch to {currentTheme === 'red' ? 'Blue' : 'Red'} Theme
        </button>
      </div>

      {/* Login Component */}
      <Login 
        onSubmit={handleLogin} 
        theme={currentTheme}
      />
    </div>
  );
};

export default LoginExample;

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import the component:
 *    import Login from '@/components/auth/Login';
 * 
 * 2. Basic usage with blue theme (default):
 *    <Login onSubmit={handleLogin} />
 * 
 * 3. Red-dominant theme:
 *    <Login onSubmit={handleLogin} theme="red" />
 * 
 * 4. Blue-dominant theme:
 *    <Login onSubmit={handleLogin} theme="blue" />
 * 
 * 5. Handle the onSubmit callback:
 *    const handleLogin = (credentials) => {
 *      // credentials.email
 *      // credentials.password  
 *      // credentials.rememberMe
 *    }
 * 
 * THEME CUSTOMIZATION:
 * 
 * The component supports two theme variants:
 * 
 * 1. Red-dominant theme (theme="red"):
 *    - Primary colors: auto-red-600, auto-red-900
 *    - Accent colors: auto-blue-600, auto-blue-400
 *    - Background: auto-red-200
 *    - Card: auto-red-200 with blue accents
 * 
 * 2. Blue-dominant theme (theme="blue"):
 *    - Primary colors: auto-blue-600, auto-blue-900
 *    - Accent colors: auto-red-600, auto-red-400
 *    - Background: auto-blue-200
 *    - Card: auto-blue-200 with red accents
 * 
 * DESIGN FEATURES:
 * 
 * ✅ Asymmetrical layout with sculpted background panels
 * ✅ Floating login card with layered shadows
 * ✅ Sophisticated mascot with gentle animations
 * ✅ Patterned background using SVG icons
 * ✅ Refined micro-interactions
 * ✅ Generous negative space and intentional composition
 * ✅ No gradients - only solid fills and semi-transparent overlays
 * 
 * ACCESSIBILITY FEATURES:
 * 
 * ✅ WCAG AA compliant color contrast
 * ✅ Keyboard navigation support
 * ✅ Screen reader friendly
 * ✅ Focus indicators using token colors
 * ✅ Reduced motion support
 * ✅ High contrast mode support
 * 
 * RESPONSIVE DESIGN:
 * 
 * ✅ Mobile-first approach
 * ✅ Side-by-side layout on desktop
 * ✅ Stacked layout on mobile
 * ✅ Touch-friendly interactions
 * ✅ Adaptive sculpted shapes
 * 
 * ANIMATIONS:
 * 
 * ✅ Respects prefers-reduced-motion
 * ✅ Gentle micro-interactions (120ms bounce)
 * ✅ Mascot bob animation (500ms loop)
 * ✅ Floating decorative elements
 * ✅ Button hover effects with scale
 * 
 * SVG ASSETS:
 * 
 * The component includes:
 * - Mascot SVG (inline for performance)
 * - Pattern icons (wrench, tire, key, spark plug)
 * - Sculpted background shapes
 * - Decorative floating elements
 * 
 * All SVGs use only red and blue color tokens.
 */
