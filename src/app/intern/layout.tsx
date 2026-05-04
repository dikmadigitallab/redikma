import type { Metadata } from "next"
import { Sidebar } from "../components/sidebar"

export const metadata: Metadata = {
  title: "ReDikma - Comunicando Cultura",
  description: "Plataforma de comunicação interna para engajamento e colaboração corporativa",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Sidebar fixa */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col">
        {/* Topo mobile */}
        <div
          className="md:hidden w-full p-4 flex items-center justify-between shadow-sm"
          style={{ backgroundColor: "var(--white)" }}
        >
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--black)" }}
          >
            ReDikma
          </span>
        </div>

        {/* Conteúdo central */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}