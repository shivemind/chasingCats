# Stripe Integration Setup Guide

## Overview
This guide walks you through setting up a production-ready Stripe integration for the Chasing Cats Club subscription platform with monthly ($15/month) and annual ($150/year) payment options.

## Prerequisites
- A Stripe account (sign up at https://stripe.com)
- Vercel account for deployment
- Access to your database

---

## Step 1: Create Stripe Products and Prices

### 1.1 Login to Stripe Dashboard
Go to https://dashboard.stripe.com

### 1.2 Create Products
1. Navigate to **Products** in the left sidebar
2. Click **+ Add product**

#### Monthly Product
- **Name**: Chasing Cats Club - Monthly
- **Description**: Full access billed monthly. Cancel anytime.
- **Pricing**:
  - Model: Recurring
  - Price: $15.00 USD
  - Billing period: Monthly
- Click **Save product**
- **Copy the Price ID** (starts with `price_...`) - you'll need this for `STRIPE_MONTHLY_PRICE_ID`

#### Annual Product
- **Name**: Chasing Cats Club - Annual
- **Description**: Two months free plus a 60-minute 1:1 session.
- **Pricing**:
  - Model: Recurring
  - Price: $150.00 USD
  - Billing period: Yearly
- Click **Save product**
- **Copy the Price ID** (starts with `price_...`) - you'll need this for `STRIPE_ANNUAL_PRICE_ID`

---

## Step 2: Get Your API Keys

### 2.1 Development Keys (Testing)
1. In Stripe Dashboard, click **Developers** → **API keys**
2. In the **Standard keys** section, you'll see:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - click **Reveal test key token**
3. Copy both keys

### 2.2 Production Keys (Live)
1. Toggle from **Test mode** to **Live mode** using the switch in the top right
2. Get your live keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)
3. **IMPORTANT**: Keep these keys secure and never commit them to version control

---

## Step 3: Set Up Webhook Endpoint

### 3.1 Configure Webhook in Stripe
1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your endpoint URL:
   - **Development**: Use Stripe CLI (see below)
   - **Production**: `https://your-domain.com/api/stripe/webhook`

### 3.2 Select Events to Listen To
Add these events:
- `checkout.session.completed` - When a user completes payment
- `customer.subscription.updated` - When subscription is modified
- `customer.subscription.deleted` - When subscription is canceled
- `invoice.payment_succeeded` - When payment succeeds
- `invoice.payment_failed` - When payment fails

### 3.3 Get Webhook Secret
1. After creating the endpoint, click on it
2. Click **Reveal** under **Signing secret**
3. Copy the secret (starts with `whsec_...`)

### 3.4 Testing Webhooks Locally (Optional)
For local development:
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret from the output
```

---

## Step 4: Configure Environment Variables

### 4.1 Required Environment Variables

Add these to your `.env.local` file (for local development) and Vercel (for production):

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# Database
DATABASE_URL=your-database-connection-string

# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id

# Stripe Redirect URLs
STRIPE_SUCCESS_URL=https://your-domain.com/account?success=true
STRIPE_CANCEL_URL=https://your-domain.com/join?canceled=true

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4.2 Vercel Environment Variables Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable above with the appropriate value
4. Set the environment to **Production** (and optionally Preview/Development)
5. Click **Save**

---

## Step 5: Vercel-Specific Configuration

### 5.1 Environment Variables in Vercel Dashboard

Add these variables one by one in Vercel Settings:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Your secret (generate with `openssl rand -base64 32`) | Production, Preview |
| `DATABASE_URL` | Your production database URL | Production |
| `STRIPE_SECRET_KEY` | `sk_live_...` from Step 2.2 | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` from Step 2.2 | Production |
| `STRIPE_MONTHLY_PRICE_ID` | Monthly price ID from Step 1.2 | Production |
| `STRIPE_ANNUAL_PRICE_ID` | Annual price ID from Step 1.2 | Production |
| `STRIPE_SUCCESS_URL` | `https://your-domain.vercel.app/account?success=true` | Production |
| `STRIPE_CANCEL_URL` | `https://your-domain.vercel.app/join?canceled=true` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Step 3.3 | Production |

