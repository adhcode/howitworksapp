# Install React Native WebView

The PaystackPayment component now uses WebView to display the payment page inside the app instead of opening an external browser.

## Installation

Run this command in the `mobile` directory:

```bash
cd mobile
npx expo install react-native-webview
```

## What Changed

1. **In-App Payment**: Payment page now opens inside a WebView modal instead of external browser
2. **Amount Fix**: Removed double conversion - amount is now sent correctly (260,000 instead of 26,000,000)
3. **Better UX**: Users stay in the app during payment and see loading states

## How It Works

1. User clicks "Proceed to Payment"
2. App initializes payment with backend
3. WebView opens with Paystack payment page
4. User completes payment in the WebView
5. App detects success URL and verifies payment
6. Shows success message and closes modal

After installing, restart your Expo development server.
