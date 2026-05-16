import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const session = req.cookies.get("session");
  const accepted = req.cookies.get("first_acess")?.value;

  const pathname = req.nextUrl.pathname;

  const isLoginPage = pathname.startsWith("/login");
  const isLegalPage = pathname.startsWith("/legal");
  const isFeedPage = pathname.startsWith("/intern/feed");

  // ❌ Não logado -> redireciona para login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Logado, mas ainda não aceitou os termos
  if (session && accepted !== "false") {
    // Permite acessar apenas a página de termos
    if (!isLegalPage) {
      return NextResponse.redirect(new URL("/legal", req.url));
    }
  }

  // ✅ Logado e já aceitou os termos
  if (session && accepted === "true") {
    // Evita voltar para login ou legal
    if (isLoginPage || isLegalPage) {
      return NextResponse.redirect(
        new URL("/intern/feed", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/intern/feed/:path*",
    "/login",
    "/legal/:path*",
  ],
};