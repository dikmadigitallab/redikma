"use client"

import { useState, useRef } from "react"

type Scenario =
  | "feedData"
  | "viewComments"
  | "likePost"
  | "unlikePost"
  | "addComment"

const SCENARIO_LABELS: Record<Scenario, string> = {
  feedData: "Feed Consolidado",
  viewComments: "Visualizar Comentários",
  likePost: "Curtir Post",
  unlikePost: "Descurtir Post",
  addComment: "Adicionar Comentário",
}

const SCENARIO_WEIGHTS: { scenario: Scenario; weight: number }[] = [
  { scenario: "feedData", weight: 30 },
  { scenario: "viewComments", weight: 30 },
  { scenario: "likePost", weight: 15 },
  { scenario: "unlikePost", weight: 15 },
  { scenario: "addComment", weight: 10 },
]

interface DetalheErro {
  indice: number
  scenario: Scenario
  mensagem: string
  requestTime: string
}

interface ResCenario {
  sucesso: number
  erro: number
  total: number
  media: string
}

interface Resultado {
  sucesso: number
  erro: number
  total: number
  tempoTotalSegundos: string
  requestsPorSegundo: string
  min: string
  max: string
  media: string
  p95: string
  p99: string
  porCenario: Record<string, ResCenario>
  primeirosErros: DetalheErro[]
  cenariosExecutados: string
}

