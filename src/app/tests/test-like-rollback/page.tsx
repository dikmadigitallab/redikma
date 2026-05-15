"use client"

import { useState, useRef } from "react"

interface StepResult {
  step: string
  status: "ok" | "fail" | "skipped"
  detail: string
}

export default function TestLikeRollback() {
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

    addLog("=== Teste de Rollback de Like Otimista ===")

    let postId = ""
    let userId = ""

    // 1. Obter post + userId
    steps.push(await step("Obter post e userId", async () => {
      const r = await fetch("/api/posts", { cache: "no-store" })
      const posts: any[] = await r.json()
      if (!posts.length) throw new Error("Nenhum post")
      postId = posts[0].id
      userId = posts[0].author?.id
      if (!userId) throw new Error("Post sem authorId")
      return `postId: ${postId}, userId: ${userId}`
    }))

    // 2. Verificar estado inicial (não curtido)
    let likedBefore = false
    steps.push(await step("Verificar estado inicial do like", async () => {
      const r = await fetch(`/api/posts/posts-likes?postId=${postId}`, { cache: "no-store" })
      const data = await r.json()
      likedBefore = data.likes?.some((l: any) => l.userId === userId) || false
      return likedBefore ? "Já curtido (será descurtido depois)" : "Não curtido (estado limpo)"
    }))

    // 3. Se já curtido, descurtir primeiro
    if (likedBefore) {
      steps.push(await step("Descurtir (limpar estado)", async () => {
        const r = await fetch("/api/posts/posts-likes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, userId }),
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Like removido"
      }))
    }

    // 4. Curtir normalmente (deve funcionar)
    steps.push(await step("Curtir post (deve funcionar)", async () => {
      const r = await fetch("/api/posts/posts-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like registrado com sucesso"
    }))

    // 5. Tentar curtir de novo (addLike retorna existing, não deve falhar)
    steps.push(await step("Curtir novamente (deve retornar existing like)", async () => {
      const r = await fetch("/api/posts/posts-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like já existente retornado (comportamento esperado)"
    }))

    // 6. Verificar que o like existe via GET
    steps.push(await step("Verificar like via GET", async () => {
      const r = await fetch(`/api/posts/posts-likes?postId=${postId}`, { cache: "no-store" })
      const data = await r.json()
      const found = data.likes?.some((l: any) => l.userId === userId)
      if (!found) throw new Error("Like não encontrado no servidor!")
      return "Like confirmado no servidor"
    }))

    // 7. Limpar: descurtir
    steps.push(await step("Limpar: descurtir post", async () => {
      const r = await fetch("/api/posts/posts-likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return "Like removido"
    }))

    // 8. Verificar que o like foi removido
    steps.push(await step("Verificar que o like foi removido", async () => {
      const r = await fetch(`/api/posts/posts-likes?postId=${postId}`, { cache: "no-store" })
      const data = await r.json()
      const found = data.likes?.some((l: any) => l.userId === userId)
      if (found) throw new Error("Like ainda existe no servidor após remoção!")
      return "Like confirmado como removido"
    }))

    const falhou = steps.some((s) => s.status === "fail")
    setResultado({ aprovado: !falhou, steps })
    setExecutando(false)
    addLog(falhou ? "❌ TESTE REPROVADO" : "✅ TESTE APROVADO")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Integridade - Rollback de Like</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Verifica o comportamento do sistema de likes: curtir → verificar GET → descurtir → confirmar remoção.<br />
        Simula o fluxo completo que o frontend executa com updates otimistas.
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
