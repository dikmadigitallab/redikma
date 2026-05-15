"use client"

import { useState, useRef } from "react"

interface StepResult {
  step: string
  status: "ok" | "fail" | "skipped"
  detail: string
}

export default function TestSelfLike() {
  const [executando, setExecutando] = useState(false)
  const [log, setLog] = useState("")
  const [resultado, setResultado] = useState<{
    aprovado: boolean
    steps: StepResult[]
  } | null>(null)

  function addLog(msg: string) {
    setLog((prev) => prev + msg + "\n")
  }

  async function step(name: string, fn: () => Promise<string>): Promise<StepResult> {
    try {
      const detail = await fn()
      addLog(`  ✅ ${name}: ${detail}`)
      return { step: name, status: "ok", detail }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      addLog(`  ❌ ${name}: ${msg}`)
      return { step: name, status: "fail", detail: msg }
    }
  }

  async function executar() {
    setExecutando(true)
    setResultado(null)
    setLog("")
    const steps: StepResult[] = []

    addLog("=== Teste de Auto-Like (não deve gerar notificação) ===")

    let postId = ""
    let postAuthorId = ""
    let userId = ""

    // 1. Obter post e author
    steps.push(await step("Obter post e authorId", async () => {
      const r = await fetch("/api/posts", { cache: "no-store" })
      const posts: any[] = await r.json()
      if (!posts.length) throw new Error("Nenhum post")
      // Pega primeiro post que tenha um author
      const post = posts[0]
      postId = post.id
      postAuthorId = post.author?.id
      userId = postAuthorId
      if (!postAuthorId) throw new Error("Post sem authorId")
      return `postId: ${postId}, authorId: ${postAuthorId}`
    }))

    // 2. Verificar se já existe like do autor no post (se sim, descurtir)
    steps.push(await step("Verificar estado inicial do like", async () => {
      const r = await fetch(`/api/posts/posts-likes?postId=${postId}`, { cache: "no-store" })
      const data = await r.json()
      const existing = data.likes?.some((l: any) => l.userId === postAuthorId)
      if (existing) {
        await fetch("/api/posts/posts-likes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, userId: postAuthorId }),
        })
        return "Like existente removido para teste limpo"
      }
      return "Estado limpo (sem like do autor)"
    }))

    // 3. Contar notificações antes
    let notifCountBefore = 0
    steps.push(await step("Contar notificações antes", async () => {
      const r = await fetch(`/api/notifications/count?userId=${postAuthorId}`, { cache: "no-store" })
      const data = await r.json()
      notifCountBefore = data.count ?? data.total ?? 0
      return `${notifCountBefore} notificações não lidas`
    }))

    // 4. Autor curte próprio post (auto-like)
    steps.push(await step("Autor curte próprio post (auto-like)", async () => {
      const r = await fetch("/api/posts/posts-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: postAuthorId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like registrado"
    }))

    // 5. Verificar se notificação foi criada (não deveria!)
    steps.push(await step("Verificar se NÃO houve notificação", async () => {
      const r = await fetch(`/api/notifications/count?userId=${postAuthorId}`, { cache: "no-store" })
      const data = await r.json()
      const notifCountAfter = data.count ?? data.total ?? 0
      if (notifCountAfter > notifCountBefore) {
        // Pode ser de outro usuário — vamos verificar as notificações
        const r2 = await fetch(`/api/notifications?userId=${postAuthorId}`, { cache: "no-store" })
        const notifs: any[] = await r2.json()
        const newNotifs = notifs.filter((n: any) =>
          n.actorId === postAuthorId && n.type === "LIKE"
        )
        if (newNotifs.length > 0) {
          throw new Error(`Notificação de auto-like CRIADA (id: ${newNotifs[0].id}). O sistema deveria ter ignorado.`)
        }
        return `Contagem subiu (${notifCountBefore} → ${notifCountAfter}), mas sem notificação de auto-like (deve ser de outro usuário)`
      }
      return "Nenhuma notificação criada (comportamento correto)"
    }))

    // 6. Limpar: descurtir
    steps.push(await step("Limpar: descurtir post", async () => {
      const r = await fetch("/api/posts/posts-likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: postAuthorId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like removido"
    }))

    const falhou = steps.some((s) => s.status === "fail")
    setResultado({ aprovado: !falhou, steps })
    setExecutando(false)
    addLog(falhou ? "❌ TESTE REPROVADO" : "✅ TESTE APROVADO")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Edge Case - Auto-Like</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Verifica se o sistema impede a criação de notificação quando o autor curte o próprio post.<br />
        O código em <code>posts-likes/route.ts</code> verifica <code>autorPostId !== userId</code> antes de notificar.
      </p>
      <div style={{ marginBottom: 16 }}>
        <button onClick={executar} disabled={executando}
          style={{ padding: "10px 24px", fontSize: 15, cursor: executando ? "not-allowed" : "pointer", background: executando ? "#ccc" : "#9c6b1a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}>
          {executando ? "Executando..." : "Executar teste"}
        </button>
      </div>
      {log && <pre style={{ padding: 12, background: "#1a1a2e", color: "#0f0", borderRadius: 8, fontSize: 12, maxHeight: 300, overflow: "auto", whiteSpace: "pre-wrap", marginBottom: 16 }}>{log}</pre>}
      {resultado && (
        <div style={{ padding: 20, background: "#f8f9fa", borderRadius: 8, border: "1px solid #dee2e6" }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>
            {resultado.aprovado ? "✅ TESTE APROVADO" : "❌ TESTE REPROVADO"}
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#e9ecef" }}>
              <th style={thStyle}>Passo</th><th style={thStyle}>Status</th><th style={thStyle}>Detalhe</th>
            </tr></thead>
            <tbody>
              {resultado.steps.map((s, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{s.step}</td>
                  <td style={{ ...tdStyle, color: s.status === "ok" ? "#198754" : s.status === "fail" ? "#dc3545" : "#6c757d" }}>
                    {s.status === "ok" ? "✅" : s.status === "fail" ? "❌" : "⏭️"}
                  </td>
                  <td style={tdStyle}>{s.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: "8px 10px", textAlign: "left", borderBottom: "2px solid #dee2e6" }
const tdStyle: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid #dee2e6", fontSize: 12 }
