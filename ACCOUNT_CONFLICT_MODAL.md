# Account Conflict Modal - Complete Documentation

## Overview

A modern, user-friendly error modal dialog component for handling Firebase authentication errors when a user attempts to sign in with one provider (e.g., Google) but already has an account with a different provider (e.g., Email/Password) using the same email address.

## 🎯 Problem Statement

Firebase throws an `auth/account-exists-with-different-credential` error when:
1. User creates an account with one sign-in method (e.g., Email/Password)
2. User later tries to sign in with a different method (e.g., Google) using the same email
3. Firebase prevents duplicate accounts for security reasons

This modal provides a clear, user-friendly way to handle this situation.

## ✨ Features

### Design & UX
- ✅ **Modern, Clean Design**: Rounded corners, calming blue accents, white background
- ✅ **Semi-transparent Dark Background**: Modal overlay with backdrop blur
- ✅ **Warning Icon**: Yellow triangle with exclamation mark for clear visual communication
- ✅ **Clear Title**: "Account Already Exists" header
- ✅ **Friendly Explanation**: Non-technical language explaining the situation
- ✅ **Visual Provider Representation**: Icons for Google, GitHub, Email/Password, Facebook, Twitter
- ✅ **Conflict Visualization**: Connecting lines and arrows showing the conflict and resolution

### Functionality
- ✅ **Primary Action Button**: "Sign In with [Original Provider]" (dynamic based on existing provider)
- ✅ **Secondary Action Button**: "Try Different Sign-In Method"
- ✅ **Close Button**: Top-right corner X button
- ✅ **Progress Indicator**: Loading state during account linking process
- ✅ **Technical Details**: Collapsible section with error code and provider information
- ✅ **Help Documentation Link**: Links to Firebase account linking docs
- ✅ **Why This Happened Section**: Explains security reasoning

### Responsive & Accessible
- ✅ **Mobile Responsive**: Adapts to all screen sizes
- ✅ **Accessible Contrast Ratios**: WCAG AA compliant
- ✅ **Semantic HTML**: Proper heading hierarchy and ARIA labels
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Dark Mode Support**: Looks great in both light and dark themes

## 📦 Installation

The component is already integrated into the project. No additional installation needed.

## 🚀 Quick Start

### Basic Usage

```tsx
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';
import { useState } from 'react';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AccountConflictModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      email="user@example.com"
      existingProvider="password"
      attemptedProvider="google.com"
      onSignInWithExisting={() => {
        // Handle sign-in with existing provider
        console.log('Signing in with existing provider');
      }}
      onTryDifferentMethod={() => {
        // Handle trying different method
        console.log('User wants to try different method');
      }}
    />
  );
}
```

### Integration with Firebase Authentication

```tsx
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';
import { getEmailFromError } from '@/lib/auth-utils';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      // Extract error information
      const email = getEmailFromError(error);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      // Show the conflict modal
      setConflictState({
        isOpen: true,
        email,
        existingProvider: signInMethods[0], // 'password', 'google.com', etc.
        attemptedProvider: 'google.com',
        pendingCredential: error.credential,
      });
    }
  }
};
```

## 📋 Props API

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Controls modal visibility |
| `onClose` | `() => void` | ✅ | - | Callback when modal should close |
| `email` | `string` | ✅ | - | The conflicting email address |
| `existingProvider` | `Provider` | ✅ | - | Provider the account exists with |
| `attemptedProvider` | `Provider` | ✅ | - | Provider user tried to use |
| `onSignInWithExisting` | `() => void` | ✅ | - | Callback for signing in with existing provider |
| `onTryDifferentMethod` | `() => void` | ✅ | - | Callback for trying different method |
| `isLinking` | `boolean` | ❌ | `false` | Shows loading state during linking |

### Provider Type

```typescript
type Provider = 
  | 'google.com' 
  | 'github.com' 
  | 'password' 
  | 'facebook.com' 
  | 'twitter.com';
```

## 🎨 Visual Design

