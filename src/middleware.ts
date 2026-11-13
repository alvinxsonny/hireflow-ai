import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if user is accessing HR portal
    if (pathname.startsWith("/hr/dashboard") || pathname.startsWith("/hr/jobs") || pathname.startsWith("/hr/approvals")) {
      const isHR =
        token?.role === "ADMIN" ||
        token?.role === "RECRUITER" ||
        token?.role === "HIRING_MANAGER" ||
        token?.portalAccess === "HR";

      if (!isHR) {
        // Redirect non-HR users to candidate dashboard or HR login with error
        const url = req.nextUrl.clone();
        url.pathname = "/hr/login";
        url.searchParams.set("error", "AccessDenied");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Public pages don't require auth
        if (
          pathname === "/" ||
          pathname.startsWith("/candidate/login") ||
          pathname.startsWith("/hr/login") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/jobs")
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/candidate/login",
    },
  }
);

export const config = {
  matcher: [
    "/candidate/dashboard/:path*",
    "/candidate/applications/:path*",
    "/candidate/assessments/:path*",
    "/candidate/onboarding/:path*",
    "/hr/dashboard/:path*",
    "/hr/jobs/:path*",
    "/hr/candidates/:path*",
    "/hr/approvals/:path*",
  ],
};

