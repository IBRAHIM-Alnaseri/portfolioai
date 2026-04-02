import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// These routes require the user to be logged in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/generate(.*)',
  '/api/create-checkout(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
