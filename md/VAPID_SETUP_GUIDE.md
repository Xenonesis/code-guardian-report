# VAPID Keys Setup Guide

## 🔑 What are VAPID Keys?

VAPID (Voluntary Application Server Identification) keys are used to identify your application server when sending push notifications. They consist of:

- **Public Key**: Used by the browser to verify your server's identity
- **Private Key**: Used by your server to sign push notification requests

## 📋 Step 1: Generate VAPID Keys

### Option A: Using web-push CLI (Recommended)

1. Install web-push globally:
```bash
npm install -g web-push
```

2. Generate your keys:
```bash
web-push generate-vapid-keys
```

3. You'll get output like this:
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI

Private Key:
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIK2b4bVx7dEr8C9zjlmzQF2b4bVx7dEr8C9zjlmzQF2boAoGCCqGSM49
AwEHoUQDQgAEQEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqI
UHI80NqIUHI80NqIUHI80NqI
-----END EC PRIVATE KEY-----

=======================================
```

### Option B: Using Node.js Script

Create a file `generate-vapid.js`:
```javascript
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(50));
console.log('VAPID Keys Generated:');
console.log('='.repeat(50));
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);
console.log('='.repeat(50));
```

Run it:
```bash
npm install web-push
node generate-vapid.js
```

### Option C: Online Generator

Use online tools (less secure for production):
- https://vapidkeys.com/
- https://web-push-codelab.glitch.me/

## 🔧 Step 2: Update Environment Variables

### Development Environment

Your `.env.local` file has been updated with the VAPID configuration:

```env
# PWA Push Notifications - VAPID Keys
VITE_VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqI"

# Server-side VAPID configuration (for your backend API)
VAPID_PRIVATE_KEY="your_private_key_here"
VAPID_EMAIL="mailto:your-email@example.com"
```

**⚠️ Important**: Replace the example keys with your actual generated keys!

### Production Environment

For production deployment, set these environment variables:

#### Vercel
```bash
vercel env add VITE_VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
vercel env add VAPID_EMAIL
```

#### Netlify
```bash
netlify env:set VITE_VAPID_PUBLIC_KEY "your_public_key"
netlify env:set VAPID_PRIVATE_KEY "your_private_key"
netlify env:set VAPID_EMAIL "mailto:your-email@example.com"
```

#### Railway
```bash
railway variables set VITE_VAPID_PUBLIC_KEY="your_public_key"
railway variables set VAPID_PRIVATE_KEY="your_private_key"
railway variables set VAPID_EMAIL="mailto:your-email@example.com"
```

#### Docker
```dockerfile
ENV VITE_VAPID_PUBLIC_KEY="your_public_key"
ENV VAPID_PRIVATE_KEY="your_private_key"
ENV VAPID_EMAIL="mailto:your-email@example.com"
```

#### Traditional Server
```bash
export VITE_VAPID_PUBLIC_KEY="your_public_key"
export VAPID_PRIVATE_KEY="your_private_key"
export VAPID_EMAIL="mailto:your-email@example.com"
```

## 🖥️ Step 3: Server-Side Implementation

Create your push notification server endpoints using the private key:

### Node.js/Express Example

```javascript
const webpush = require('web-push');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VITE_VAPID_PUBLIC_KEY, // Public key
  process.env.VAPID_PRIVATE_KEY      // Private key
);

// Subscribe endpoint
app.post('/api/push/subscribe', async (req, res) => {
  const { subscription } = req.body;
  
  // Store subscription in your database
  await saveSubscription(subscription);
  
  res.json({ success: true });
});

// Send notification endpoint
app.post('/api/push/send', async (req, res) => {
  const { subscription, payload } = req.body;
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.json({ success: true });
  } catch (error) {
    console.error('Push notification failed:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
```

### Python/Flask Example

```python
from pywebpush import webpush, WebPushException
import os
import json

VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY')
VAPID_PUBLIC_KEY = os.environ.get('VITE_VAPID_PUBLIC_KEY')
VAPID_EMAIL = os.environ.get('VAPID_EMAIL')

@app.route('/api/push/send', methods=['POST'])
def send_push():
    data = request.get_json()
    subscription = data['subscription']
    payload = data['payload']
    
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": VAPID_EMAIL
            }
        )
        return jsonify({"success": True})
    except WebPushException as ex:
        return jsonify({"error": str(ex)}), 500
```

## 🔒 Security Best Practices

### 1. Keep Private Keys Secret
- ❌ Never commit private keys to version control
- ❌ Never expose private keys in client-side code
- ✅ Use environment variables
- ✅ Use secure secret management services

### 2. Environment Variable Security
```bash
# Good - Use quotes to prevent shell interpretation
VAPID_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----..."

# Bad - Unquoted values can cause issues
VAPID_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----...
```

### 3. Key Rotation
- Generate new keys periodically
- Update all environments simultaneously
- Test thoroughly after key rotation

## 🧪 Step 4: Testing Your Setup

### Test VAPID Key Configuration

Create a test script:

```javascript
// test-vapid.js
const webpush = require('web-push');

const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const email = process.env.VAPID_EMAIL;

if (!publicKey || !privateKey || !email) {
  console.error('❌ Missing VAPID environment variables');
  process.exit(1);
}

webpush.setVapidDetails(email, publicKey, privateKey);

console.log('✅ VAPID keys configured successfully');
console.log('Public Key:', publicKey.substring(0, 20) + '...');
console.log('Email:', email);
```

Run the test:
```bash
node test-vapid.js
```

### Test Push Notifications

1. Open your PWA in a browser
2. Enable notifications when prompted
3. Use your app's test notification feature
4. Check browser developer tools for any errors

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid VAPID key" error**
   - Verify your public key is correctly formatted
   - Ensure no extra spaces or line breaks

2. **"Unauthorized" error**
   - Check that private key matches public key
   - Verify VAPID email is set correctly

3. **Environment variables not loading**
   - Restart your development server
   - Check file naming (`.env.local` not `.env`)
   - Verify variable names start with `VITE_` for client-side

### Debug Commands

```bash
# Check if environment variables are loaded
echo $VITE_VAPID_PUBLIC_KEY

# Verify key format
node -e "console.log(process.env.VITE_VAPID_PUBLIC_KEY?.length)"
```

## ✅ Verification Checklist

- [ ] Generated VAPID keys using web-push
- [ ] Updated `.env.local` with actual keys (not examples)
- [ ] Set production environment variables
- [ ] Implemented server-side push endpoints
- [ ] Tested notification subscription
- [ ] Tested sending notifications
- [ ] Verified keys are not in version control
- [ ] Configured HTTPS (required for push notifications)

## 📚 Additional Resources

- [Web Push Protocol RFC](https://tools.ietf.org/html/rfc8030)
- [MDN Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Google Web Push Guide](https://developers.google.com/web/fundamentals/push-notifications)
- [web-push Library Documentation](https://github.com/web-push-libs/web-push)

Your VAPID keys are now configured and ready for production use! 🚀