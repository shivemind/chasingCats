# Vercel Environment Variables - Quick Reference

## Production Environment Variables

Copy and paste these into Vercel Settings → Environment Variables (set to **Production**):

### Authentication
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### Database
```
DATABASE_URL=<your-production-postgres-connection-string>
```

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_live_<your-live-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-live-publishable-key>
STRIPE_MONTHLY_PRICE_ID=price_<your-monthly-price-id>
STRIPE_ANNUAL_PRICE_ID=price_<your-annual-price-id>
STRIPE_SUCCESS_URL=https://your-domain.vercel.app/account?success=true
STRIPE_CANCEL_URL=https://your-domain.vercel.app/join?canceled=true
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-signing-secret>
```

---

## Preview/Development Environment Variables

Use **test** Stripe keys for non-production environments:

```
STRIPE_SECRET_KEY=sk_test_<your-test-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-test-publishable-key>
STRIPE_MONTHLY_PRICE_ID=price_<your-test-monthly-price-id>
STRIPE_ANNUAL_PRICE_ID=price_<your-test-annual-price-id>
STRIPE_WEBHOOK_SECRET=whsec_<your-test-webhook-secret>
```

---

## How to Add in Vercel

1. Go to your project in Vercel
2. Click **Settings**
3. Click **Environment Variables** in the sidebar
4. For each variable:
   - Enter the **Key** (variable name)
   - Enter the **Value**
   - Select **Production** (or Preview/Development as needed)
   - Click **Save**

---

## Required Secrets to Obtain

### From Stripe Dashboard (https://dashboard.stripe.com)

#### API Keys
- **Location**: Developers → API keys
- Get both:
  - Secret key (`sk_live_...` or `sk_test_...`)
  - Publishable key (`pk_live_...` or `pk_test_...`)

#### Price IDs
- **Location**: Products
- Create two products:
  1. Monthly ($15/month) - Copy price ID
  2. Annual ($150/year) - Copy price ID

#### Webhook Secret
- **Location**: Developers → Webhooks
- Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
- Select events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copy the signing secret (`whsec_...`)

### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

---

## Verification Checklist

After adding all variables:

- [ ] All 10 environment variables are set
- [ ] Production uses `sk_live_` and `pk_live_` keys
- [ ] Preview/Dev uses `sk_test_` and `pk_test_` keys
- [ ] URLs match your actual domain
- [ ] Webhook secret matches the endpoint you created
- [ ] Price IDs match the products you created in Stripe
- [ ] NEXTAUTH_SECRET is a random 32-byte string
- [ ] DATABASE_URL points to your production database

---

## Test Your Configuration

After deployment:

1. Visit your site at `https://your-domain.vercel.app`
2. Try to subscribe to a plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check that:
   - Payment goes through
   - You're redirected to account page
   - Membership status shows as ACTIVE
   - You can access the billing portal

---

## Important Notes

⚠️ **Security**
- Never commit these values to GitHub
- Use different keys for test and production
- Rotate keys if they're ever exposed

⚠️ **URLs**
- Update `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL` to match your domain
- Update webhook URL in Stripe Dashboard after deployment

⚠️ **Webhooks**
- Test webhooks using Stripe CLI locally
- Verify webhook events are received in production
- Check Vercel function logs if webhooks aren't working
