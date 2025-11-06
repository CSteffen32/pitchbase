import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return token?.role === 'ADMIN' || token?.role === 'AUTHOR'
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}


