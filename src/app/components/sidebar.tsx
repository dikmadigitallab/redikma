"use client"

import { Home, Search, Video, User, LogOut, Menu, X, UserPlus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserCard } from "./cardUser"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"

export function Sidebar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const isAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SYSTEM_ADM"

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" })
  }

  function aviso() {
    alert("Recurso estará disponivel em breve")
  }

  const menuItems = [
    {
      icon: Home,
      label: "Início",
      onClick: () => {
        router.push("/intern/feed")
        setIsOpen(false)
      },
      disabled: false,
    },
    {
      icon: Search,
      label: "Buscar",
      onClick: aviso,
      disabled: true,
    },
    ...(isAdmin
      ? [
        {
          icon: UserPlus,
          label: "Novo Usuário",
          onClick: () => {
            router.push("/admin/cadastro")
          },
          disabled: false,
        },
        {
          icon: Users,
          label: "Todos os Usuários",
          onClick: () => {
            router.push("/admin/usuarios")
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
   <div className="flex flex-col h-full py-4 md:py-6">
  {/* Card do usuário */}
  <div className="px-4 md:px-6 mb-6">
    <UserCard />
  </div>

  {/* Navegação principal */}
  <nav className="flex-1 px-3 md:px-4">
    {/* Título da seção */}
    <div className="px-2 mb-3">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--gray)" }}
      >
        Menu
      </p>
    </div>

    {/* Card do menu */}
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{
        backgroundColor: "var(--white)",
        borderColor: "var(--border)",
      }}
    >
      {/* Barra decorativa superior */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--primary-dark) 0%, var(--secondary) 70%, var(--accent) 100%)",
        }}
      />

      <div className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`group flex items-center gap-3 w-full px-3 md:px-4 py-3 rounded-xl transition-all duration-200 text-left ${
              item.disabled
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:opacity-85"
            }`}
            style={{
              backgroundColor: "transparent",
              color: "var(--black)",
            }}
          >
            {/* Ícone */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--primary-dark)",
              }}
            >
              <item.icon size={18} />
            </div>

            {/* Texto */}
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm md:text-[15px] font-semibold truncate">
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </nav>

  {/* Rodapé / Logout */}
  <div className="px-3 md:px-4 mt-6">
    <div
      className="rounded-2xl border shadow-sm p-2"
      style={{
        backgroundColor: "var(--white)",
        borderColor: "var(--border)",
      }}
    >
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-3 md:px-4 py-3 rounded-xl transition-opacity hover:opacity-85 cursor-pointer"
        style={{
          backgroundColor: "rgba(251, 176, 75, 0.10)",
          color: "var(--warning)",
        }}
      >
        {/* Ícone */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: "rgba(251, 176, 75, 0.15)",
            color: "var(--warning)",
          }}
        >
          <LogOut size={18} />
        </div>

        {/* Texto */}
        <div className="flex flex-col items-start">
          <span className="text-sm md:text-[15px] font-semibold">
            Sair
          </span>
          <span className="text-[11px]" style={{ color: "var(--gray)" }}>
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
  <aside
    className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-50 overflow-y-auto shadow-xl"
    style={{
      backgroundColor: "var(--white)",
      borderRight: "1px solid var(--border)",
    }}
  >
    {/* Barra decorativa superior */}
    <div
      className="h-1.5 w-full flex-shrink-0"
      style={{
        background:
          "linear-gradient(90deg, var(--primary-dark) 0%, var(--secondary) 70%, var(--accent) 100%)",
      }}
    />

    {/* Cabeçalho */}
    <div
      className="px-6 py-5 border-b flex-shrink-0"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-xl opacity-20 blur-sm"
            style={{ backgroundColor: "var(--secondary)" }}
          />

          <div
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm"
            style={{
              backgroundColor: "var(--white)",
              borderColor: "var(--border)",
            }}
          >
            <img
              src="/icons/redikma_logo.png"
              alt="ReDikma"
              className="w-9 h-9 object-contain"
            />
          </div>
        </div>

        {/* Nome do sistema */}
        <div className="min-w-0">
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--primary-dark)" }}
          >
            ReDikma
          </h1>

          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em] mt-0.5"
            style={{ color: "var(--gray)" }}
          >
            Comunicação Interna
          </p>
        </div>
      </div>
    </div>

    {/* Conteúdo da sidebar */}
    <div className="flex-1 min-h-0">
      {sidebarContent}
    </div>
  </aside>
</>
  )
}