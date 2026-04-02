# PortfolioAI 🚀
> Generate a professional portfolio from your CV in 60 seconds.

---

## Stack
| Tool | Purpose | Cost |
|------|---------|------|
| Next.js + Vercel | Frontend + Hosting | Free |
| Supabase | Database | Free |
| Clerk | Auth / Login | Free |
| Stripe | Subscriptions | 2.9%/txn |
| Claude API | AI Generation | ~$5–15/mo |

**Total: ~$20/mo**

---

## Setup (Step by Step)

### 1. Clone and install
```bash
git clone <your-repo>
cd portfolioai
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** (Settings → API)
3. Go to SQL Editor → paste the contents of `supabase-schema.sql` → Run

### 3. Set up Clerk
1. Go to [clerk.com](https://clerk.com) → Create Application
2. Enable Email + Google login
3. Copy your **Publishable Key** and **Secret Key**
4. Go to JWT Templates → Add **Supabase** template (one click)

### 4. Set up Stripe
1. Go to [stripe.com](https://stripe.com) → Create account
2. Create a Product: "PortfolioAI Pro" → $9/month recurring
3. Copy the **Price ID** (starts with `price_`)
4. Go to Developers → Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
5. Copy the **Webhook Signing Secret**

### 5. Set up Anthropic
1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys
2. Create a new key → copy it

### 6. Fill in your .env.local
Copy all keys into `.env.local` (see the template file)

### 7. Run locally
```bash
npm run dev
# → http://localhost:3000
```

### 8. Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts — add all env vars when asked
```

---

## Project Structure
```
portfolioai/
├── app/
│   ├── page.js                    ← Landing + CV input form
│   ├── dashboard/page.js          ← User dashboard
│   ├── [slug]/page.js             ← Public portfolio page
│   ├── api/
│   │   ├── generate/route.js      ← AI generation + Supabase save
│   │   ├── create-checkout/route.js ← Stripe checkout
│   │   └── webhook/route.js       ← Stripe webhook (unlocks Pro)
│   ├── layout.js                  ← Root layout (ClerkProvider)
│   └── globals.css
├── lib/
│   ├── ai.js                      ← Claude prompt engine
│   ├── supabase.js                ← Database helpers
│   └── stripe.js                  ← Stripe config + plans
├── middleware.js                  ← Clerk route protection
├── supabase-schema.sql            ← Run this in Supabase first!
└── .env.local                     ← Your keys (never commit this)
```

---

## How it works
1. User visits `/` → fills in name, title, CV text
2. If not logged in → Clerk shows sign-in modal
3. After login → POST `/api/generate`
   - Claude generates portfolio JSON
   - Saved to Supabase with user's Clerk ID
4. User redirected to `/{slug}` — their live portfolio
5. Upgrade button → POST `/api/create-checkout`
   - Stripe Checkout opens
   - On payment → webhook hits `/api/webhook`
   - `is_pro = true` saved in Supabase
   - Pro features unlock immediately

---

## Monetization
| Plan | Price | MRR at 500 users |
|------|-------|-----------------|
| Pro | $9/mo | $4,500 |
| Pro+ | $19/mo | $9,500 |

Break-even: **3 paying users** (3 × $9 = $27 > $20 costs)

---

Built with PortfolioAI · portfolioai.io
