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

  const lastSeenKey = userId
    ? `notifications-last-seen-${userId}`
    : ""

  useEffect(() => {
    if (!userId || !lastSeenKey) return

    async function fetchNotificationCount() {
      try {
        const res = await fetch(`/api/notifications/count?userId=${userId}`)
        const data = await res.json()

        const totalUnread = Number(data.unread) || 0

        const lastSeen = localStorage.getItem(lastSeenKey)

        if (!lastSeen) {
          setUnreadCount(totalUnread)
          return
        }

        const lastSeenDate = new Date(lastSeen)

        const resList = await fetch(`/api/notifications?userId=${userId}`)
        const list = await resList.json()

        const notifications = Array.isArray(list)
          ? list
          : list.notifications || []

        const pending = notifications.filter(
          (n: any) => new Date(n.createdAt) > lastSeenDate
        ).length

        setUnreadCount(pending)
      } catch (error) {
        console.error("Erro ao buscar contagem:", error)
      }
    }

    fetchNotificationCount()
    const interval = setInterval(fetchNotificationCount, 30000)

    return () => clearInterval(interval)
  }, [userId, lastSeenKey])

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

    if (nextOpen && userId && lastSeenKey) {
      const now = new Date().toISOString()

      localStorage.setItem(lastSeenKey, now)

      setUnreadCount(0)
    }
  }

  return (
<header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F5] backdrop-blur-md border-b border-[#F5F5F5] shadow-sm md:sticky md:top-0 md:left-auto md:right-auto md:w-full">
  <div className="h-14 px-4 flex items-center justify-between max-w-7xl mx-auto">

    <div
      onClick={() => router.push("/intern/feed")}
      className="flex items-center gap-3 cursor-pointer shrink-0"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-sm bg-[var(--primary-dark)]">
        <img
          src="../icons/redikma_logo.png"
          alt="logotipo ReDikma"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="leading-tight">
        <h1 className="text-sm font-bold text-neutral-800">ReDikma</h1>
        <p className="text-[10px] text-neutral-500 uppercase">
          Comunicação Interna
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 shrink-0">

      <button className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100">
        <Search size={18} />
      </button>

      {user?.id && (
        <div className="relative" ref={notifyRef}>
          <button
            onClick={handleToggleNotifications}
            className={`w-9 h-9 flex items-center justify-center rounded-full relative transition ${
              unreadCount > 0
                ? "text-orange-500 bg-orange-50"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            <Bell size={18} className={unreadCount > 0 ? "fill-current" : ""} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-3 z-50">
              <NotificationsBox userId={user.id} />
            </div>
          )}
        </div>
      )}

      <div className="relative" ref={avatarRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full overflow-hidden border border-neutral-200"
        >
          <img
            src={user?.foto || "../photoProfile/userDefault.png"}
            className="w-full h-full object-cover"
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">

            <div className="py-2">
              <button
                onClick={() => router.push("/intern/profile")}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm"
              >
                <User size={18} /> Perfil
              </button>

              <button
                onClick={() => router.push("/intern/feed")}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm"
              >
                <Rss size={18} /> Feed
              </button>
            </div>

            <div className="border-t py-2">
              <button
                onClick={() =>
                  window.open("https://telemedicina.dikma.com.br", "_blank")
                }
                className="flex items-center gap-3 w-full px-4 py-2 text-sm"
              >
                <FaUserDoctor size={18} /> Telemedicina
              </button>

              <button
                onClick={() =>
                  window.open("https://ouvidoria.dikma.com.br", "_blank")
                }
                className="flex items-center gap-3 w-full px-4 py-2 text-sm"
              >
                <FaHeadset size={18} /> Ouvidoria Dikma
              </button>
            </div>

            <div className="border-t py-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500"
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