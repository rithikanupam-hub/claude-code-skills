---
name: vercel-deployment
description: A comprehensive guide for reliably deploying Next.js + Supabase applications to Vercel via CLI, including handling common authentication, routing, and environment variable pitfalls.
disable-model-invocation: true
---

# Vercel Deployment Guide (Next.js + Supabase)

When deploying a Next.js (App Router) application integrated with Supabase to Vercel, a number of edge cases can cause the application to crash or behave unpredictably compared to the local environment. This skill serves as a definitive checklist and troubleshooting guide to guarantee successful and secure deployments.

## 1. Environment Variables & Build-Time Injection
Next.js SSR and the App Router strictly require certain public environment variables (e.g., `NEXT_PUBLIC_SUPABASE_URL`) to execute during the **Build Step** (when static routes and components are pre-rendered).

> [!WARNING]
> Do **NOT** pass environment variables via inline terminal `-e` flags to the `vercel --prod` command if those variables are needed for SSR or build. Vercel's CLI only injects `-e` variables into the Runtime environment, stripping them from the build phase, which will cause `npm run build` to fail when establishing Database clients.

**Correct Procedure:**
Add the environment variables to the Vercel project configuration natively BEFORE deploying.
```bash
# Add keys globally to the project configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://your_project.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "your_anon_key"
vercel env add GEMINI_API_KEY production <<< "your_secret_key"

# Once set, deploy normally
vercel --prod --yes
```

## 2. Navigating Next.js App Router Client-Side Crashes

### The "This page couldn't load" Middleware Bug
When using `middleware.ts` to protect routes (e.g. redirecting unauthenticated users from `/dashboard` to `/login`), Next.js 14/15 contains a fragile handler regarding client-side transitions.
If a user clicks a standard Next.js `<Link href="/dashboard" />`, the browser attempts to fetch an RSC `.rsc` payload. If the middleware intercepts this fetch and triggers `NextResponse.redirect()`, the Next.js router often fails to gracefully complete the redirect, triggering the generic "This page couldn't load" error boundary.

**The Fix:**
Force a hard browser navigation for auth-gated entry points. Switch the component from `<Link>` to a standard `<a>` tag.
```diff
- <Link href="/protected-route">Enter App</Link>
+ <a href="/protected-route">Enter App</a>
```
Because the `<a>` tag forces the browser to request a completely fresh HTML document, the middleware intercepts the hard request and effortlessly issues a standard `307 Redirect` to `/login`, eliminating the RSC crash state entirely.

## 3. Disabling Default SSO Deployment Restrictions
If a user hits your public `https://app-name.vercel.app` URL and is greeted by an unexpected **"Log in to Vercel"** prompt, it is due to strict **Deployment Protection** security (SSO Protection). 

**The Fix:** 
You can disable SSO Deployment Protection for the specific project via the Vercel API.
```bash
# Obtain your authorization token and trigger a PATCH request
curl -X PATCH "https://api.vercel.com/v9/projects/project_name" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection": null}'
```
This lifts the gate and allows anyone to view the deployed application.

## 4. Supabase OAuth Redirection (Avoiding localhost loops)
When deploying, OAuth sign ins (e.g., Google or GitHub) frequently redirect users back to `http://localhost:3000` because the app is attempting to use the browser's origin.

1. **Verify your Supabase Dashboard:**
   - Go to Auth -> URL Configuration.
   - Update **Site URL** to the live `https://app-name.vercel.app` domain.
   - Ensure `https://app-name.vercel.app/**` is in the **Redirect URLs** allowlist.

2. **Establish a Robust `getURL` Utility:**
   Do NOT use `window.location.origin` for the `redirectTo` parameters. It behaves unreliably when transitions bridge environments.
   Implement the standard fallback resolver:
   ```typescript
   export const getURL = () => {
     let url =
       process?.env?.NEXT_PUBLIC_SITE_URL ??
       process?.env?.NEXT_PUBLIC_VERCEL_URL ??
       'http://localhost:3000/';
     // Force https
     url = url.startsWith('http') ? url : `https://${url}`;
     // Enforce trailing slash
     url = url.endsWith('/') ? url : `${url}/`;
     return url;
   };
   
   // Usage:
   await supabase.auth.signInWithOAuth({
     provider: "google",
     options: { redirectTo: `${getURL()}auth/callback` },
   });
   ```

## 5. Middleware Graceful Degradation
Always wrap `supabase.auth.getUser()` inside a `try/catch` block in `middleware.ts`. If the edge cache delivers a corrupted auth cookie, `getUser()` will throw an exception, instantly crashing the Edge worker and returning a `500 Server Error` for the whole site.
```typescript
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("Middleware Auth Error:", err);
  }
```

By strictly adhering to these checks, you bypass the majority of severe architectural headaches when moving Next.js applications from development to edge production hosting.
