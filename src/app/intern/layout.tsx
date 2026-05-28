import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Sidebar } from "../components/structure/sidebar";
import { Header } from "../components/structure/feedHeader";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "ReDikma - Comunicando Cultura",
  description: "Plataforma de comunicação interna para engajamento e colaboração corporativa",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.first_acess) {
    redirect("/primeiro-acesso")
  }

  return (
    <div
      className="fixed min-h-screen w-full"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="w-full h-full">
          <div className="px-0 md:px-6 lg:px-8 py-0 md:py-8">
            <Header />
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
