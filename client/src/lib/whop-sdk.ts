import { createAppIframeSDK } from "@whop-apps/sdk";

const appId = import.meta.env.VITE_WHOP_APP_ID;

if (!appId) {
  throw new Error('VITE_WHOP_APP_ID environment variable is required');
}

export const whopSdk = createAppIframeSDK({
  appId,
  onMessage: {},
});

console.log('Whop SDK initialized with appId');
console.log('SDK methods:', Object.keys(whopSdk || {}));
console.log('SDK has inAppPurchase:', typeof whopSdk?.inAppPurchase);
