"use client"

import { useState, useRef } from "react"

const SCENARIOS = [
  { key: "count", label: "GET /api/notifications/count", weight: 50 },
  { key: "list", label: "GET /api/notifications", weight: 50 },
] as const

type ScenarioKey = (typeof SCENARIOS)[number]["key"]

interface DetalheErro {
  indice: number
  scenario: string
  mensagem: string
  requestTime: string
}

function pickScenario(): ScenarioKey {
  const total = SCENARIOS.reduce((a, s) => a + s.weight, 0)
  let r = Math.random() * total
  for (const s of SCENARIOS) {
    r -= s.weight
    if (r <= 0) return s.key
  }
  return SCENARIOS[SCENARIOS.length - 1].key
}

function formatar(v: number): string {
  return v.toFixed(2)
}

function percentil(valores: number[], p: number): number {
  if (!valores.length) return 0
  const sorted = [...valores].sort((a, b) => a - b)
  return sorted[Math.floor((p / 100) * sorted.length)] || 0
}

export default function TestNotifications() {
  const [totalReq, setTotalReq] = useState(500)
  const [conc, setConc] = useState(50)
  const [executando, setExecutando] = useState(false)
  const [log, setLog] = useState("")
  const [resultado, setResultado] = useState<any>(null)
  const abortRef = useRef(false)
  const userIdRef = useRef<string>("")

  function addLog(msg: string) {
    setLog((prev) => prev + msg + "\n")
  }

  async function executar() {
    setExecutando(true)
    setResultado(null)
    setLog("")
    abortRef.current = false

    addLog("Obtendo userId da sessão...")
    try {
      const sesRes = await fetch("/api/auth/session")
      const session = await sesRes.json()
      userIdRef.current = session?.user?.id || ""
      addLog(`  userId: ${userIdRef.current || "NÃO LOGADO (usando requisições sem userId)"}`)
    } catch {
      addLog("  Não foi possível obter sessão")
    }

    addLog(`Testando: ${totalReq} req, ${conc} conc...`)

    let sucesso = 0, erro = 0, contador = 0
    const tempos: number[] = []
    const errosDetalhe: DetalheErro[] = []
    const porCenario: Record<string, number[]> = { count: [], list: [] }

    async function req(): Promise<void> {
      if (abortRef.current) return
      const idx = ++contador
      const sc = pickScenario()
      const inicio = performance.now()
      try {
        let ok = false
        if (sc === "count") {
          const url = userIdRef.current
            ? `/api/notifications/count?userId=${userIdRef.current}`
            : "/api/notifications/count"
          ok = (await fetch(url, { cache: "no-store" })).ok
        } else {
          const url = userIdRef.current
            ? `/api/notifications?userId=${userIdRef.current}`
            : "/api/notifications"
          ok = (await fetch(url, { cache: "no-store" })).ok
        }
        const elapsed = performance.now() - inicio
        tempos.push(elapsed)
        porCenario[sc].push(elapsed)
        if (ok) sucesso++
        else { erro++; if (errosDetalhe.length < 20) errosDetalhe.push({ indice: idx, scenario: sc, mensagem: "Resposta com erro", requestTime: formatar(elapsed) }) }
      } catch (e) {
        const elapsed = performance.now() - inicio
        tempos.push(elapsed)
        erro++
        if (errosDetalhe.length < 20) errosDetalhe.push({ indice: idx, scenario: sc, mensagem: e instanceof Error ? e.message : "Erro", requestTime: formatar(elapsed) })
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

    const cenarioRes: Record<string, any> = {}
    for (const s of SCENARIOS) {
      const ts = porCenario[s.key]
      cenarioRes[s.label] = {
        total: ts.length,
        media: ts.length ? formatar(ts.reduce((a, v) => a + v, 0) / ts.length) : "0",
        min: ts.length ? formatar(Math.min(...ts)) : "0",
        max: ts.length ? formatar(Math.max(...ts)) : "0",
      }
    }

    setResultado({
      sucesso, erro, total: totalExec,
      tempoTotalSegundos: formatar(duracao),
      requestsPorSegundo: formatar(totalExec / duracao),
      min: formatar(min), max: formatar(max),
      media: formatar(media),
      p95: formatar(percentil(tempos, 95)),
      p99: formatar(percentil(tempos, 99)),
      porCenario: cenarioRes,
      primeirosErros: errosDetalhe,
    })

    setExecutando(false)
    addLog("Concluído!")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Teste de Carga - Notificações</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Simula o polling de notificações: GET /api/notifications/count + GET /api/notifications
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
            <InfoBox label="Status" value={resultado.erro === 0 ? "✅ APROVADO" : "❌ REPROVADO"} color={resultado.erro === 0 ? "#198754" : "#dc3545"} />
            <InfoBox label="Requisições" value={`${resultado.sucesso} ✅ / ${resultado.erro} ❌`} />
            <InfoBox label="Total" value={String(resultado.total)} />
            <InfoBox label="Tempo total" value={`${resultado.tempoTotalSegundos}s`} />
            <InfoBox label="Requests/s" value={resultado.requestsPorSegundo} />
            <InfoBox label="Mín / Máx" value={`${resultado.min}ms / ${resultado.max}ms`} />
            <InfoBox label="Média" value={`${resultado.media}ms`} />
            <InfoBox label="P95 / P99" value={`${resultado.p95}ms / ${resultado.p99}ms`} />
          </div>
          <h3 style={{ fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Por cenário</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
            <thead><tr style={{ background: "#e9ecef" }}><th style={thStyle}>Cenário</th><th style={thStyle}>Req</th><th style={thStyle}>Média</th><th style={thStyle}>Mín</th><th style={thStyle}>Máx</th></tr></thead>
            <tbody>{Object.entries(resultado.porCenario).map(([nome, d]: any) => (
              <tr key={nome}><td style={tdStyle}>{nome}</td><td style={tdStyle}>{d.total}</td><td style={tdStyle}>{d.media}ms</td><td style={tdStyle}>{d.min}ms</td><td style={tdStyle}>{d.max}ms</td></tr>
            ))}</tbody>
          </table>
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

const thStyle: React.CSSProperties = { padding: "6px 10px", textAlign: "left", borderBottom: "2px solid #dee2e6" }
const tdStyle: React.CSSProperties = { padding: "6px 10px", borderBottom: "1px solid #dee2e6" }
