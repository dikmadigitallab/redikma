import type { Metadata } from "next";
import { Sidebar } from "../components/sidebar";




export const metadata: Metadata = {
  title: "ReDikma - Comunicando Cultura",
  description: "Plataforma de comunicação interna para engajamento e colaboração corporativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="fixed min-h-screen w-full"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="w-full h-full">
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
