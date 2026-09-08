# Supabase Login & Auth — how to apply

## 1. New files — copy these in as-is

```
src/context/AuthContext.jsx          → new folder + file
src/components/auth/LoginView.jsx    → new folder + file
src/components/layout/UserMenu.jsx   → new file (goes next to Topbar.jsx/Sidebar.jsx)
```

`AuthContext.jsx` wraps Supabase's auth (sign in, sign up, sign out, password reset).
If you haven't set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` yet, it automatically
skips login entirely and drops you in as a "Demo" user — same fallback philosophy as
the rest of the app. Once you add those two env vars, real login/signup kicks in.

## 2. Small edits to existing files

### `src/main.jsx`

Wrap `<App />` with the new provider:

```jsx
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

### `src/App.jsx`

Add two imports:
```js
import LoginView from './components/auth/LoginView'
import { useAuth } from './context/AuthContext'
```

At the top of the `App` function, add:
```js
const { user, loading } = useAuth()
```

Right before your existing `return (...)` with the sidebar/topbar layout, add:
```jsx
if (loading) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas">
      <div className="w-8 h-8 border-2 border-line border-t-primary rounded-full animate-spin" />
    </div>
  )
}

if (!user) {
  return <LoginView />
}
```

### `src/components/layout/Topbar.jsx`

Add the import:
```js
import UserMenu from './UserMenu'
```

Add `<UserMenu />` at the end of the right-hand button cluster, e.g.:
```jsx
<PrimaryButton icon={Plus} onClick={onAdd}>Add New</PrimaryButton>
<div className="w-px h-6 bg-line" />
<UserMenu />
```
(the divider line is optional — just makes it feel separated from "Add New")

### `src/components/layout/Sidebar.jsx`

Add the import:
```js
import { useAuth } from '../../context/AuthContext'
```

At the top of the `Sidebar` function, add:
```js
const { user } = useAuth()
const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
const role = user?.user_metadata?.role || (user?.isDemo ? 'Demo workspace' : 'Team member')
```

Then replace the hardcoded footer:
```jsx
<Avatar name="Maria Chen" color="#0EA5A5" size={30} />
...
<p className="text-white text-sm font-medium truncate">Maria Chen</p>
<p className="text-white/40 text-xs truncate">Agency Owner</p>
```
with:
```jsx
<Avatar name={name} color="#0EA5A5" size={30} />
...
<p className="text-white text-sm font-medium truncate">{name}</p>
<p className="text-white/40 text-xs truncate">{role}</p>
```

## 3. Enabling real login (optional)

Nothing above requires Supabase to be connected — without it, you're auto-signed-in
as a demo user so the app still works out of the box.

To turn on real accounts:
1. In your Supabase project, **Authentication → Providers**, make sure Email is enabled.
2. Copy `.env.example` to `.env` and fill in your project URL + anon key (same ones
   used for the data tables).
3. Restart `npm run dev`. You'll now see the sign-in screen; "Create Account" will
   register real users via Supabase Auth, and the top-right dropdown will show
   whoever's actually signed in, with a working Sign Out.

No new database tables are needed — this uses Supabase's built-in `auth.users`,
separate from your `contacts`/`deals`/etc. tables.
