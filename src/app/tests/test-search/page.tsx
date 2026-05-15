"use client"

import { useState, useRef } from "react"

const SEARCH_TERMS = [
  "comunicado",
  "aniversário",
  "importante",
  "aviso",
  "reunião",
  "novidade",
  "parabéns",
  "urgente",
  "resultado",
  "xxxxxxxxxxx",
]

interface DetalheErro {
  indice: number
  termo: string
  mensagem: string
  requestTime: string
}

function formatar(v: number): string {
  return v.toFixed(2)
}

function percentil(valores: number[], p: number): number {
  if (!valores.length) return 0
  const sorted = [...valores].sort((a, b) => a - b)
  return sorted[Math.floor((p / 100) * sorted.length)] || 0
}

export default function TestSearch() {
  const [totalReq, setTotalReq] = useState(500)
  const [conc, setConc] = useState(50)
  const [executando, setExecutando] = useState(false)
  const [log, setLog] = useState("")
  const [resultado, setResultado] = useState<any>(null)
  const abortRef = useRef(false)

  function addLog(msg: string) {
    setLog((prev) => prev + msg + "\n")
  }

  async function executar() {
    setExecutando(true)
    setResultado(null)
    setLog("")
    abortRef.current = false

    addLog(`Testando: ${totalReq} buscas, ${conc} conc, ${SEARCH_TERMS.length} termos diferentes...`)

    let sucesso = 0, erro = 0, contador = 0
    const tempos: number[] = []
    const errosDetalhe: DetalheErro[] = []
    const termosUsados: string[] = []

    async function req(): Promise<void> {
      if (abortRef.current) return
      const idx = ++contador
      const termo = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)]
      const inicio = performance.now()
      try {
        const r = await fetch(`/api/search-posts?q=${encodeURIComponent(termo)}`, { cache: "no-store" })
        const elapsed = performance.now() - inicio
        tempos.push(elapsed)
        if (r.ok) { sucesso++; termosUsados.push(termo) }
        else { erro++; if (errosDetalhe.length < 20) errosDetalhe.push({ indice: idx, termo, mensagem: `HTTP ${r.status}`, requestTime: formatar(elapsed) }) }
      } catch (e) {
        const elapsed = performance.now() - inicio
        tempos.push(elapsed)
        erro++
        if (errosDetalhe.length < 20) errosDetalhe.push({ indice: idx, termo, mensagem: e instanceof Error ? e.message : "Erro", requestTime: formatar(elapsed) })
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

    setResultado({
      sucesso, erro, total: totalExec,
      tempoTotalSegundos: formatar(duracao),
      requestsPorSegundo: formatar(totalExec / duracao),
      min: formatar(min), max: formatar(max),
      media: formatar(media),
      p95: formatar(percentil(tempos, 95)),
      p99: formatar(percentil(tempos, 99)),
      termosUsados: [...new Set(termosUsados)].length,
      primeirosErros: errosDetalhe,
    })

    setExecutando(false)
    addLog("Concluído!")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Teste de Carga - Busca</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Consultas concorrentes em /api/search-posts com termos variados. Testa full table scan com 3x <code>contains insensitive</code>.
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
      <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
        Termos de busca: {SEARCH_TERMS.join(", ")}
      </div>
      {log && <pre style={{ padding: 12, background: "#1a1a2e", color: "#0f0", borderRadius: 8, fontSize: 12, maxHeight: 150, overflow: "auto", whiteSpace: "pre-wrap", marginBottom: 16 }}>{log}</pre>}
      {resultado && (
        <div style={{ padding: 20, background: "#f8f9fa", borderRadius: 8, border: "1px solid #dee2e6" }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Resultados</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <InfoBox label="Status" value={resultado.erro === 0 ? "✅ APROVADO" : "❌ REPROVADO"} color={resultado.erro === 0 ? "#198754" : "#dc3545"} />
            <InfoBox label="Requisições" value={`${resultado.sucesso} ✅ / ${resultado.erro} ❌`} />
            <InfoBox label="Total" value={String(resultado.total)} />
            <InfoBox label="Termos usados" value={String(resultado.termosUsados)} />
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
