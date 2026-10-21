# JUNU Atelier • Haute Couture Website
> Creative Direction: **Roselyn Magar** • Kathmandu, Nepal • "Wear Your Power"

This project is 100% production-ready and optimized for instant, zero-configuration deployment to **Vercel**.

---

## 🚀 How to Deploy to Vercel

### Method 1: Instant Deployment via Vercel CLI (Recommended)
Open PowerShell or your terminal in this directory (`C:\xampp\htdocs\junu.clo`):

```powershell
# 1. Navigate to the project folder
cd "C:\xampp\htdocs\junu.clo"

# 2. Deploy directly with Vercel CLI
npx --yes vercel
```
- Follow the interactive prompt (press **Enter** to accept defaults).
- Vercel will immediately upload the static assets and provide your live preview URL (e.g. `https://junu-atelier.vercel.app`).
- To deploy directly to production:
```powershell
npx --yes vercel --prod
```

---

### Method 2: Deploy via GitHub (Continuous Deployment)
1. Initialize a Git repository inside this folder and commit:
```powershell
cd "C:\xampp\htdocs\junu.clo"
git init
git add .
git commit -m "feat: complete responsive JUNU haute couture atelier website"
```
2. Create a new repository on GitHub (e.g., `junu-atelier`) and push:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/junu-atelier.git
git branch -M main
git push -u origin main
```
3. In [vercel.com](https://vercel.com):
   - Click **"Add New Project"** -> **"Import Git Repository"**.
   - Select your `junu-atelier` repository.
   - Click **"Deploy"**. (Framework Preset: **Other** / Static).

---

## 💎 Features Included & Configured for Vercel

- **Vercel Routing (`vercel.json`)**: Clean URLs enabled (`/collections`, `/product`, `/statements`, `/bespoke`, `/atelier`, `/chronicles`, `/about`, `/checkout`).
- **Global Asset Caching**: Optimized cache headers for static typography, imagery, and CSS.
- **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` enabled.
- **Custom 404 Page**: Branded `404.html` error page seamlessly integrated with the luxury aesthetic.
- **100% Responsive Architecture**: Tested and verified clean across 360px mobile, 390px mobile, 768px tablet, and 1280px desktop.
- **White Mode & Nocturne Mode**: Persistent theme engine with luxury contrast.
- **Concierge Order Flow**: Interactive Shopping Bag & Wishlist with direct WhatsApp and Instagram DM checkout links.
