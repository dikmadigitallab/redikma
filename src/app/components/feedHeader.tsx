"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bell,
  LogOut,
  User,
  Search,
  Rss,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { NotificationsBox } from "./box-notify"
import { FaUserDoctor } from "react-icons/fa6"
import { FaHeadset } from "react-icons/fa"

type SessionUser = {
  id?: string
  nome?: string
  foto?: string
}

export function Header() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const userId = user?.id

  const [open, setOpen] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const router = useRouter()
  const notifyRef = useRef<HTMLDivElement | null>(null)
  const avatarRef = useRef<HTMLDivElement | null>(null)

  const notificationsStorageKey = userId
    ? `notifications-last-seen-count-${userId}`
    : ""

  useEffect(() => {
    if (!userId || !notificationsStorageKey) return

    async function fetchNotificationCount() {
      try {
        const res = await fetch(
          `/api/notifications/count?userId=${userId}`
        )
        const data = await res.json()

        if (data.unread !== undefined) {
          const totalUnread = Number(data.unread) || 0

          const lastSeen = Number(
            localStorage.getItem(notificationsStorageKey) || "0"
          )

          const pending = Math.max(totalUnread - lastSeen, 0)
          setUnreadCount(pending)
        }
      } catch (error) {
        console.error("Erro ao buscar contagem:", error)
      }
    }

    fetchNotificationCount()
    const interval = setInterval(fetchNotificationCount, 30000)

    return () => clearInterval(interval)
  }, [userId, notificationsStorageKey])

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleToggleNotifications() {
    const nextOpen = !openNotifications
    setOpenNotifications(nextOpen)

    if (nextOpen && userId && notificationsStorageKey) {
      try {
        const res = await fetch(
          `/api/notifications/count?userId=${userId}`
        )
        const data = await res.json()

        const totalUnread = Number(data.unread) || 0

        localStorage.setItem(
          notificationsStorageKey,
          totalUnread.toString()
        )

        setUnreadCount(0)
      } catch (error) {
        console.error("Erro ao salvar estado:", error)
      }
    }
  }

  return (
<header className="sticky top-0 z-50 w-full bg-[#F5F5F5] backdrop-blur-md border-b border-neutral-200 shadow-sm">
  <div className="h-14 px-4 w-full flex items-center justify-between max-w-7xl mx-auto">

    {/* LOGO */}
    <div
      onClick={() => router.push("/intern/feed")}
      className="flex items-center gap-3 cursor-pointer shrink-0"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--primary-dark)" }}
      >
        <img
          src="../icons/redikma_logo.png"
          alt="logotipo ReDikma"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="leading-tight">
        <h1 className="text-sm font-bold text-neutral-800">
          ReDikma
        </h1>
        <p className="text-[10px] text-neutral-500 tracking-wider uppercase">
          Comunicação Interna
        </p>
      </div>
    </div>

    {/* AÇÕES */}
    <div className="flex items-center gap-3 shrink-0">

      {/* SEARCH */}
      <button className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition">
        <Search size={18} />
      </button>

      {/* NOTIFICAÇÕES */}
      {user?.id && (
        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => setOpenNotifications((prev) => !prev)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition relative ${
              unreadCount > 0
                ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            <Bell
              size={18}
              className={unreadCount > 0 ? "fill-current" : ""}
            />
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-3 z-50">
              <NotificationsBox userId={user.id} />
            </div>
          )}
        </div>
      )}

      {/* AVATAR */}
      <div className="relative" ref={avatarRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full overflow-hidden border border-neutral-200 hover:opacity-90 transition"
        >
          <img
            src={user?.foto || "../photoProfile/userDefault.png"}
            alt="Avatar do usuário"
            className="w-full h-full object-cover"
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">

            {/* MENU PRINCIPAL */}
            <div className="py-2">

              <button
                onClick={() => router.push("/intern/profile")}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
              >
                <User size={18} /> Perfil
              </button>

              <button
                onClick={() => router.push("/intern/feed")}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
              >
                <Rss size={18} /> Feed
              </button>
            </div>

            {/* LINKS */}
            <div className="border-t border-neutral-100 py-2">
              <p className="px-4 py-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Links Úteis
              </p>

              <button
                onClick={() =>
                  window.open("https://telemedicina.dikma.com.br", "_blank")
                }
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
              >
                <FaUserDoctor size={18} /> Telemedicina
              </button>

              <button
                onClick={() =>
                  window.open("https://ouvidoria.dikma.com.br", "_blank")
                }
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
              >
                <FaHeadset size={18} /> Ouvidoria Dikma
              </button>
            </div>

            {/* SAIR */}
            <div className="border-t border-neutral-100 py-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  </div>
</header>
  )
}