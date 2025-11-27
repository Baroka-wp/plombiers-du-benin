import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Protéger les routes /artisan/dashboard
      if (req.nextUrl.pathname.startsWith("/artisan/dashboard")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/artisan/dashboard/:path*"],
};

