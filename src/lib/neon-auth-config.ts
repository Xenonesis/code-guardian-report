/**
 * Neon Auth Configuration
 *
 * To enable Neon Auth with GitHub OAuth:
 *
 * 1. Go to Neon Console: https://console.neon.tech
 * 2. Navigate to: Project → Branch → Auth
 * 3. Click "Enable Auth"
 * 4. Configure GitHub OAuth provider:
 *    - Go to GitHub Settings → Developer settings → OAuth Apps
 *    - Create new OAuth App
 *    - Authorization callback URL: https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/self-service/methods/oidc/callback/github
 * 5. Copy Client ID and Client Secret to Neon Auth settings
 * 6. Copy the Auth URL from Neon Console and add to .env.local
 */

export const neonAuthConfig = {
  // Get this from Neon Console → Project → Branch → Auth → Configuration
  authUrl: process.env.NEON_AUTH_URL || "",

  // OAuth providers configured in Neon Auth
  providers: {
    github: {
      enabled: true,
      name: "GitHub",
    },
  },

  // Callback URLs for your application
  callbacks: {
    // After successful login, redirect to this URL
    afterLogin: "/dashboard",
    // After logout, redirect to this URL
    afterLogout: "/",
  },
};

// Validate configuration
export function validateNeonAuthConfig(): boolean {
  if (!neonAuthConfig.authUrl) {
    console.warn("NEON_AUTH_URL not configured. Neon Auth is disabled.");
    return false;
  }
  return true;
}
