# Cookbook: Authentication

Add login, registration, protected routes, and token management to a Decantr app.

## Auth State

Create a shared auth module at `src/auth.js` that manages authentication state across the app:

```js
import { createSignal, createEffect, createMemo } from 'decantr/state';
import { createPersisted } from 'decantr/data';
import { navigate } from 'decantr/router';

// Persist the auth token across page reloads
const [token, setToken] = createPersisted('auth-token', null);
const [user, setUser] = createSignal(null);
const [loading, setLoading] = createSignal(false);

const isLoggedIn = createMemo(() => !!token());

// Fetch user profile when token changes
createEffect(() => {
  const t = token();
  if (!t) {
    setUser(null);
    return;
  }
  setLoading(true);
  fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${t}` }
  })
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Unauthorized')))
    .then(data => setUser(data))
    .catch(() => { setToken(null); setUser(null); })
    .finally(() => setLoading(false));
});

// Login
async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  setToken(data.token);
  return data;
}

// Register
async function register(name, email, password) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Registration failed');
  }
  const data = await res.json();
  setToken(data.token);
  return data;
}

// Logout
function logout() {
  setToken(null);
  setUser(null);
  navigate('/login');
}

export { token, user, isLoggedIn, loading, login, register, logout };
```

## Protected Routes with Guards

In `src/app.js`, use `beforeEach` to guard routes that require authentication:

```js
import { mount } from 'decantr/core';
import { createRouter } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';
import { isLoggedIn } from './auth.js';

setStyle('clean');
setMode('light');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js'), meta: { title: 'Home' } },
    { path: '/login', component: () => import('./pages/login.js'), meta: { title: 'Login', public: true } },
    { path: '/register', component: () => import('./pages/register.js'), meta: { title: 'Register', public: true } },
    { path: '/dashboard', component: () => import('./pages/dashboard.js'), meta: { title: 'Dashboard', requiresAuth: true } },
    { path: '/settings', component: () => import('./pages/settings.js'), meta: { title: 'Settings', requiresAuth: true } },
    { path: '/:404', component: () => import('./pages/not-found.js') },
  ],
  beforeEach: (to) => {
    if (to.meta.requiresAuth && !isLoggedIn()) return '/login';
    if ((to.path === '/login' || to.path === '/register') && isLoggedIn()) return '/dashboard';
  },
  afterEach: (to) => {
    document.title = to.meta.title || 'My App';
  }
});

mount(document.getElementById('app'), () => router.outlet());
```

## Login Page

`src/pages/login.js`:

```js
import { tags } from 'decantr/tags';
import { text, cond } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { link, navigate } from 'decantr/router';
import { css } from 'decantr/css';
import { Button, Input, Card, Alert } from 'decantr/components';
import { login } from '../auth.js';

const { div, h2, p, span } = tags;

export default function LoginPage() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal(null);
  const [submitting, setSubmitting] = createSignal(false);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email(), password());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return div({ class: css('_flex _aic _jcc _minhscreen _p6 _bgmuted') },
    Card({ class: css('_w[400px] _mw[100%]') },
      Card.Header({},
        h2({ class: css('_heading4 _tc') }, 'Sign In'),
        p({ class: css('_fgmuted _tc _mt1') }, 'Enter your credentials to continue')
      ),
      Card.Body({ class: css('_flex _col _gap3') },
        cond(() => error(), () =>
          Alert({ variant: 'error' }, text(() => error()))
        ),
        Input({
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
          value: email,
          oninput: (e) => setEmail(e.target.value)
        }),
        Input({
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
          value: password,
          oninput: (e) => setPassword(e.target.value)
        }),
        Button({
          variant: 'primary',
          class: css('_wfull _mt2'),
          loading: submitting(),
          onclick: handleSubmit
        }, 'Sign In')
      ),
      Card.Footer({ class: css('_tc') },
        span({ class: css('_fgmuted _textsm') },
          'No account? ',
          link({ href: '/register', class: css('_fgprimary') }, 'Create one')
        )
      )
    )
  );
}
```

## Registration Page

`src/pages/register.js`:

```js
import { tags } from 'decantr/tags';
import { text, cond } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { link, navigate } from 'decantr/router';
import { css } from 'decantr/css';
import { Button, Input, Card, Alert } from 'decantr/components';
import { register } from '../auth.js';