function pickScenario(): Scenario {
  const totalWeight = SCENARIO_WEIGHTS.reduce((a, s) => a + s.weight, 0)
  let r = Math.random() * totalWeight
  for (const s of SCENARIO_WEIGHTS) {
    r -= s.weight
    if (r <= 0) return s.scenario
  }
  return SCENARIO_WEIGHTS[SCENARIO_WEIGHTS.length - 1].scenario
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatar(valor: number): string {
  return valor.toFixed(2)
}

function calcularPercentil(valores: number[], percentil: number): number {
  if (valores.length === 0) return 0
  const ordenados = [...valores].sort((a, b) => a - b)
  const idx = Math.floor((percentil / 100) * ordenados.length)
  return ordenados[Math.min(idx, ordenados.length - 1)]
}

type PostInfo = { id: string; authorId: string }

export default function PageTesteCarga() {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [executando, setExecutando] = useState(false)
  const [log, setLog] = useState("")
  const [totalRequisicoes, setTotalRequisicoes] = useState(500)
  const [concorrencia, setConcorrencia] = useState(50)
  const abortRef = useRef(false)

  function addLog(msg: string) {
    setLog((prev) => prev + msg + "\n")
  }

  async function executarTeste() {
    setExecutando(true)
    setResultado(null)
    setLog("")
    abortRef.current = false

    addLog("Buscando posts e usuários válidos...")

    let posts: PostInfo[] = []
    let userIds: string[] = []

    try {
      const res = await fetch("/api/posts", { cache: "no-store" })
      const data = await res.json()
      const arr: any[] = Array.isArray(data) ? data : data?.posts ?? []

      posts = arr.map((p: any) => ({
        id: p.id,
        authorId: p.author?.id,
      }))

      const uniqueAuthors = new Set<string>()
      for (const p of posts) {
        if (p.authorId) uniqueAuthors.add(p.authorId)
      }
      userIds = [...uniqueAuthors]

      addLog(
        `  Posts encontrados: ${posts.length}, usuários válidos: ${userIds.length}`
      )
    } catch (e) {
      addLog(`  ERRO ao buscar posts: ${e}`)
      setExecutando(false)
      return
    }

    if (posts.length === 0) {
      addLog("  Nenhum post encontrado. Abortando.")
      setExecutando(false)
      return
    }

    if (userIds.length === 0) {
      addLog("  Nenhum usuário válido encontrado. Abortando.")
      setExecutando(false)
      return
    }

    addLog(`Iniciando teste: ${totalRequisicoes} requisições, ${concorrencia} concorrência (${Math.ceil(totalRequisicoes / concorrencia)} req/worker)...`)

    let sucesso = 0
    let erro = 0
    let contadorGlobal = 0

    const tempos: number[] = []
    const primeirosErros: DetalheErro[] = []
    const cenarios: Record<string, number[]> = {
      feedData: [],
      viewComments: [],
      likePost: [],
      unlikePost: [],
      addComment: [],
    }

    async function executarRequisicao(): Promise<void> {
      if (abortRef.current) return

      const indice = ++contadorGlobal
      const scenario = pickScenario()
      const post = pickRandom(posts)
      const userId = pickRandom(userIds)

      const inicio = performance.now()

      try {
        let ok = false

        switch (scenario) {
          case "feedData": {
            const r = await fetch("/api/posts/feed-data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                postIds: posts.map((p) => p.id),
                userId,
              }),
            })
            ok = r.ok
            break
          }

          case "viewComments": {
            const r = await fetch(
              `/api/posts/posts-comments?postId=${post.id}`,
              { cache: "no-store" }
            )
            ok = r.ok
            break
          }

          case "likePost": {
            const r = await fetch("/api/posts/posts-likes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId: post.id, userId }),
            })
            ok = r.ok
            break
          }

          case "unlikePost": {
            const r = await fetch("/api/posts/posts-likes", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId: post.id, userId }),
            })
            ok = r.ok
            break
          }

          case "addComment": {
            const r = await fetch("/api/posts/posts-comments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                texto: `[TESTE-CARGA] Comentário de teste #${indice}`,
                postId: post.id,
                authorId: userId,
              }),
            })
            ok = r.ok
            break
          }
        }

        const fim = performance.now()
        const elapsed = fim - inicio
        tempos.push(elapsed)
        cenarios[scenario].push(elapsed)

        if (ok) {
          sucesso++
        } else {
          erro++
          if (primeirosErros.length < 20) {
            primeirosErros.push({
              indice,
              scenario,
              mensagem: "Resposta com erro",
              requestTime: formatar(elapsed),
            })
          }
        }
      } catch (e) {
        const fim = performance.now()
        const elapsed = fim - inicio
        tempos.push(elapsed)
        erro++

        if (primeirosErros.length < 20) {
          primeirosErros.push({
            indice,
            scenario,
            mensagem: e instanceof Error ? e.message : "Erro desconhecido",
            requestTime: formatar(elapsed),
          })
        }
      }
    }

    async function worker(total: number): Promise<void> {
      for (let i = 0; i < total; i++) {
        await executarRequisicao()
      }
    }

    const inicioTeste = performance.now()

    const porWorker = Math.floor(totalRequisicoes / concorrencia)
    const resto = totalRequisicoes % concorrencia

    const workers: Promise<void>[] = []
    for (let i = 0; i < concorrencia; i++) {
      workers.push(worker(i < resto ? porWorker + 1 : porWorker))
    }

    await Promise.all(workers)

    const fimTeste = performance.now()
    const duracaoSegundos = (fimTeste - inicioTeste) / 1000
    const totalExec = sucesso + erro

    const min = tempos.length ? Math.min(...tempos) : 0
    const max = tempos.length ? Math.max(...tempos) : 0
    const media = tempos.length
      ? tempos.reduce((a, v) => a + v, 0) / tempos.length
      : 0

    const porCenario: Record<string, ResCenario> = {}
    for (const [cenario, ts] of Object.entries(cenarios)) {
      const totalCenario = ts.length
      const errosCenario =
        cenario === "feedData"
          ? 0
          : Math.max(0, Math.round(totalRequisicoes * (erro / totalExec) * (ts.length / tempos.length)))

      porCenario[SCENARIO_LABELS[cenario as Scenario]] = {
        sucesso: totalCenario,
        erro: 0,
        total: totalCenario,
        media: ts.length ? formatar(ts.reduce((a, v) => a + v, 0) / ts.length) : "0",
      }
    }

    const result: Resultado = {
      sucesso,
      erro,
      total: totalExec,
      tempoTotalSegundos: formatar(duracaoSegundos),
      requestsPorSegundo: formatar(totalExec / duracaoSegundos),
      min: formatar(min),
      max: formatar(max),
      media: formatar(media),
      p95: formatar(calcularPercentil(tempos, 95)),
      p99: formatar(calcularPercentil(tempos, 99)),
      porCenario,
      primeirosErros,
      cenariosExecutados: SCENARIO_WEIGHTS.map(
        (s) => `${SCENARIO_LABELS[s.scenario]} (${s.weight}%)`
      ).join(", "),
    }

    setResultado(result)
    setExecutando(false)
    addLog("Teste concluído!")
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Teste de Carga - Curtidas e Comentários
      </h1>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 16,
          alignItems: "end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "#666",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Requisições
          </label>
          <input
            type="number"
            min={1}
            value={totalRequisicoes}
            onChange={(e) =>
              setTotalRequisicoes(Number(e.target.value))
            }
            disabled={executando}
            style={{
              padding: "8px 12px",
              fontSize: 14,
              border: "1px solid #ced4da",
              borderRadius: 6,
              width: 120,
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "#666",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Concorrência
          </label>
          <input
            type="number"
            min={1}
            value={concorrencia}
            onChange={(e) =>
              setConcorrencia(Number(e.target.value))
            }
            disabled={executando}
            style={{
              padding: "8px 12px",
              fontSize: 14,
              border: "1px solid #ced4da",
              borderRadius: 6,
              width: 120,
            }}
          />
        </div>

        <button
          onClick={executarTeste}
          disabled={executando}
          style={{
            padding: "10px 24px",
            fontSize: 15,
            cursor: executando ? "not-allowed" : "pointer",
            background: executando ? "#ccc" : "#0a4554",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {executando ? "Executando..." : "Iniciar teste"}
        </button>
      </div>

      {log && (
        <pre
          style={{
            padding: 12,
            background: "#1a1a2e",
            color: "#0f0",
            borderRadius: 8,
            fontSize: 12,
            maxHeight: 200,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {log}
        </pre>
      )}

      {resultado && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#f8f9fa",
            borderRadius: 8,
            border: "1px solid #dee2e6",
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Resultados</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <InfoBox
              label="Status"
              value={
                resultado.erro === 0
                  ? "✅ APROVADO"
                  : "❌ REPROVADO"
              }
              color={
                resultado.erro === 0
                  ? "#198754"
                  : "#dc3545"
              }
            />
            <InfoBox
              label="Requisições"
              value={`${resultado.sucesso} ✅ / ${resultado.erro} ❌`}
            />
            <InfoBox
              label="Total"
              value={String(resultado.total)}
            />
            <InfoBox
              label="Tempo total"
              value={`${resultado.tempoTotalSegundos}s`}
            />
            <InfoBox
              label="Requests/s"
              value={resultado.requestsPorSegundo}
            />
            <InfoBox
              label="Mín / Máx"
              value={`${resultado.min}ms / ${resultado.max}ms`}
            />
            <InfoBox
              label="Média"
              value={`${resultado.media}ms`}
            />
            <InfoBox
              label="P95 / P99"
              value={`${resultado.p95}ms / ${resultado.p99}ms`}
            />
          </div>

          <h3 style={{ fontSize: 14, marginBottom: 8, fontWeight: 600 }}>
            Por cenário
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <thead>
              <tr style={{ background: "#e9ecef" }}>
                <th style={thStyle}>Cenário</th>
                <th style={thStyle}>Req</th>
                <th style={thStyle}>Média (ms)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resultado.porCenario).map(
                ([nome, dados]) => (
                  <tr key={nome}>
                    <td style={tdStyle}>{nome}</td>
                    <td style={tdStyle}>{dados.total}</td>
                    <td style={tdStyle}>{dados.media}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <p style={{ fontSize: 11, color: "#666" }}>
            Cenários executados: {resultado.cenariosExecutados}
          </p>

          {resultado.erro > 0 && (
            <>
              <h3
                style={{
                  fontSize: 14,
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "#dc3545",
                }}
              >
                Primeiros erros ({resultado.primeirosErros.length})
              </h3>
              <pre
                style={{
                  padding: 12,
                  background: "#fff3f3",
                  borderRadius: 8,
                  fontSize: 11,
                  overflow: "auto",
                  maxHeight: 200,
                  whiteSpace: "pre-wrap",
                }}
              >
                {JSON.stringify(resultado.primeirosErros, null, 2)}
              </pre>
            </>
          )}

          <p style={{ fontSize: 11, color: "#888", marginTop: 12 }}>
            * Comentários criados com prefixo [TESTE-CARGA] podem ser
            removidos manualmente.
          </p>
        </div>
      )}
    </div>
  )
}

function InfoBox({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div
      style={{
        padding: "8px 12px",
        background: "#fff",
        borderRadius: 6,
        border: "1px solid #dee2e6",
      }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{ fontSize: 16, fontWeight: 700, color: color || "#212529" }}
      >
        {value}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: "6px 10px",
  textAlign: "left",
  borderBottom: "2px solid #dee2e6",
}

const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid #dee2e6",
}
