# Account Conflict Modal

A modern, user-friendly error modal dialog for handling Firebase authentication errors when a user tries to sign in with one provider but already has an account with a different provider using the same email.

## Features

✅ **Modern Design**
- Clean, centered modal with semi-transparent dark background
- Rounded corners with calming blue accents
- Subtle shadows and gradient backgrounds
- Smooth animations and transitions

✅ **Clear Visual Communication**
- Warning icon (yellow triangle with exclamation mark)
- Friendly, non-technical explanation
- Visual representation of conflicting providers with icons
- Connecting indicators showing the conflict and resolution path

✅ **Comprehensive Information**
- Shows both the attempted and existing providers with branded icons
- Email address display
- Contextual help section explaining why the error occurred
- Collapsible technical details section
- Link to Firebase documentation

✅ **User Actions**
- Primary button: "Sign In with [Original Provider]"
- Secondary button: "Try Different Sign-In Method"
- Close button in top-right corner
- Progress indicator during account linking

✅ **Mobile Responsive**
- Adapts seamlessly to mobile and desktop layouts
- Touch-friendly button sizes
- Optimized spacing for small screens

✅ **Accessible**
- High contrast ratios (WCAG AA compliant)
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly labels

## Installation

The component is already integrated into the project. Simply import it:

```tsx
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';
```

## Basic Usage

```tsx
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';

function MyAuthComponent() {
  const [showConflict, setShowConflict] = useState(false);

  return (
    <AccountConflictModal
      isOpen={showConflict}
      onClose={() => setShowConflict(false)}
      email="user@example.com"
      existingProvider="password"
      attemptedProvider="google.com"
      onSignInWithExisting={() => {
        // Handle sign-in with existing provider
        console.log('Sign in with existing provider');
      }}
      onTryDifferentMethod={() => {
        // Handle trying a different method
        console.log('Try different method');
      }}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Called when modal should close |
| `email` | `string` | Yes | The conflicting email address |
| `existingProvider` | `Provider` | Yes | The provider the account already exists with |
| `attemptedProvider` | `Provider` | Yes | The provider the user tried to sign in with |
| `onSignInWithExisting` | `() => void` | Yes | Called when user clicks "Sign In with [Provider]" |
| `onTryDifferentMethod` | `() => void` | Yes | Called when user clicks "Try Different Sign-In Method" |
| `isLinking` | `boolean` | No | Shows loading state during account linking |

### Provider Types

```typescript
type Provider = 
  | 'google.com' 
  | 'github.com' 
  | 'password' 
  | 'facebook.com' 
  | 'twitter.com';
```

## Integration with Firebase

### Step 1: Catch the Error

```tsx
try {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
} catch (error: any) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    handleAccountConflict(error);
  }
}
```

### Step 2: Extract Information

```tsx
import { getEmailFromError, getProviderFromError } from '@/lib/auth-utils';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

const handleAccountConflict = async (error: any) => {
  const email = getEmailFromError(error);
  const signInMethods = await fetchSignInMethodsForEmail(auth, email);
  
  setConflictState({
    isOpen: true,
    email,
    existingProvider: signInMethods[0], // First method is the existing one
    attemptedProvider: error.credential?.providerId || 'google.com',
    pendingCredential: error.credential,
  });
};
```

### Step 3: Handle Sign-In

```tsx
const handleSignInWithExisting = async () => {
  // Sign in with the existing provider
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ login_hint: email });
  const result = await signInWithPopup(auth, provider);
  
  // Optionally link the new credential
  if (pendingCredential) {
    await linkWithCredential(result.user, pendingCredential);
  }
};
```

## Complete Example

See `AccountConflictModal.example.tsx` for a complete, production-ready implementation with:
- Full Firebase integration
- Automatic account linking
- Error handling
- Toast notifications
- Loading states

## Demo

To see the modal in action, visit the demo page:

```tsx
import { AccountConflictDemo } from '@/pages/AccountConflictDemo';
```

The demo page allows you to:
- Configure different provider scenarios
- Test the modal with various email addresses
- See all features in action
- View usage examples

## Design System

The modal uses the project's existing design tokens and components:

- **Colors**: Uses Tailwind CSS theme colors
- **Components**: Built on Radix UI Dialog primitives
- **Icons**: Lucide React icons
- **Typography**: Inherits from project theme
- **Spacing**: Follows consistent spacing scale

## Customization

### Styling

The modal uses Tailwind CSS classes and can be customized by:

1. Modifying the component directly
2. Using CSS custom properties for colors
3. Extending the theme in `tailwind.config.ts`

### Provider Icons

To add or modify provider icons, update the `providerConfig` object in `AccountConflictModal.tsx`:

```tsx
const providerConfig = {
  'your-provider.com': {
    name: 'Your Provider',
    icon: <YourIcon />,
    color: 'bg-your-color',
    hoverColor: 'hover:bg-your-hover-color',
  },
};
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

The modal follows WAI-ARIA best practices:

- **Dialog Role**: Uses proper dialog semantics
- **Focus Management**: Traps focus within modal
- **Keyboard Navigation**: Escape to close, Tab to navigate
- **Screen Readers**: All content is accessible
- **Color Contrast**: Meets WCAG AA standards

## Testing

To test the modal:

1. Run the demo page: Visit `/account-conflict-demo`
2. Configure different scenarios using the controls
3. Test on different screen sizes
4. Test with keyboard navigation
5. Test with screen readers

## Troubleshooting

### Modal doesn't show
- Ensure `isOpen` prop is `true`
- Check z-index conflicts
- Verify Dialog component is properly imported

### Provider icons not showing
- Check that provider type matches the `providerConfig` keys
- Verify SVG paths are correct

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts with global styles
- Verify dark mode classes if using dark mode

## License

This component is part of the project and follows the same license.

## Support

For issues, questions, or contributions, please refer to the main project documentation.
