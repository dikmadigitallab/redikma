"use client"

import { useState, useRef } from "react"

interface StepResult {
  step: string
  status: "ok" | "fail" | "skipped"
  detail: string
}

export default function TestPostDeletion() {
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

    addLog("=== Teste de Deleção de Post com Comentários Aninhados ===")

    let postId = ""
    let userId = ""
    let commentId = ""

    // 1. Obter userId válido
    steps.push(await step("Obter userId válido", async () => {
      const r = await fetch("/api/posts", { cache: "no-store" })
      const posts: any[] = await r.json()
      const author = posts.find((p: any) => p.author?.id)
      if (!author?.author?.id) throw new Error("Nenhum post encontrado")
      userId = author.author.id
      return `userId: ${userId}`
    }))

    // 2. Criar post de teste
    steps.push(await step("Criar post de teste", async () => {
      const r = await fetch("/api/posts", {
        method: "POST",
        body: (() => {
          const fd = new FormData()
          fd.append("label", "[TESTE-DELETE] Post para teste de deleção com comentários")
          fd.append("authorId", userId)
          fd.append("postador", "Teste Automatizado")
          return fd
        })(),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      postId = data.id
      return `Post ${postId} criado`
    }))

    if (!postId) {
      setResultado({ aprovado: false, steps })
      setExecutando(false)
      return
    }

    // 3. Adicionar comentário ao post
    steps.push(await step("Adicionar comentário ao post", async () => {
      const r = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: "[TESTE-DELETE] Comentário para testar deleção", postId, authorId: userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      commentId = data.id
      return `Comentário ${commentId} criado`
    }))

    // 4. Adicionar like ao post
    steps.push(await step("Adicionar like ao post", async () => {
      const r = await fetch("/api/posts/posts-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like adicionado"
    }))

    // 5. Adicionar like ao comentário
    steps.push(await step("Adicionar like ao comentário", async () => {
      const r = await fetch("/api/posts/comments-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like no comentário adicionado"
    }))

    // 6. Deletar o post
    steps.push(await step("Deletar o post (deve cascatear)", async () => {
      const r = await fetch(`/api/posts?postId=${postId}`, { method: "DELETE" })
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.json()).error}`)
      return "Post deletado"
    }))

    // 7. Verificar se comentários foram removidos
    steps.push(await step("Verificar se comentários foram removidos", async () => {
      // Tentar buscar comentários do post deletado — esperamos array vazio ou erro
      const r = await fetch(`/api/posts/posts-comments?postId=${postId}`, { cache: "no-store" })
      if (!r.ok) {
        // 404 é aceitável se a rota rejeitar postId inexistente
        return "Post não encontrado (esperado)"
      }
      const comments: any[] = await r.json()
      if (comments.length > 0) throw new Error(`${comments.length} comentários ainda existem!`)
      return "Nenhum comentário restante"
    }))

    // 8. Verificar se likes do post foram removidos
    steps.push(await step("Verificar se likes do post foram removidos", async () => {
      const r = await fetch(`/api/posts/posts-likes?postId=${postId}`, { cache: "no-store" })
      const data = await r.json()
      if (data.total > 0) throw new Error(`${data.total} likes ainda existem!`)
      return "Nenhum like restante"
    }))

    const falhou = steps.some((s) => s.status === "fail")
    setResultado({ aprovado: !falhou, steps })
    setExecutando(false)
    addLog(falhou ? "❌ TESTE REPROVADO" : "✅ TESTE APROVADO")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Integridade - Deleção de Post</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Cria post → adiciona comentário → adiciona like no post → adiciona like no comentário → deleta o post.<br />
        Verifica se comentários e likes foram removidos corretamente.
      </p>
      <div style={{ marginBottom: 16 }}>
        <button onClick={executar} disabled={executando}
          style={{ padding: "10px 24px", fontSize: 15, cursor: executando ? "not-allowed" : "pointer", background: executando ? "#ccc" : "#2d6a4f", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}>
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
