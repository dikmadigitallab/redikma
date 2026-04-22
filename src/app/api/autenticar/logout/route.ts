import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Logout realizado" })

  response.cookies.set("session", "", {
    httpOnly: true,
    expires: new Date(0), // 💥 expira imediatamente
    path: "/",
  })

  return response
}