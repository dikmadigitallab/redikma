"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  BarChart3,
  MessageSquare,
  Heart,
  Clock,
  TrendingUp,
  Award,
  Users,
  MessageCircle,
  ThumbsUp,
} from "lucide-react"
import { usePostModal } from "../../providers/PostModalContext"

type PostRankItem = { id: string; label: string; author: string } & Record<string, number>

type DashboardData = {
  stats: { totalPosts: number; totalComments: number; totalLikes: number }
  postsByHour: { hour: number; count: number }[]
  postsByDay: { day: string; count: number }[]
  postsByMonth: { month: string; count: number }[]
  postsByYear: { year: number; count: number }[]
  mostLikedPosts: PostRankItem[]
  mostCommentedPosts: PostRankItem[]
  topPosters: { name: string; count: number }[]
  topCommenters: { name: string; count: number }[]
  topReplyGivers: { name: string; count: number }[]
  topCommentLikers: { name: string; count: number }[]
  mostEngagedPosts: PostRankItem[]
  bestPostingHour: { hour: number; count: number }
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold w-8 text-right shrink-0" style={{ color: "var(--gray)" }}>
        {label}
      </span>
      <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ backgroundColor: "var(--neutral)" }}>
        <div
          className="h-full rounded-lg transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
        />
      </div>
      <span className="text-xs font-bold w-6 text-right">{value}</span>
    </div>
  )
}

function RankingCard({
  title,
  icon: Icon,
  data,
  labelKey,
  valueKey,
  valueLabel,
  onItemClick,
}: {
  title: string
  icon: React.ElementType
  data: any[]
  labelKey: string
  valueKey: string
  valueLabel: string
  onItemClick?: (item: any) => void
}) {
  return (
    <div
      className="rounded-2xl border-2 shadow-md overflow-hidden"
      style={{ borderColor: "var(--primary)", backgroundColor: "var(--white)" }}
    >
      <div className="h-1 w-full" style={{ background: "var(--gradient-primary)" }} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--primary-10)", color: "var(--primary)" }}
          >
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-sm" style={{ color: "var(--primary)" }}>
            {title}
          </h3>
        </div>
        <div className="space-y-2">
          {data.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "var(--gray)" }}>
              Nenhum dado disponível
            </p>
          )}
          {data.map((item, i) => (
            <div
              key={i}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
              className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                onItemClick ? "cursor-pointer hover:opacity-80" : ""
              }`}
              style={{ backgroundColor: i % 2 === 0 ? "var(--surface)" : "transparent" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: i < 3 ? "var(--accent)" : "var(--neutral)",
                    color: i < 3 ? "white" : "var(--gray)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-semibold truncate" style={{ color: "var(--black)" }}>
                  {item[labelKey]}
                </span>
              </div>
              <span className="text-xs font-bold shrink-0 ml-2" style={{ color: "var(--accent)" }}>
                {item[valueKey]} {valueLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div
      className="rounded-2xl border-2 shadow-md p-4 flex items-center gap-4"
      style={{ borderColor: "var(--primary)", backgroundColor: "var(--white)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "var(--primary-10)", color: "var(--primary)" }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gray)" }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { openPost } = usePostModal()

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "SYSTEM_ADM") {
      redirect("/intern/feed")
      return
    }
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, status])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-center py-12 text-sm" style={{ color: "var(--gray)" }}>
        Erro ao carregar dados do dashboard.
      </p>
    )
  }

  const maxHourCount = Math.max(...data.postsByHour.map((h) => h.count), 1)
  const hourLabels = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--primary)" }}>
          Dashboard Administrativo
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--gray)" }}>
          Visão geral da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Total de Postagens" value={data.stats.totalPosts} />
        <StatCard icon={MessageSquare} label="Total de Comentários" value={data.stats.totalComments} />
        <StatCard icon={Heart} label="Total de Curtidas" value={data.stats.totalLikes} />
        <StatCard
          icon={Clock}
          label="Melhor Horário"
          value={`${String(data.bestPostingHour.hour).padStart(2, "0")}h`}
          sub={`${data.bestPostingHour.count} postagens`}
        />
      </div>

      <div
        className="rounded-2xl border-2 shadow-md overflow-hidden"
        style={{ borderColor: "var(--primary)", backgroundColor: "var(--white)" }}
      >
        <div className="h-1 w-full" style={{ background: "var(--gradient-primary)" }} />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--primary-10)", color: "var(--primary)" }}
            >
              <TrendingUp size={16} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: "var(--primary)" }}>
              Postagens por Hora
            </h3>
          </div>
          <div className="space-y-1.5">
            {hourLabels.map((h) => {
              const found = data.postsByHour.find((pbh) => pbh.hour === Number(h))
              return <Bar key={h} label={`${h}h`} value={found?.count ?? 0} max={maxHourCount} />
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          title="Postagens mais Curtidas"
          icon={Heart}
          data={data.mostLikedPosts}
          labelKey="label"
          valueKey="likeCount"
          valueLabel="curtidas"
          onItemClick={(item) => openPost(item.id)}
        />
        <RankingCard
          title="Postagens mais Comentadas"
          icon={MessageSquare}
          data={data.mostCommentedPosts}
          labelKey="label"
          valueKey="commentCount"
          valueLabel="comentários"
          onItemClick={(item) => openPost(item.id)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RankingCard
          title="Quem mais Postou"
          icon={BarChart3}
          data={data.topPosters}
          labelKey="name"
          valueKey="count"
          valueLabel="postagens"
        />
        <RankingCard
          title="Quem mais Comentou"
          icon={Users}
          data={data.topCommenters}
          labelKey="name"
          valueKey="count"
          valueLabel="comentários"
        />
        <RankingCard
          title="Quem mais Respondeu"
          icon={MessageCircle}
          data={data.topReplyGivers}
          labelKey="name"
          valueKey="count"
          valueLabel="respostas"
        />
        <RankingCard
          title="Quem mais Curtiu Comentários"
          icon={ThumbsUp}
          data={data.topCommentLikers}
          labelKey="name"
          valueKey="count"
          valueLabel="curtidas"
        />
      </div>

      <RankingCard
        title="Postagens mais Engajadas"
        icon={Award}
        data={data.mostEngagedPosts}
        labelKey="label"
        valueKey="engagementCount"
        valueLabel="engajamentos"
        onItemClick={(item) => openPost(item.id)}
      />
    </div>
  )
}