### Color Scheme
- **Primary**: Blue accents (#3B82F6)
- **Warning**: Amber/Orange for warning states (#F59E0B)
- **Success**: Green for existing provider (#10B981)
- **Error**: Red for conflicts (#EF4444)
- **Background**: White/Gray-900 (dark mode)
- **Text**: Gray-900/Gray-100 (dark mode)

### Layout Structure
```
┌─────────────────────────────────────────────┐
│  [⚠️] Account Already Exists           [X]  │
│  Friendly explanation text...               │
├─────────────────────────────────────────────┤
│  ┌───────────┐   [X]   ┌───────────┐       │
│  │  Google   │   ──>   │ Email/Pwd │       │
│  │ Attempted │         │ Use This  │       │
│  └───────────┘         └───────────┘       │
│                                             │
│  [?] Why is this happening?                 │
│  Security explanation...                    │
│                                             │
│  ▼ Technical Details                        │
│                                             │
│  Learn more about account linking ↗         │
├─────────────────────────────────────────────┤
│  [Try Different]  [Sign In with Email/Pwd]  │
└─────────────────────────────────────────────┘
```

## 🔧 Customization

### Adding New Providers

To add support for additional OAuth providers, update the `providerConfig` in `AccountConflictModal.tsx`:

```tsx
const providerConfig = {
  'your-provider.com': {
    name: 'Your Provider',
    icon: <YourCustomIcon className="w-6 h-6" />,
    color: 'bg-your-brand-color',
    hoverColor: 'hover:bg-your-brand-color-dark',
  },
};
```

### Styling Modifications

The component uses Tailwind CSS. To customize:

1. **Colors**: Modify the color classes in the component
2. **Spacing**: Adjust padding and margin classes
3. **Typography**: Change text size and weight classes
4. **Shadows**: Modify shadow utilities

## 📱 Demo Page

Access the interactive demo at: **Account Conflict Demo** (navigate via sidebar or URL)

The demo page includes:
- ✅ Interactive configuration controls
- ✅ All provider combinations
- ✅ Email address customization
- ✅ Live preview of modal behavior
- ✅ Feature highlights
- ✅ Usage examples

To access programmatically:
```tsx
import { useNavigation } from '@/lib/navigation-context';

const { navigateTo } = useNavigation();
navigateTo('account-conflict-demo');
```

## 📚 Complete Examples

See these files for complete, production-ready examples:

1. **`AccountConflictModal.example.tsx`** - Full Firebase integration with account linking
2. **`AccountConflictDemo.tsx`** - Interactive demo page
3. **`src/components/auth/README.md`** - Detailed component documentation

## 🧪 Testing

### Manual Testing Checklist

- [ ] Modal opens when `isOpen` is true
- [ ] Modal closes when clicking X button
- [ ] Modal closes when clicking backdrop
- [ ] Provider icons display correctly
- [ ] Email address displays correctly
- [ ] Primary button shows correct provider name
- [ ] Loading state shows when `isLinking` is true
- [ ] Technical details expand/collapse
- [ ] Help link opens in new tab
- [ ] Responsive on mobile devices
- [ ] Dark mode works correctly
- [ ] Keyboard navigation works (Tab, Escape)
- [ ] Screen reader announcements work

### Test Scenarios

```typescript
// Scenario 1: Google attempt with Email/Password existing
<AccountConflictModal
  email="test@example.com"
  existingProvider="password"
  attemptedProvider="google.com"
  // ... other props
/>

// Scenario 2: Email/Password attempt with Google existing
<AccountConflictModal
  email="test@example.com"
  existingProvider="google.com"
  attemptedProvider="password"
  // ... other props
/>

// Scenario 3: GitHub attempt with Google existing
<AccountConflictModal
  email="test@example.com"
  existingProvider="google.com"
  attemptedProvider="github.com"
  // ... other props
/>
```

## 🐛 Troubleshooting

### Modal doesn't appear
- Verify `isOpen={true}`
- Check z-index conflicts with other modals
- Ensure Dialog component is properly imported

### Provider icons not showing
- Verify provider type matches `providerConfig` keys exactly
- Check console for SVG rendering errors
- Ensure Lucide React icons are installed

### Styling issues
- Clear browser cache
- Verify Tailwind CSS is processing the component
- Check for CSS conflicts in global styles
- Ensure dark mode classes are applied to root element

### Firebase integration issues
- Verify Firebase Auth is initialized
- Check that error object has required fields
- Ensure `fetchSignInMethodsForEmail` is available
- Verify API keys are configured correctly

## 🔐 Security Considerations

1. **Never store sensitive data in modal state**
2. **Always validate email addresses server-side**
3. **Use HTTPS for all authentication requests**
4. **Implement rate limiting for sign-in attempts**
5. **Follow Firebase security best practices**
6. **Don't expose internal error details to users**

## 📖 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Account Linking Guide](https://firebase.google.com/docs/auth/web/account-linking)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

To contribute improvements:

1. Test your changes thoroughly
2. Update documentation
3. Follow existing code style
4. Add comments for complex logic
5. Update README if adding features

## 📄 License

This component is part of the Code Guardian project and follows the same license.

## 👥 Support

For questions or issues:
- Check the demo page for examples
- Review the example integration file
- Read the component README
- Contact the development team

---

**Created**: January 2025
**Last Updated**: January 2025
**Version**: 1.0.0
