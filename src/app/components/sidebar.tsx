"use client"

import { Home, Search, Video, User, LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserCard } from "./cardUser"
import { useState } from "react"

export function Sidebar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    await fetch("/api/autenticar/logout", {
      method: "POST",
    })

    router.push("/login")
  }

  function aviso() {
    alert('Recurso estará disponivel em breve')
  }

  const menuItems = [
    {
      icon: Home,
      label: "Início",
      onClick: () => {
        router.push("intern/feed")
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
        router.push("intern/profile")
        setIsOpen(false)
      },
      disabled: false,
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full gap-4 py-4 md:py-6">
      {/* Usuário */}
      <div className="px-4 md:px-6">
        <UserCard />
      </div>

      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-1 px-2 md:px-4">
        <div
          className="hidden md:block text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'var(--gray)' }}
        >
          Menu
        </div>
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition w-full text-left ${
              item.disabled
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-opacity-50 cursor-pointer'
            }`}
            style={{
              color: 'var(--gray)',
              backgroundColor: item.disabled ? 'transparent' : 'transparent',
            }}
            disabled={item.disabled}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className="text-sm md:text-base font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 md:px-4 pt-2 md:pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition hover:opacity-70 cursor-pointer w-full text-sm md:text-base font-medium"
          style={{ color: 'var(--warning)' }}
        >
          <LogOut size={20} className="flex-shrink-0" />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-50 overflow-y-auto"
        style={{
          backgroundColor: 'var(--white)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div className="p-4 md:p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
            ReDikma
          </div>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4"
        style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
          ReDikma
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg transition hover:opacity-70"
          style={{ color: 'var(--gray)' }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30 mt-16"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setIsOpen(false)}
          />
          <aside
            className="md:hidden fixed top-16 left-0 right-0 z-30 overflow-y-auto"
            style={{
              backgroundColor: 'var(--white)',
              maxHeight: 'calc(100vh - 4rem)',
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