### 5.2 Important Notes
- Use **test keys** (`sk_test_...`, `pk_test_...`) for Preview/Development environments
- Use **live keys** (`sk_live_...`, `pk_live_...`) for Production only
- Update webhook URL in Stripe Dashboard after deploying to Vercel

---

## Step 6: Enable Stripe Customer Portal

The Customer Portal allows users to manage their subscriptions, update payment methods, and view billing history.

### 6.1 Configure Customer Portal
1. In Stripe Dashboard, go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (or **Activate live link** for production)
3. Configure settings:
   - **Business information**: Add your business name and support details
   - **Products**: Select which products customers can switch between (enable both plans)
   - **Features**:
     - ✅ Allow customers to update payment methods
     - ✅ Allow customers to switch between plans
     - ✅ Allow customers to cancel subscriptions
     - ✅ Invoice history
4. Save your settings

---

## Step 7: Test Your Integration

### 7.1 Test Mode
1. Use test card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **3D Secure**: 4000 0025 0000 3155
2. Use any future expiry date and any 3-digit CVC
3. Test the complete flow:
   - Sign up for an account
   - Subscribe to monthly plan
   - Verify webhook events are received
   - Check membership status updates in your database
   - Access the billing portal
   - Change plan from monthly to annual
   - Cancel subscription

### 7.2 Production Testing
1. Before going live, do a small real transaction test with a real card
2. Then immediately refund it from the Stripe dashboard
3. Verify all webhooks work correctly in production

---

## Step 8: Go Live Checklist

Before accepting real payments:

- [ ] Switch from test API keys to live API keys in Vercel
- [ ] Update webhook endpoint to production URL
- [ ] Configure live webhook secret
- [ ] Test with a real payment and refund
- [ ] Enable Stripe Customer Portal for live mode
- [ ] Set up email notifications for failed payments (optional)
- [ ] Configure tax settings if required
- [ ] Review and accept Stripe's terms of service
- [ ] Verify all prices are correct ($15/month, $150/year)
- [ ] Test subscription cancellation flow
- [ ] Test plan change flow (upgrade/downgrade)
- [ ] Monitor Stripe Dashboard for the first few transactions

---

## Features Included

### ✅ Subscription Management
- Monthly and annual subscription options
- Automatic recurring billing
- Proration when changing plans
- Graceful handling of failed payments

### ✅ Customer Portal Integration
- Self-service subscription management
- Payment method updates
- Billing history access
- Plan upgrades/downgrades

### ✅ Webhook Event Handling
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update plan changes
- `customer.subscription.deleted` - Handle cancellations
- `invoice.payment_succeeded` - Confirm successful payments
- `invoice.payment_failed` - Handle failed payments

### ✅ Security
- Webhook signature verification
- Server-side validation
- Secure API key management
- No client-side payment processing

---

## Troubleshooting

### Webhook Events Not Received
1. Check webhook URL is correct and accessible
2. Verify webhook signing secret matches your environment variable
3. Check Vercel function logs for errors
4. Use Stripe CLI to test webhooks locally

### Payment Fails in Test Mode
1. Verify you're using test API keys
2. Use test card numbers from Stripe documentation
3. Check Stripe Dashboard logs for detailed error messages

### Database Not Updating
1. Check webhook events in Stripe Dashboard
2. Verify database connection string is correct
3. Check Vercel function logs for database errors
4. Ensure Prisma schema is pushed to database

---

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **API Reference**: https://stripe.com/docs/api

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** (already implemented)
4. **Monitor failed payments** and retry logic
5. **Keep Stripe libraries updated** for security patches
6. **Use HTTPS only** in production
7. **Implement rate limiting** on payment endpoints (optional)
8. **Log all payment events** for audit trails

---

## Next Steps

After setup is complete:
1. Monitor the Stripe Dashboard daily for the first week
2. Set up email alerts for failed payments
3. Consider adding more subscription tiers
4. Implement usage-based billing if needed
5. Add support for gift subscriptions (optional)
6. Integrate with your email marketing platform
