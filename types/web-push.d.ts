declare module "web-push" {
  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface RequestOptions {
    gcmAPIKey?: string;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    timeout?: number;
    TTL?: number;
    headers?: Record<string, string>;
    contentEncoding?: string;
    urgency?: "very-low" | "low" | "normal" | "high";
    topic?: string;
  }

  export interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: RequestOptions
  ): Promise<SendResult>;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  export function encrypt(
    userPublicKey: string,
    userAuth: string,
    payload: string,
    contentEncoding?: string
  ): {
    localPublicKey: string;
    salt: string;
    cipherText: Buffer;
  };

  export function getVapidHeaders(
    audience: string,
    subject: string,
    publicKey: string,
    privateKey: string,
    contentEncoding?: string,
    expiration?: number
  ): Record<string, string>;

  export default {
    setVapidDetails,
    sendNotification,
    generateVAPIDKeys,
    encrypt,
    getVapidHeaders,
  };
}
