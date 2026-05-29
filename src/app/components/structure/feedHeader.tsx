"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bell,
  LogOut,
  User,
  Search,
  Rss,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { NotificationsBox } from "./box-notify"
import { FaUserDoctor } from "react-icons/fa6"
import { FaHeadset } from "react-icons/fa"
import Image from "next/image"

type SessionUser = {
  id?: string
  nome?: string
  foto?: string
}

type SearchPost = {
  id: string
  image: string
  descricao?: string
}

export function Header() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const userId = user?.id

  const [open, setOpen] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [openSearch, setOpenSearch] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const notifyRef = useRef<HTMLDivElement | null>(null)
  const avatarRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLDivElement | null>(null)

const pathname = usePathname();
    const branch =
  pathname.includes("hml")
    ? "Beta"
    : pathname.includes("dev")
    ? "Desenvolvimento"
    : pathname.includes("opencode")
    ? "OPENCODE"
    : "local";

  const lastSeenKey = userId
    ? `notifications-last-seen-${userId}`
    : ""

  useEffect(() => {
    if (!userId || !lastSeenKey) return

    async function fetchNotificationCount() {
      try {
        const res = await fetch(
          `/api/notifications/count?userId=${userId}`
        )
        const data = await res.json()

        const totalUnread = Number(data.unread) || 0

        const lastSeen = localStorage.getItem(lastSeenKey)

        if (!lastSeen) {
          setUnreadCount(totalUnread)
          return
        }

        const lastSeenDate = new Date(lastSeen)

        const resList = await fetch(
          `/api/notifications?userId=${userId}`
        )
        const list = await resList.json()

        const notifications = Array.isArray(list)
          ? list
          : list.notifications || []

        const pending = notifications.filter(
          (n: any) =>
            new Date(n.createdAt) > lastSeenDate
        ).length

        setUnreadCount(pending)
      } catch (error) {
        console.error(
          "Erro ao buscar contagem:",
          error
        )
      }
    }

    fetchNotificationCount()

    const interval = setInterval(
      fetchNotificationCount,
      30000
    )

    return () => clearInterval(interval)
  }, [userId, lastSeenKey])

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target = event.target as Node

      if (
        notifyRef.current &&
        !notifyRef.current.contains(target)
      ) {
        setOpenNotifications(false)
      }

      if (
        avatarRef.current &&
        !avatarRef.current.contains(target)
      ) {
        setOpen(false)
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setOpenSearch(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  useEffect(() => {
    async function fetchSearch() {
      if (!search.trim()) {
        setResults([])
        return
      }

      try {
        setLoading(true)

        const res = await fetch(
          `/api/search-posts?query=${encodeURIComponent(
            search
          )}`
        )

        const data = await res.json()

        setResults(data.posts || [])
      } catch (error) {
        console.error(
          "Erro ao buscar posts:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    const delay = setTimeout(() => {
      fetchSearch()
    }, 400)

    return () => clearTimeout(delay)
  }, [search])

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
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b-2 shadow-lg md:sticky md:top-0 md:left-auto md:right-auto md:w-full" style={{background: 'var(--gradient-brand)', borderColor: 'var(--accent)'}}>
      <div className="h-14 px-4 flex items-center justify-between max-w-7xl mx-auto">
        <div
          onClick={() =>
            router.push("/intern/feed")
          }
          className="flex items-center gap-3 cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shadow-lg bg-white border-2 border-white">
<Image
  src="/icons/redikma_logo.png"
  alt="logotipo ReDikma"
  width={300}
  height={300}
  priority
  
  draggable={false}
  className="w-full h-full object-contain"
/>
          </div>

          <div className="leading-tight">
            <h1 className="text-sm font-bold text-white drop-shadow-md">
              ReDikma - {branch}
            </h1>

            <p className="text-[10px] text-white opacity-95 uppercase font-semibold tracking-wide drop-shadow-sm">
              Comunicação Interna
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className="relative"
            ref={searchRef}
          >
            <button
              onClick={() =>
                setOpenSearch(!openSearch)
              }
              className="w-9 h-9 flex items-center justify-center rounded-full text-primary hover:bg-primary-10 transition"
            >
              <Search size={18} />
            </button>

            {openSearch && (
              <div className="absolute right-0 mt-3 w-360p] max-w-[calc(100vw-2rem)] bg-white border border-primary rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-neutral-100">
                  <input
                    type="text"
                    placeholder="Buscar pessoas ou publicações..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl border-2 border-primary outline-none text-sm focus:border-primary font-medium"
                    style={{fontFamily: "'Red Hat Text', sans-serif"}}
                  />
                </div>

                <div className="max-h-420px overflow-y-auto">
                  {loading && (
                    <div className="p-4 text-sm text-[varprimary">
                      Buscando...
                    </div>
                  )}

                  {!loading &&
                    results.length === 0 &&
                    search && (
                      <div className="p-4 text-sm text-primary">
                        Nenhuma publicação
                        encontrada
                      </div>
                    )}

                  {!loading &&
                    results.length > 0 && (
                      <div className="grid grid-cols-3 gap-1 p-1">
                        {results.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => {
                              const postElement =
                                document.getElementById(
                                  `post-${post.id}`
                                )

                              if (postElement) {
                                postElement.scrollIntoView(
                                  {
                                    behavior:
                                      "smooth",
                                    block:
                                      "center",
                                  }
                                )

                                postElement.classList.add(
                                  "ring-4",
                                  "ring-cyan-400",
                                  "ring-offset-2"
                                )

                                setTimeout(
                                  () => {
                                    postElement.classList.remove(
                                      "ring-4",
                                      "ring-cyan-400",
                                      "ring-offset-2"
                                    )
                                  },
                                  3000
                                )
                              }

                              setOpenSearch(
                                false
                              )
                              setSearch("")
                            }}
                            className="relative aspect-square overflow-hidden bg-neutral-100 group"
                          >
<Image
  src={post.image}
  alt=""
  width={600}
  height={600}
  loading="lazy"
  
  draggable={false}
  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
/>

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {user?.id && (
            <div
              className="relative"
              ref={notifyRef}
            >
              <button
                onClick={
                  handleToggleNotifications
                }
                className={`w-9 h-9 flex items-center justify-center rounded-full relative transition font-bold ${
                  unreadCount > 0
                    ? "text-white bg-accent shadow-lg hover:shadow-xl"
                    : "text-neutral-600 hover:bg-[varprimary-10 hover:text-primary"
                }`}
              >
                <Bell
                  size={18}
                  className={
                    unreadCount > 0
                      ? "fill-current"
                      : ""
                  }
                />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {openNotifications && (
                <div className="absolute right-0 mt-3 z-50">
                  <NotificationsBox
                    userId={user.id}
                  />
                </div>
              )}
            </div>
          )}

          <div
            className="relative"
            ref={avatarRef}
          >
            <button
              onClick={() =>
                setOpen(!open)
              }
              className="w-9 h-9 rounded-full overflow-hidden border border-primary"
            >
<Image
  src={
    user?.foto ||
    "/photoProfile/userDefault.png"
  }
  alt="Foto do usuário"
  width={200}
  height={200}
  loading="lazy"
  
  draggable={false}
  className="w-full h-full object-cover"
/>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl border-2 border-primary shadow-xl overflow-hidden z-50">
                <div className="py-2 border-b-2 border-primary-10">
                  <button
                    onClick={() => {
                      setOpen(false)
                      router.push(
                        "/intern/profile"
                      )
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-10 transition"
                  >
                    <User size={18} />
                    Perfil
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false)
                      router.push(
                        "/intern/feed"
                      )
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-10 transition"
                  >
                    <Rss size={18} />
                    Feed
                  </button>
                </div>

                <div className="border-t-2 border-primary-10 py-2">
                  <button
                    onClick={() => {
                      setOpen(false)
                      window.open(
                        "https://www.saobernardosamp.com.br/servicos/telemedicina/?v=1",
                        "_blank"
                      )
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-10 transition"
                  >
                    <FaUserDoctor size={18} />
                    Telemedicina
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false)
                      window.open(
                        "https://dikma.com.br/contato/#ouvidoria",
                        "_blank"
                      )
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-10 transition"
                  >
                    <FaHeadset size={18} />
                    Ouvidoria Dikma
                  </button>
                </div>

                <div className="border-t-2 border-accent py-2">
                  <button
                    onClick={() => {
                      setOpen(false)
                      signOut({
                        callbackUrl:
                          "/login",
                      })
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-bold text-white bg-accent hover:shadow-lg transition"
                  >
                    <LogOut size={18} />
                    Sair
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
