# Master DevTools - GitHub Pages Fix

## What's in This Package

```
MDT-fixes/
├── .github/
│   └── workflows/
│       └── deploy.yml           ← GitHub Actions for Pages
├── public/
│   └── favicon.svg              ← Green glowing >_ icon
├── src/
│   └── components/
│       └── layout/
│           ├── Footer.tsx       ← Lovable branding removed
│           └── Header.tsx       ← "MASTER DEVTOOLS" with glow
├── index.html                   ← Lovable branding removed, fixed paths
└── vite.config.ts               ← Correct base path for /Master-DevTools/
```

## What Was Fixed

| Issue | Fix |
|-------|-----|
| **404 on main.tsx** | Changed `src="/src/main.tsx"` to `src="./src/main.tsx"` |
| **404 on favicon** | Added `favicon.svg` with green >_ icon |
| **Wrong base path** | Changed to `/Master-DevTools/` (with hyphen) |
| **Lovable in tab** | Changed title to "Master DevTools" |
| **Lovable logo** | Replaced with green terminal icon |
| **Lovable in footer** | Changed "Lovable Cloud" to "Supabase Backend" |

## How to Apply

```bash
cd ~/path/to/Master-DevTools

# 1. Copy files from this package to your repo:
#    - .github/workflows/deploy.yml → create folders if needed
#    - public/favicon.svg → replace or add
#    - src/components/layout/Footer.tsx → replace
#    - src/components/layout/Header.tsx → replace
#    - index.html → replace (in root)
#    - vite.config.ts → replace

# 2. Commit and push
git add .
git commit -m "Fix GitHub Pages deployment, remove Lovable branding"
git push
```

## GitHub Setup Required

### 1. Add Repository Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

| Secret Name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | `https://ppgqdzoeonlwcvpozwii.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon key from .env |

### 2. Enable GitHub Pages

Go to: `Settings → Pages`

- **Source**: Select `GitHub Actions` (NOT "Deploy from a branch")

### 3. Push and Wait

After push:
1. Go to `Actions` tab
2. Watch the build
3. When ✅ green, visit: `https://nymfarious.github.io/Master-DevTools/`

## URL Support

This config works at:

| URL | Notes |
|-----|-------|
| `http://localhost:8080` | Local dev (Lovable or npm run dev) |
| `https://nymfarious.github.io/Master-DevTools/` | GitHub Pages |
| Lovable preview URLs | Auto-detected as dev mode |

## Troubleshooting

### Still seeing 404?

1. Check repo name matches base path exactly: `Master-DevTools` (hyphen, not underscore)
2. Verify GitHub Pages source is set to "GitHub Actions"
3. Check Actions tab for build errors

### Assets not loading?

1. Hard refresh: `Ctrl+Shift+R`
2. Check browser console for 404s
3. Verify vite.config.ts has correct base path

### Still seeing Lovable branding?

1. Clear browser cache
2. Verify index.html was replaced
3. Check all files were copied correctly
