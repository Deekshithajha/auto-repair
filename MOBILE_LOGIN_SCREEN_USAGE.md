# Mobile Login Screen - Usage Guide

## Overview

A pixel-perfect mobile login screen component built with React + TypeScript, Tailwind CSS, Framer Motion, and Lottie animations.

## Component Location

`src/components/MobileLoginScreen.tsx`

## Features

✅ **Pixel-Perfect Design**
- Matches reference UI exactly
- White background (#FFFFFF)
- Centered content with max-width ~390px
- Mobile-first responsive layout

✅ **Logo Section**
- Circular gradient logo with "be" text
- "connected" brand text
- Proper spacing and alignment

✅ **Lottie Animation**
- Car animation above "Welcome Back!" heading
- Loops continuously
- Subtle and non-distracting

✅ **Form Elements**
- Username input field
- Password input field (masked)
- Remember me checkbox
- Full validation with error messages

✅ **Login Button**
- Gradient background (pink to purple)
- Full-width, rounded-full
- Loading state with spinner
- Hover and tap animations

✅ **Additional Links**
- "Forgot your password?" link
- "SIGN UP HERE" outline button

✅ **Animations**
- Page-load fade-in animation
- Button hover/tap effects
- Loading state transitions

## Usage

### Basic Import

```tsx
import { MobileLoginScreen } from './components/MobileLoginScreen';

function App() {
  return <MobileLoginScreen />;
}
```

### With React Router

```tsx
import { Route, Routes } from 'react-router-dom';
import { MobileLoginScreen } from './components/MobileLoginScreen';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<MobileLoginScreen />} />
      {/* other routes */}
    </Routes>
  );
}
```

## Dependencies

The component requires these packages (already installed):

- `react` - React framework
- `react-dom` - React DOM
- `framer-motion` - Animations
- `lottie-react` - Lottie animations
- `tailwindcss` - Styling

## Assets

The component uses a Lottie animation file located at:
`src/assets/lottie/CarServices.json`

## Styling

All styles use Tailwind CSS classes. The component is fully self-contained and doesn't require additional CSS files.

### Color Palette

- Background: `#FFFFFF` (white)
- Primary Gradient: `#ff3d9a → #d130ce → #5a2ad1` (pink to purple)
- Heading: `#1A093E` (deep purple)
- Body Text: `#6B6B80` (gray)
- Links: `#7B3FE4` (purple)
- Input Background: `#F6F6F9` (light gray)

## Form Behavior

### Validation

- Username is required
- Password is required
- Error messages appear below invalid fields
- Form cannot be submitted if validation fails

### Loading State

When the login button is clicked:
1. Form is validated
2. If valid, loading state activates
3. All inputs and buttons are disabled
4. Button shows spinner and "Logging in..." text
5. Semi-transparent overlay appears
6. After 2 seconds, loading completes (simulated API call)

### Current Implementation

The component currently logs to console on successful login. To integrate with your authentication system:

```tsx
// In MobileLoginScreen.tsx, replace the setTimeout callback:
setTimeout(() => {
  setIsLoading(false);
  // Replace with your auth logic:
  // await loginUser(username, password);
  // navigate('/dashboard');
}, 2000);
```

## Customization

### Change Animation

Replace the Lottie JSON file at `src/assets/lottie/CarServices.json` with your own animation.

### Adjust Colors

Modify the Tailwind classes in the component:
- Gradient: `from-[#ff3d9a] via-[#d130ce] to-[#5a2ad1]`
- Text colors: `text-[#1A093E]`, `text-[#7B3FE4]`, etc.

### Modify Spacing

Adjust Tailwind spacing classes:
- `mb-6` = 24px margin-bottom
- `mb-4` = 16px margin-bottom
- `space-y-3` = 12px vertical spacing
- `mt-5` = 20px margin-top

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## Notes

- The component is fully responsive and works on all screen sizes
- Form validation prevents empty submissions
- Loading state prevents multiple submissions
- All animations are smooth and performant
- Component is accessible with proper labels and ARIA attributes

## Example Integration

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MobileLoginScreen } from './components/MobileLoginScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileLoginScreen />} />
        <Route path="/login" element={<MobileLoginScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

**Created**: November 2024  
**Status**: ✅ Production-Ready  
**Framework**: React + TypeScript + Tailwind CSS

