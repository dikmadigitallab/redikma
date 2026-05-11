'use client'

import { useEffect, useRef, useState } from "react"
import { Bell, LogOut, User, LayoutGrid, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { NotificationsBox } from "./box-notify"

export function Header() {
  const { data: session } = useSession()
  const user = session?.user as any

  const [open, setOpen] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)

  const router = useRouter()
  const notifyRef = useRef<HTMLDivElement | null>(null)
  const avatarRef = useRef<HTMLDivElement | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)


  useEffect(() => {
    if (!user?.id) return;

    async function fetchNotificationCount() {
      try {
        const res = await fetch(`/api/notifications/count?userId=${user.id}`);
        const data = await res.json();

        // Salva a quantidade de não lidas no estado
        if (data.unread !== undefined) {
          setUnreadCount(data.unread);
        }
      } catch (error) {
        console.error("Erro ao buscar contagem:", error);
      }
    }

    fetchNotificationCount();

    // Opcional: Atualizar a cada 30 segundos (Polling) para parecer em tempo real
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);


  // fecha ao clicar fora (resolve bug de UI travada)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifyRef.current &&
        !notifyRef.current.contains(event.target as Node)
      ) {
        setOpenNotifications(false)
      }

      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      <div className="h-14 px-4 flex items-center justify-between max-w-7xl mx-auto">

        {/* LOGO */}
        <div
          onClick={() => router.push("/intern/feed")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
            style={{ backgroundColor: 'var(--primary-dark)' }}
          >
            D
          </div>
          <h1 className="text-base font-bold text-neutral-800">ReDikma</h1>
        </div>

        {/* AÇÕES */}
        <div className="flex items-center gap-2">

          {/* SEARCH */}
          <button className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-full">
            <Search size={20} />
          </button>

          {/* NOTIFICAÇÕES */}
          {user?.id && (
<div className="relative" ref={notifyRef}>
              <button
                onClick={() => setOpenNotifications((prev) => !prev)}
                className={`relative p-2 rounded-full transition-colors ${
                  unreadCount > 0 
                    ? "text-orange-500 bg-orange-50 hover:bg-orange-100" 
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {/* O 'fill-current' faz o sino ficar sólido/pintado por dentro se houver notificação */}
                <Bell 
                  size={20} 
                  className={unreadCount > 0 ? "fill-current" : ""} 
                />
              </button>

              {openNotifications && (
                <div className="absolute right-0 mt-2 z-50">
                  <NotificationsBox userId={user.id} />
                </div>
              )}
            </div>
          )}

          {/* AVATAR */}
          <div className="relative" ref={avatarRef}>
            <button onClick={() => setOpen(!open)}>
              {user?.foto ? (
                <img src={user.foto} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl border py-2">
                <button
                  onClick={() => router.push("/intern/profile")}
                  className="w-full px-4 py-2 text-left"
                >
                  <User size={18} /> Perfil
                </button>

                <button
                  onClick={() => router.push("/intern/feed")}
                  className="w-full px-4 py-2 text-left"
                >
                  <LayoutGrid size={18} /> Feed
                </button>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full px-4 py-2 text-red-500 text-left"
                >
                  <LogOut size={18} /> Sair
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}