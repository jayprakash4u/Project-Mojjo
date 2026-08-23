# Mojjo Admin — Unified Omnichannel Command Center

A high-performance **Next.js 16 + React 19 + TypeScript + Tailwind CSS** admin dashboard and dispatch console for **Mojjo 10-Minute Dark Stores**, unifying management across:
1. 📱 **Mojjo Mobile App** (iOS / Android React Native)
2. 💻 **Mojjo Web Storefront** (Next.js)
3. ⚙️ **Mojjo .NET Clean Architecture Backend**

---

## Key Modules & Capabilities

- **📊 Omnichannel Dashboard**: Real-time KPI cards for daily revenue (NPR), order volume, 10-min delivery ETA performance, and platform split (Mobile vs Web).
- **📦 Orders & Dispatch Console**: Live order pipeline with segmented channel filter (`All` / `Mobile App` / `Web Store`), status progression (`Pending` ➔ `Preparing` ➔ `OutForDelivery` ➔ `Delivered`), and rider dispatch.
- **🏷️ Product Catalog & Stock Manager**: Instant stock adjustment (+1/-1/+10), price/MRP manager, flash deal promotions, and channel visibility toggles (`Show on App`, `Show on Web`).
- **🚀 Delivery Zones & Dark Store Hubs**: Manage Kathmandu Valley delivery clusters (Jhamsikhel, Sanepa, Pulchowk, Baneshwor, Thamel), standard/express ETAs, surge pricing, and rider allocations.
- **🎁 Marketing & Coupons**: Coupon engine (`WELCOME100`, `MOJJO50`, `SUPER15`) with channel eligibility and redemption tracking.
- **📈 Multi-Platform Analytics**: Financial breakdown, payment method distribution (eSewa, Khalti, COD), and channel volume comparisons.

---

## Getting Started

### Development
```bash
cd "Mojjo Admin"
npm install
npm run dev
```

The admin portal runs on **`http://localhost:3001`** (avoiding port conflicts with Web Storefront on `3000`).

### Production Build
```bash
npm run build
npm run start
```
