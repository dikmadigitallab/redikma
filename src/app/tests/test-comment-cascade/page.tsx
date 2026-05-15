"use client"

import { useState, useRef } from "react"

interface StepResult {
  step: string
  status: "ok" | "fail" | "skipped"
  detail: string
}

export default function TestCommentCascade() {
  const [executando, setExecutando] = useState(false)
  const [log, setLog] = useState("")
  const [resultado, setResultado] = useState<{
    aprovado: boolean
    steps: StepResult[]
  } | null>(null)
  const abortRef = useRef(false)
  const postIdRef = useRef("")
  const parentCommentIdRef = useRef("")
  const childCommentIdRef = useRef("")
  const grandchildCommentIdRef = useRef("")

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
    abortRef.current = false

    const steps: StepResult[] = []

    addLog("=== Teste de Cascade de Comentários ===")

    // 1. Criar post de teste
    steps.push(await step("Criar post de teste", async () => {
      const r = await fetch("/api/posts", {
        method: "POST",
        body: (() => {
          const fd = new FormData()
          fd.append("label", "[TESTE-CASCADE] Post para teste de deleção de comentários")
          fd.append("authorId", "00000000-0000-0000-0000-000000000001")
          fd.append("postador", "Teste Automatizado")
          return fd
        })(),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.json()).error}`)
      const data = await r.json()
      postIdRef.current = data.id
      return `Post ${data.id} criado`
    }))

    if (!postIdRef.current) {
      steps.push({ step: "Criar comentário pai", status: "skipped", detail: "Post não criado" })
      steps.push({ step: "Criar resposta (filho)", status: "skipped", detail: "Post não criado" })
      steps.push({ step: "Criar resposta do filho (neto)", status: "skipped", detail: "Post não criado" })
      steps.push({ step: "Deletar comentário pai", status: "skipped", detail: "Post não criado" })
      steps.push({ step: "Verificar se filhos foram deletados", status: "skipped", detail: "Post não criado" })
      setResultado({ aprovado: false, steps })
      setExecutando(false)
      return
    }

    const pid = postIdRef.current

    // 2. Pegar userId válido
    let userId = ""
    steps.push(await step("Obter userId válido", async () => {
      const r = await fetch("/api/posts", { cache: "no-store" })
      const posts: any[] = await r.json()
      const author = posts.find((p: any) => p.author?.id)
      if (!author?.author?.id) throw new Error("Nenhum post com author encontrado")
      userId = author.author.id
      return `Usando userId: ${userId}`
    }))

    // 3. Criar comentário pai
    steps.push(await step("Criar comentário pai", async () => {
      const r = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: "[TESTE-CASCADE] Comentário pai", postId: pid, authorId: userId }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      parentCommentIdRef.current = data.id
      return `Comentário ${data.id} criado`
    }))

    // 4. Criar resposta (filho)
    steps.push(await step("Criar resposta (filho)", async () => {
      const r = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: "[TESTE-CASCADE] Resposta filho",
          postId: pid,
          authorId: userId,
          parentId: parentCommentIdRef.current,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      childCommentIdRef.current = data.id
      return `Comentário ${data.id} criado`
    }))

    // 5. Criar resposta do filho (neto)
    steps.push(await step("Criar resposta do filho (neto)", async () => {
      const r = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: "[TESTE-CASCADE] Resposta neto",
          postId: pid,
          authorId: userId,
          parentId: childCommentIdRef.current,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      grandchildCommentIdRef.current = data.id
      return `Comentário ${data.id} criado`
    }))

    // 6. Deletar comentário pai
    steps.push(await step("Deletar comentário pai (deve cascatear)", async () => {
      const r = await fetch("/api/posts/posts-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parentCommentIdRef.current }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.json()).error}`)
      return "Comentário pai deletado"
    }))

    // 7. Verificar se filhos foram deletados
    let filhoExiste = false
    let netoExiste = false
    steps.push(await step("Verificar se filho foi deletado", async () => {
      const r = await fetch(`/api/posts/posts-comments?postId=${pid}`, { cache: "no-store" })
      const comments: any[] = await r.json()
      filhoExiste = comments.some((c: any) => c.id === childCommentIdRef.current)
      if (filhoExiste) throw new Error(`Filho ${childCommentIdRef.current} ainda existe! Cascade falhou.`)
      return `Filho removido com sucesso`
    }))

    steps.push(await step("Verificar se neto foi deletado", async () => {
      const r = await fetch(`/api/posts/posts-comments?postId=${pid}`, { cache: "no-store" })
      const comments: any[] = await r.json()
      netoExiste = comments.some((c: any) => c.id === grandchildCommentIdRef.current)
      if (netoExiste) throw new Error(`Neto ${grandchildCommentIdRef.current} ainda existe! Cascade falhou.`)
      return `Neto removido com sucesso`
    }))

    // 8. Limpar post de teste
    addLog("Limpando post de teste...")
    try {
      // Tenta deletar comentários restantes primeiro
      const r2 = await fetch(`/api/posts/posts-comments?postId=${pid}`, { cache: "no-store" })
      const remaining: any[] = await r2.json()
      for (const c of remaining) {
        await fetch("/api/posts/posts-comments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: c.id }),
        })
      }
      // Deleta o post
      await fetch(`/api/posts?postId=${pid}`, { method: "DELETE" })
      addLog("  Post de teste limpo")
    } catch (e) {
      addLog(`  Aviso: limpeza parcial: ${e}`)
    }

    const falhou = steps.some((s) => s.status === "fail")
    setResultado({ aprovado: !falhou, steps })
    setExecutando(false)
    addLog(falhou ? "❌ TESTE REPROVADO" : "✅ TESTE APROVADO")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Integridade - Cascade de Comentários</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Cria um post → comentário pai → resposta filho → resposta neto → deleta o pai.<br />
        Verifica se filho e neto também foram removidos (cascade em profundidade &gt; 2).
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
