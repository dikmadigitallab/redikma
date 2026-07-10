"use client"

import {
  Video,
  User,
  LogOut,
  UserPlus,
  Users,
  Rss,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { UserCard } from "./cardUser"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

export function Sidebar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const isAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SYSTEM_ADM"

  const isSystemAdmin = session?.user?.role === "SYSTEM_ADM"

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" })
  }

  function aviso() {
    alert("Recurso estará disponivel em breve")
  }

  const menuItems = [
    {
      icon: Rss,
      label: "Feed",
      onClick: () => {
        router.push("/intern/feed")
        setIsOpen(false)
      },
      disabled: false,
    },
    ...(isSystemAdmin
      ? [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          onClick: () => {
            router.push("/admin/dashboard")
            setIsOpen(false)
          },
          disabled: false,
        },
      ]
      : []),
    ...(isAdmin
      ? [
        {
          icon: UserPlus,
          label: "Novo Usuário",
          onClick: () => {
            router.push("/admin/cadastro")
            setIsOpen(false)
          },
          disabled: false,
        },
        {
          icon: Users,
          label: "Todos os Usuários",
          onClick: () => {
            router.push("/admin/usuarios")
            setIsOpen(false)
          },
          disabled: false,
        },
      ]
      : []),
    {
      icon: Video,
      label: "Vídeos",
      onClick: aviso,
      disabled: true,
      name: "Em breve",
    },
    {
      icon: User,
      label: "Perfil",
      onClick: () => {
        router.push("/intern/profile")
        setIsOpen(false)
      },
      disabled: false,
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 lg:py-6">
      {/* Card usuário */}
      <div className="px-4 md:px-6 mb-6">
        <UserCard />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 md:px-4">
        <div className="px-2 mb-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--gray)" }}
          >
            Menu
          </p>
        </div>

        <div
          className="rounded-2xl border-2 shadow-md overflow-hidden"
          style={{
            backgroundColor: "var(--white)",
            borderColor: "var(--primary)",
          }}
        >
          {/* Barra topo */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
            }}
          />

          <div className="p-2">
            {menuItems.map((item) => (
              <button
                title={item.name}
                key={item.label}
                onClick={item.onClick}
                disabled={item.disabled}
                className={`group flex items-center gap-3 w-full px-3 md:px-4 py-3 rounded-xl transition-all duration-200 text-left font-semibold ${item.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:bg-accent"
                  }`}
                style={{
                  backgroundColor: "transparent",
                }}
              >
                {/* Ícone */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${item.disabled
                      ? ""
                      : "group-hover:bg-white group-hover:text-accent"
                    }`}
                  style={{
                    backgroundColor: "var(--primary-10)",
                    color: "var(--primary)",
                  }}
                >
                  <item.icon size={18} />
                </div>

                {/* Texto */}
                <div className="flex flex-col items-start min-w-0">
                  <span
                    className={`text-sm md:text-[80%] font-bold truncate transition-colors duration-200 ${item.disabled
                        ? "text-primary"
                        : "text-primary group-hover:text-black"
                      }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 md:px-4 mt-6">
        <div
          className="rounded-2xl border-2 shadow-md p-2"
          style={{
            backgroundColor: "var(--accent)",
            borderColor: "var(--accent)",
          }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 md:px-4 py-3 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer font-bold"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                color: "white",
              }}
            >
              <LogOut size={18} />
            </div>

            <div className="flex flex-col items-start">
              <span className="text-sm md:text-[15px] font-bold text-white">
                Sair
              </span>

              <span className="text-[11px] text-white opacity-90">
                Encerrar sessão
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* BOTÃO DA SETA: Totalmente oculto no celular (hidden), visível no tablet (md:flex), oculto no desktop (lg:hidden) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex lg:hidden fixed top-5 z-[10000] p-2 rounded-r-xl border-y-2 border-r-2 shadow-md transition-all duration-300"
        style={{
          left: isOpen ? "280px" : "0px",
          backgroundColor: "var(--white)",
          borderColor: "var(--primary)",
          color: "var(--primary)",
        }}
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      {/* Fundo escurecido (Overlay): Só ativa e aparece na faixa do tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9998] hidden md:block lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen z-[9999] flex flex-col w-[280px] lg:w-[18vw] overflow-y-auto shadow-xl transition-transform duration-300 ease-in-out
          /* No Celular: Completamente oculta */
          -translate-x-full 
          
          /* No Tablet: Controlada pelo estado do botão (seta) */
          md:${isOpen ? "translate-x-0" : "-translate-x-full"} 
          
          /* No Desktop: Sempre visível e fixa */
          lg:translate-x-0
        `}
        style={{
          backgroundColor: "var(--white)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Barra topo */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{
            background:
              "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
          }}
        />

        {/* Header */}
        <div
          className="px-6 py-5 border-b shrink-0"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "rgba(255,255,255,0.98)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative">
              <div
                className="absolute -inset-1 rounded-xl opacity-20 blur-sm"
                style={{
                  backgroundColor: "var(--primary)",
                }}
              />

              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm"
                style={{
                  backgroundColor: "var(--white)",
                  borderColor: "var(--border)",
                }}
              >
                <Image
                  src="/icons/Intranet_logo.png"
                  alt="Intranet"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Texto */}
            <div className="min-w-0">
              <h1
                className="text-[100%] font-bold tracking-tight"
                style={{ color: "var(--primary)" }}
              >
                Intranet
              </h1>

              <p
                className="text-[15%] font-semibold uppercase tracking-[0.18em] mt-0.5"
                style={{ color: "var(--gray)" }}
              >
                Comunicação Interna
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-h-0">{sidebarContent}</div>
      </aside>
    </>
  )
}