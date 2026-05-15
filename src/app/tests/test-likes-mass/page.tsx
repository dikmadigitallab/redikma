"use client"

import { useState, useRef } from "react"

interface DetalheErro {
  indice: number
  mensagem: string
  requestTime: string
}

function formatar(v: number): string {
  return v.toFixed(2)
}

export default function TestLikesMass() {
  const [totalReq, setTotalReq] = useState(500)
  const [conc, setConc] = useState(50)
  const [executando, setExecutando] = useState(false)
  const [log, setLog] = useState("")
  const [resultado, setResultado] = useState<any>(null)
  const abortRef = useRef(false)
  const targetPostRef = useRef({ postId: "", authorId: "" })
  const userIdsRef = useRef<string[]>([])

  function addLog(msg: string) {
    setLog((prev) => prev + msg + "\n")
  }

  async function executar() {
    setExecutando(true)
    setResultado(null)
    setLog("")
    abortRef.current = false

    addLog("Buscando posts e usuários...")
    try {
      const res = await fetch("/api/posts", { cache: "no-store" })
      const data = await res.json()
      const arr: any[] = Array.isArray(data) ? data : data?.posts ?? []
      if (arr.length === 0) { addLog("Nenhum post."); setExecutando(false); return }
      targetPostRef.current = { postId: arr[0].id, authorId: arr[0].author?.id }
      const authors = new Set<string>()
      for (const p of arr) if (p.author?.id) authors.add(p.author.id)
      userIdsRef.current = [...authors]
      addLog(`  Post alvo: ${targetPostRef.current.postId}`)
      addLog(`  Usuários distintos: ${userIdsRef.current.length}`)
    } catch (e) {
      addLog(`ERRO: ${e}`)
      setExecutando(false)
      return
    }

    addLog(`Testando: ${totalReq} likes no mesmo post, ${conc} conc...`)

    let sucesso = 0, erro = 0, contador = 0
    const tempos: number[] = []
    const errosDetalhe: DetalheErro[] = []
    let uniqueConstraintErrors = 0

    async function req(): Promise<void> {
      if (abortRef.current) return
      const idx = ++contador
      const userId = userIdsRef.current[Math.floor(Math.random() * userIdsRef.current.length)]
      const inicio = performance.now()
      try {
        const r = await fetch("/api/posts/posts-likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: targetPostRef.current.postId, userId }),
        })
        const elapsed = performance.now() - inicio
        tempos.push(elapsed)
        if (r.ok) sucesso++
        else {
          const body = await r.json().catch(() => ({}))
          if (r.status === 409 || body?.error?.includes("Unique") || body?.error?.includes("unique")) uniqueConstraintErrors++
          erro++
          if (errosDetalhe.length < 20) errosDetalhe.push({ indice: idx, mensagem: body?.error || `HTTP ${r.status}`, requestTime: formatar(elapsed) })
        }
      } catch (e) {
        const elapsed = performance.now() - inicio
        tempos.push(elapsed)
        erro++
        if (errosDetalhe.length < 20) errosDetalhe.push({ indice: idx, mensagem: e instanceof Error ? e.message : "Erro", requestTime: formatar(elapsed) })
      }
    }

    async function worker(total: number) {
      for (let i = 0; i < total; i++) await req()
    }

    const inicioTeste = performance.now()
    const porWorker = Math.floor(totalReq / conc)
    const resto = totalReq % conc
    const workers = []
    for (let i = 0; i < conc; i++) workers.push(worker(i < resto ? porWorker + 1 : porWorker))
    await Promise.all(workers)
    const duracao = (performance.now() - inicioTeste) / 1000
    const totalExec = sucesso + erro

    const min = tempos.length ? Math.min(...tempos) : 0
    const max = tempos.length ? Math.max(...tempos) : 0
    const media = tempos.length ? tempos.reduce((a, v) => a + v, 0) / tempos.length : 0

    // Limpa likes criados (usa userIds que deram sucesso)
    addLog("Limpando likes criados...")
    const cleanupResults = await Promise.allSettled(
      userIdsRef.current.map((uid) =>
        fetch("/api/posts/posts-likes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: targetPostRef.current.postId, userId: uid }),
        })
      )
    )
    addLog(`  Cleanup: ${cleanupResults.filter(r => r.status === "fulfilled").length} likes removidos`)

    setResultado({
      sucesso, erro, total: totalExec,
      uniqueConstraintErrors,
      tempoTotalSegundos: formatar(duracao),
      requestsPorSegundo: formatar(totalExec / duracao),
      min: formatar(min), max: formatar(max),
      media: formatar(media),
      p95: formatar(percentil(tempos, 95)),
      p99: formatar(percentil(tempos, 99)),
      primeirosErros: errosDetalhe,
    })

    setExecutando(false)
    addLog("Concluído!")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Teste de Carga - Like em Massa</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Muitos usuários curtindo o <strong>mesmo post</strong> simultaneamente. Testa concorrência na unique constraint + criação de notificação.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 4, fontWeight: 600 }}>Requisições</label>
          <input type="number" min={1} value={totalReq} onChange={(e) => setTotalReq(Number(e.target.value))} disabled={executando}
            style={{ padding: "8px 12px", fontSize: 14, border: "1px solid #ced4da", borderRadius: 6, width: 120 }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 4, fontWeight: 600 }}>Concorrência</label>
          <input type="number" min={1} value={conc} onChange={(e) => setConc(Number(e.target.value))} disabled={executando}
            style={{ padding: "8px 12px", fontSize: 14, border: "1px solid #ced4da", borderRadius: 6, width: 120 }} />
        </div>
        <button onClick={executar} disabled={executando}
          style={{ padding: "10px 24px", fontSize: 15, cursor: executando ? "not-allowed" : "pointer", background: executando ? "#ccc" : "#0a4554", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}>
          {executando ? "Executando..." : "Iniciar teste"}
        </button>
      </div>
      {log && <pre style={{ padding: 12, background: "#1a1a2e", color: "#0f0", borderRadius: 8, fontSize: 12, maxHeight: 150, overflow: "auto", whiteSpace: "pre-wrap", marginBottom: 16 }}>{log}</pre>}
      {resultado && (
        <div style={{ padding: 20, background: "#f8f9fa", borderRadius: 8, border: "1px solid #dee2e6" }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Resultados</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <InfoBox label="Status" value={resultado.erro === 0 ? "✅ APROVADO" : "⚠️ REPROVADO"} color={resultado.erro === 0 ? "#198754" : "#dc3545"} />
            <InfoBox label="Requisições" value={`${resultado.sucesso} ✅ / ${resultado.erro} ❌`} />
            <InfoBox label="Erros unique" value={String(resultado.uniqueConstraintErrors)} />
            <InfoBox label="Tempo total" value={`${resultado.tempoTotalSegundos}s`} />
            <InfoBox label="Requests/s" value={resultado.requestsPorSegundo} />
            <InfoBox label="Mín / Máx" value={`${resultado.min}ms / ${resultado.max}ms`} />
            <InfoBox label="Média" value={`${resultado.media}ms`} />
            <InfoBox label="P95 / P99" value={`${resultado.p95}ms / ${resultado.p99}ms`} />
          </div>
          {resultado.erro > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#dc3545", marginBottom: 8 }}>Erros ({resultado.primeirosErros.length})</h3>
              <pre style={{ padding: 12, background: "#fff3f3", borderRadius: 8, fontSize: 11, maxHeight: 150, overflow: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(resultado.primeirosErros, null, 2)}</pre>
            </>
          )}
          <p style={{ fontSize: 11, color: "#888", marginTop: 12 }}>
            * Likes criados durante o teste foram automaticamente removidos.
            {resultado.uniqueConstraintErrors > 0 && " Erros de unique constraint são esperados quando o mesmo usuário curte duas vezes."}
          </p>
        </div>
      )}
    </div>
  )
}

function InfoBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6, border: "1px solid #dee2e6" }}>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || "#212529" }}>{value}</div>
    </div>
  )
}

function percentil(valores: number[], p: number): number {
  if (!valores.length) return 0
  const sorted = [...valores].sort((a, b) => a - b)
  return sorted[Math.floor((p / 100) * sorted.length)] || 0
}
