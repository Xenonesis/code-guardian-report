# Neon Auth Setup Guide

This guide walks you through setting up **Neon Auth** with **GitHub OAuth** for your application.

## Overview

Neon Auth is a managed authentication service powered by Ory Kratos. It handles:

- User registration and login
- Session management
- OAuth provider integration (GitHub, Google, etc.)
- Password reset and account recovery
- Multi-factor authentication (optional)

## Prerequisites

- Neon account with a project
- GitHub account
- Your application code (this repo)

## Step-by-Step Setup

### Step 1: Enable Neon Auth in Neon Console

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project: **Code Guardian** (`red-shadow-25985809`)
3. Navigate to: **Branch** → **Auth**
4. Click **"Enable Auth"**
5. Wait for the auth service to be provisioned (usually takes 1-2 minutes)

### Step 2: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: Code Guardian
   - **Homepage URL**: `https://code-guardian-report.vercel.app` (or your domain)
   - **Authorization callback URL**:
     ```
     https://<your-neon-auth-url>/self-service/methods/oidc/callback/github
     ```
     (Replace `<your-neon-auth-url>` with the URL from Neon Console)
4. Click **"Register application"**
5. Copy the **Client ID** and **Client Secret**

### Step 3: Configure GitHub OAuth in Neon Auth

1. Back in Neon Console → Auth → **"Identity Providers"**
2. Click **"Add Provider"** → Select **"GitHub"**
3. Enter the GitHub OAuth credentials:
   - **Client ID**: From your GitHub OAuth App
   - **Client Secret**: From your GitHub OAuth App
4. Click **"Save"**

### Step 4: Get Neon Auth URL

1. In Neon Console → Auth → **"Configuration"**
2. Copy the **Auth URL** (e.g., `https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/`)
3. Add it to your `.env.local`:
   ```env
   NEON_AUTH_URL="https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/"
   ```

### Step 5: Update Environment Variables

Your `.env.local` should include:

```env
# =============================================================================
# NEON AUTH CONFIGURATION
# =============================================================================
NEON_AUTH_URL="https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/"

# Optional: Make it available on client-side
NEXT_PUBLIC_NEON_AUTH_URL="https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/"
```

### Step 6: Restart Your Application

```bash
npm run dev
```

## Using Neon Auth in Your Application

### Login Button

Use the `NeonAuthButton` component:

```tsx
import { NeonAuthButton } from "@/components/auth/NeonAuthButton";

function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <NeonAuthButton mode="login" redirectTo="/dashboard" />
    </div>
  );
}
```

### Check Authentication Status

Use the `useNeonAuth` hook:

```tsx
import { useNeonAuth } from "@/hooks/useNeonAuth";

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useNeonAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### Logout

Use the `NeonAuthStatus` component or:

```tsx
function LogoutButton() {
  const handleLogout = () => {
    const authUrl = process.env.NEON_AUTH_URL;
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `${authUrl}/self-service/logout/browser?return_to=${returnTo}`;
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Migration from NextAuth

If you're currently using NextAuth, you have two options:

### Option A: Keep NextAuth (Recommended for now)

Your current NextAuth setup works perfectly with Neon database. No changes needed.

### Option B: Migrate to Neon Auth

1. Follow the setup steps above
2. Replace `signIn("github")` calls with `NeonAuthButton`
3. Replace `useSession()` with `useNeonAuth()`
4. Remove NextAuth provider from `_app.tsx` or `layout.tsx`

## Troubleshooting

### "NEON_AUTH_URL not configured" error

Make sure you've added the `NEON_AUTH_URL` to your `.env.local` file.

### "Invalid callback URL" error

Check that your GitHub OAuth App's callback URL matches exactly:

```
https://<your-neon-auth-url>/self-service/methods/oidc/callback/github
```

### Session not persisting

Neon Auth uses cookies. Make sure your browser isn't blocking third-party cookies.

### Can't access auth configuration

You may need to be the project owner or have admin access to configure Neon Auth.

## Additional Resources

- [Neon Auth Documentation](https://neon.tech/docs/auth/quick-start)
- [Ory Kratos Documentation](https://www.ory.sh/docs/kratos)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)

## Support

If you encounter issues:

1. Check [Neon Status](https://status.neon.tech)
2. Review [Neon Auth Troubleshooting](https://neon.tech/docs/auth/troubleshooting)
3. Contact Neon support via Console
