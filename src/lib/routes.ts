export const Routes = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
}

/**
 * An Array of routes that are used for authentication.
 * These routes will redirect logged in users to the dashboard.
 * @type {string[]}
 */
export const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/email-verification',
]

/**
 * The prefix for API authentication routes.
 * Routes that start with the prefix are used for api authentication purposes.
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth'

/**
 * The prefix for API routes.
 * Routes that start with the prefix are used for api purposes.
 * @type {string}
 */
export const apiPrefix = '/api'

/**
 * The prefix for API authentication routes.
 * Routes that start with the prefix are used for api authentication purposes.
 * @type {string}
 */
export const protectedRoutes = ['/', '/profile']

/**
 * The default redirect path after logging in.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/'