const { div, h2, p, span } = tags;

export default function RegisterPage() {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirm, setConfirm] = createSignal('');
  const [error, setError] = createSignal(null);
  const [submitting, setSubmitting] = createSignal(false);

  const handleSubmit = async () => {
    setError(null);
    if (password() !== confirm()) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register(name(), email(), password());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return div({ class: css('_flex _aic _jcc _minhscreen _p6 _bgmuted') },
    Card({ class: css('_w[440px] _mw[100%]') },
      Card.Header({},
        h2({ class: css('_heading4 _tc') }, 'Create Account'),
        p({ class: css('_fgmuted _tc _mt1') }, 'Fill in your details to get started')
      ),
      Card.Body({ class: css('_flex _col _gap3') },
        cond(() => error(), () =>
          Alert({ variant: 'error' }, text(() => error()))
        ),
        Input({ label: 'Name', placeholder: 'Your full name', value: name, oninput: (e) => setName(e.target.value) }),
        Input({ label: 'Email', type: 'email', placeholder: 'you@example.com', value: email, oninput: (e) => setEmail(e.target.value) }),
        Input({ label: 'Password', type: 'password', placeholder: 'At least 8 characters', value: password, oninput: (e) => setPassword(e.target.value) }),
        Input({ label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password', value: confirm, oninput: (e) => setConfirm(e.target.value) }),
        Button({ variant: 'primary', class: css('_wfull _mt2'), loading: submitting(), onclick: handleSubmit }, 'Create Account')
      ),
      Card.Footer({ class: css('_tc') },
        span({ class: css('_fgmuted _textsm') },
          'Already have an account? ',
          link({ href: '/login', class: css('_fgprimary') }, 'Sign in')
        )
      )
    )
  );
}
```

## Auth-Aware Header

Show different content based on login state:

```js
import { tags } from 'decantr/tags';
import { cond } from 'decantr/core';
import { link } from 'decantr/router';
import { css } from 'decantr/css';
import { Button, Avatar, Dropdown } from 'decantr/components';
import { user, isLoggedIn, logout } from '../auth.js';

const { header, nav, div } = tags;

export function AppHeader() {
  return header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB _bgbg') },
    link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'My App'),

    nav({ class: css('_flex _aic _gap4') },
      cond(() => isLoggedIn(),
        // Logged in — show user menu
        () => Dropdown({
          trigger: Avatar({ name: user()?.name || '', size: 'sm' }),
          items: [
            { label: 'Settings', onclick: () => navigate('/settings') },
            { label: 'Logout', onclick: logout },
          ]
        }),
        // Logged out — show login/register links
        () => div({ class: css('_flex _gap2') },
          Button({ variant: 'ghost', onclick: () => navigate('/login') }, 'Sign In'),
          Button({ variant: 'primary', onclick: () => navigate('/register') }, 'Get Started')
        )
      )
    )
  );
}
```

## Token Auto-Refresh

Add a middleware to the query client that attaches the auth token to every request and handles token expiry:

```js
import { queryClient } from 'decantr/data';
import { token, logout } from './auth.js';

queryClient.use(async (ctx, next) => {
  // Attach auth header
  const t = token();
  if (t) {
    ctx.options = ctx.options || {};
    ctx.options.headers = {
      ...ctx.options.headers,
      Authorization: `Bearer ${t}`
    };
  }

  await next();

  // Handle 401 responses
  if (ctx.response && ctx.response.status === 401) {
    logout();
  }
});
```

## Key Takeaways

- `createPersisted` keeps the auth token across page reloads and syncs across tabs
- Route guards in `beforeEach` redirect unauthenticated users to login
- `beforeEach` can also redirect authenticated users away from login/register pages
- Keep auth state in a shared module that all pages import
- Use query client middleware for automatic token attachment and 401 handling
