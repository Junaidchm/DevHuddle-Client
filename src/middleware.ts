// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {

  console.log('middleeare is owrking here')

  if (req.nextUrl.pathname == '/signIn' && req.auth?.user) {
    return Response.redirect(new URL("/", req.url));
  }

  if (req.nextUrl.pathname === '/' && !req.auth?.user) {
  return Response.redirect(new URL('/signIn', req.url));
  }
  
  if (req.nextUrl.pathname.startsWith("/profile") && !req.auth?.user) {
    return Response.redirect(new URL("/signIn", req.url));
  }

  // if (req.nextUrl.pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
  //   return Response.redirect(new URL("/unauthorized", req.url));
  // }
});
  
// Configure which paths need protection
export const config = {
  matcher: ["/", "/profile/:path*", "/signIn"], // secure homepage + profile
};
