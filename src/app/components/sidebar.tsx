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
    <div className="flex flex-col  h-full gap-4 py-4 md:py-6">
      <div className="px-4 md:px-6">
        <UserCard />
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2 md:px-4">
        <div
          className="hidden md:block text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--gray)" }}
        >
          Menu
        </div>

        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition w-full text-left ${item.disabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-opacity-50 cursor-pointer"
              }`}
            style={{
              color: "var(--gray)",
              backgroundColor: "transparent",
            }}
            disabled={item.disabled}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className="text-sm md:text-base font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div
        className="px-2 md:px-4 pt-2 md:pt-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition hover:opacity-70 cursor-pointer w-full text-sm md:text-base font-medium"
          style={{ color: "var(--warning)" }}
        >
          <LogOut size={20} className="flex-shrink-0" />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-50 overflow-y-auto"
        style={{
          backgroundColor: "var(--white)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          className="p-4 md:p-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="text-xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            ReDikma
          </div>
        </div>
        {sidebarContent}
      </aside>

    </>
  )
}