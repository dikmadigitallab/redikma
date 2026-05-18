import type { Metadata } from "next"
import { Sidebar } from "../components/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { Header } from "../components/feedHeader"

export const metadata: Metadata = {
  title: "ReDikma - Comunicando Cultura",
  description: "Plataforma de comunicação interna para engajamento e colaboração corporativa",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  const role = session?.user?.role

  const isAdmin =
    role === "ADMIN" || role === "SYSTEM_ADM"

  if (!session) {
    redirect("/login")
  }

  if (session.user.first_acess) {
    redirect("/primeiro-acesso")
  }

  if (!isAdmin) {
    redirect("/intern/feed")
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Sidebar />

      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="w-full h-full">
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <Header/>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}