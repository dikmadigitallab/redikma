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
    <div className="min-h-full flex flex-col ">
        <Sidebar/>
  {children}
        
      </div>
    
  );
}
