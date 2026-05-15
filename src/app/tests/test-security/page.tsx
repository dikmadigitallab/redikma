"use client"

import { useState, useEffect, useRef } from "react"

interface TestCase {
  id: string
  category: string
  title: string
  description: string
  method: string
  url: string
  headers?: Record<string, string>
  body?: any
  expectedBlock: boolean
  expectedStatusMin?: number
  expectedStatusMax?: number
}

interface TestResult {
  id: string
  status: "pending" | "running" | "ok" | "fail" | "error"
  statusCode?: number
  responseBody?: string
  responseTime?: string
  message: string
}

const TEST_CASES: TestCase[] = [
  // ── Role Enforcement ──
  {
    id: "role-list-users",
    category: "Role Enforcement",
    title: "Listar usuários (requer ADMIN)",
    description: "Tenta acessar GET /api/usuarios sem role ADMIN — deve retornar 401",
    method: "GET",
    url: "/api/usuarios",
    expectedBlock: true,
  },
  {
    id: "role-create-user",
    category: "Role Enforcement",
    title: "Criar usuário (requer ADMIN)",
    description: "Tenta criar usuário via POST /api/usuarios/criar sem role ADMIN — deve retornar 401",
    method: "POST",
    url: "/api/usuarios/criar",
    body: { nome: "invasor", cpf: "00000000000", cargo: "COMMON" },
    expectedBlock: true,
  },
  {
    id: "role-batch-import",
    category: "Role Enforcement",
    title: "Importar lote (requer ADMIN)",
    description: "Tenta importar usuários em lote sem role ADMIN — deve retornar 401",
    method: "POST",
    url: "/api/usuarios/criar/lote",
    body: { usuarios: [] },
    expectedBlock: true,
  },
  {
    id: "role-manager-get",
    category: "Role Enforcement",
    title: "Gerenciar usuários GET (requer ADMIN)",
    description: "Tenta acessar GET /api/usuarios/manager sem role ADMIN — deve retornar 401",
    method: "GET",
    url: "/api/usuarios/manager",
    expectedBlock: true,
  },
  {
    id: "role-manager-put",
    category: "Role Enforcement",
    title: "Gerenciar usuários PUT (requer ADMIN)",
    description: "Tenta alterar usuário via PUT /api/usuarios/manager sem role ADMIN — deve retornar 401",
    method: "PUT",
    url: "/api/usuarios/manager",
    body: { id: "fake-id", nome: "hacker" },
    expectedBlock: true,
  },
  {
    id: "role-manager-delete",
    category: "Role Enforcement",
    title: "Gerenciar usuários DELETE (requer ADMIN)",
    description: "Tenta deletar usuário via DELETE /api/usuarios/manager sem role ADMIN — deve retornar 401",
    method: "DELETE",
    url: "/api/usuarios/manager",
    body: { id: "fake-id" },
    expectedBlock: true,
  },

  // ── IDOR / Permission Escalation ──
  {
    id: "idor-delete-other-post",
    category: "IDOR / Permissão",
    title: "Deletar post de outro usuário",
    description: "Tenta deletar um post que não é seu via DELETE /api/posts — deve retornar 403",
    method: "DELETE",
    url: "/api/posts?postId=TARGET_POST_ID",
    expectedBlock: true,
  },
  {
    id: "idor-delete-other-comment",
    category: "IDOR / Permissão",
    title: "Deletar comentário de outro usuário",
    description: "Tenta deletar um comentário que não é seu — deve retornar 403 (a menos que seja admin ou autor do post)",
    method: "DELETE",
    url: "/api/posts/posts-comments",
    body: { id: "TARGET_COMMENT_ID" },
    expectedBlock: true,
  },
  {
    id: "idor-force-role-change",
    category: "IDOR / Permissão",
    title: "Forçar alteração de própria role",
    description: "Tenta alterar a própria role para ADMIN via PUT /api/usuarios/manager — deve retornar 401",
    method: "PUT",
    url: "/api/usuarios/manager",
    body: { id: "SELF_ID", role: "ADMIN" },
    expectedBlock: true,
  },

  // ── Input Injection ──
  {
    id: "inject-sql-search",
    category: "Input Injection",
    title: "SQL Injection na busca",
    description: "Tenta injetar SQL em /api/search-posts — o sistema não deve executar",
    method: "GET",
    url: "/api/search-posts?q=' OR 1=1; DROP TABLE \"User\"; --",
    expectedBlock: false,
    expectedStatusMin: 200,
    expectedStatusMax: 400,
  },
  {
    id: "inject-xss-comment",
    category: "Input Injection",
    title: "XSS em comentário",
    description: "Tenta injetar script em um comentário — o texto deve ser armazenado como string, não executado",
    method: "POST",
    url: "/api/posts/posts-comments",
    body: { texto: "<script>alert('XSS')</script>", postId: "POST_ID", authorId: "USER_ID" },
    expectedBlock: false,
    expectedStatusMin: 200,
    expectedStatusMax: 201,
  },
  {
    id: "inject-sql-like",
    category: "Input Injection",
    title: "SQL Injection no like",
    description: "Tenta injetar SQL nos parâmetros do like",
    method: "POST",
    url: "/api/posts/posts-likes",
    body: { postId: "'; DELETE FROM \"User\"; --", userId: "'; DROP TABLE \"Like\"; --" },
    expectedBlock: true,
  },

  // ── Mass Assignment / Extra Fields ──
  {
    id: "mass-assign-comment",
    category: "Mass Assignment",
    title: "Campos extras em comentário",
    description: "Envia campos inesperados no POST de comentário — o servidor deve ignorá-los",
    method: "POST",
    url: "/api/posts/posts-comments",
    body: { texto: "teste", postId: "POST_ID", authorId: "USER_ID", role: "ADMIN", isAdmin: true, senha: "123" },
    expectedBlock: false,
    expectedStatusMin: 200,
    expectedStatusMax: 201,
  },
  {
    id: "mass-assign-like",
    category: "Mass Assignment",
    title: "Campos extras no like",
    description: "Envia campos inesperados no like — o servidor deve ignorá-los",
    method: "POST",
    url: "/api/posts/posts-likes",
    body: { postId: "POST_ID", userId: "USER_ID", role: "ADMIN", isAdmin: true },
    expectedBlock: false,
    expectedStatusMin: 200,
    expectedStatusMax: 201,
  },

  // ── Unauthenticated Access ──
  {
    id: "noauth-profile",
    category: "Acesso sem Auth",
    title: "Perfil sem autenticação",
    description: "Tenta acessar GET /api/users/profile — deve retornar 401 se não autenticado",
    method: "GET",
    url: "/api/users/profile",
    expectedBlock: true,
  },
  {
    id: "noauth-notifications",
    category: "Acesso sem Auth",
    title: "Notificações de outro usuário",
    description: "Tenta ler notificações de outro usuário alterando o userId",
    method: "GET",
    url: "/api/notifications?userId=OTHER_USER_ID",
    expectedBlock: false,
    expectedStatusMin: 200,
    expectedStatusMax: 200,
  },

  // ── Admin deletion bug ──
  {
    id: "admin-delete-post",
    category: "Bugs Conhecidos",
    title: "Admin deletar post (bug isAdmin=false)",
    description: "Testa se o bug isAdmin=false em posts/route.ts impede admins de deletar posts alheios",
    method: "DELETE",
    url: "/api/posts?postId=SOME_POST_ID",
    expectedBlock: true,
  },
]

export default function TestSecurityPage() {
  const [session, setSession] = useState<any>(null)
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [log, setLog] = useState("")
  const [executando, setExecutando] = useState<string | null>(null)
  const [targetPostId, setTargetPostId] = useState("")
  const [targetCommentId, setTargetCommentId] = useState("")
  const [otherUserId, setOtherUserId] = useState("")

  // Custom request builder
  const [customMethod, setCustomMethod] = useState("GET")
  const [customUrl, setCustomUrl] = useState("/api/")
  const [customHeaders, setCustomHeaders] = useState("")
  const [customBody, setCustomBody] = useState("")
  const [customResult, setCustomResult] = useState<any>(null)
  const [customLoading, setCustomLoading] = useState(false)

  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setLog((p) => p + "Erro ao obter sessão\n"))
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  function addLog(msg: string) {
    setLog((prev) => prev + `[${new Date().toLocaleTimeString()}] ${msg}\n`)
  }

  function resolveVals(tc: TestCase) {
    let url = tc.url
    let body = tc.body ? { ...tc.body } : undefined
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string") {
          if (v === "TARGET_POST_ID" && targetPostId) body[k] = targetPostId
          else if (v === "TARGET_COMMENT_ID" && targetCommentId) body[k] = targetCommentId
          else if (v === "SELF_ID" && session?.user?.id) body[k] = session.user.id
          else if (v === "OTHER_USER_ID" && otherUserId) body[k] = otherUserId
          else if (v === "USER_ID" && session?.user?.id) body[k] = session.user.id
          else if (v === "POST_ID" && targetPostId) body[k] = targetPostId
        }
      }
    }
    if (url.includes("TARGET_POST_ID") && targetPostId) url = url.replace("TARGET_POST_ID", targetPostId)
    if (url.includes("SOME_POST_ID") && targetPostId) url = url.replace("SOME_POST_ID", targetPostId)
    if (url.includes("OTHER_USER_ID") && otherUserId) url = url.replace("OTHER_USER_ID", otherUserId)
    return { url, body }
  }

  async function runTest(tc: TestCase) {
    setExecutando(tc.id)
    setResults((prev) => ({
      ...prev,
      [tc.id]: { id: tc.id, status: "running", message: "Executando..." },
    }))

    const { url, body } = resolveVals(tc)
    const inicio = performance.now()

    try {
      const opts: RequestInit = { method: tc.method, headers: { "Content-Type": "application/json" } }
      if (body && ["POST", "PUT", "DELETE"].includes(tc.method)) opts.body = JSON.stringify(body)

      const res = await fetch(url, opts)
      const elapsed = (performance.now() - inicio).toFixed(0)
      let responseBody = ""
      try {
        responseBody = JSON.stringify(await res.json(), null, 2)
      } catch {
        responseBody = await res.text().catch(() => "(empty)")
      }

      const statusOk = tc.expectedBlock
        ? res.status >= 400
        : res.status >= (tc.expectedStatusMin || 200) && res.status <= (tc.expectedStatusMax || 399)

      const status: "ok" | "fail" = statusOk ? "ok" : "fail"
      const msg = tc.expectedBlock
        ? `Bloqueado (HTTP ${res.status}) — ${status === "ok" ? "✅ Comportamento esperado" : "❌ Era esperado bloqueio"}`
        : `Aceito (HTTP ${res.status}) — ${status === "ok" ? "✅ Comportamento esperado" : "❌ Resposta inesperada"}`

      addLog(`${status === "ok" ? "✅" : "❌"} ${tc.title}: ${msg}`)
      setResults((prev) => ({
        ...prev,
        [tc.id]: { id: tc.id, status, statusCode: res.status, responseBody, responseTime: elapsed, message: msg },
      }))
    } catch (e) {
      const elapsed = (performance.now() - inicio).toFixed(0)
      const msg = e instanceof Error ? e.message : "Erro de rede"
      addLog(`❌ ${tc.title}: ${msg}`)
      setResults((prev) => ({
        ...prev,
        [tc.id]: { id: tc.id, status: "error", message: msg, responseTime: elapsed },
      }))
    }

    setExecutando(null)
  }

  async function runAll() {
    addLog("=== Executando TODOS os testes de segurança ===")
    const required = ["targetPostId", "targetCommentId", "otherUserId"]
    const missing = required.filter((k) => {
      if (k === "targetPostId") return !targetPostId
      if (k === "targetCommentId") return !targetCommentId
      if (k === "otherUserId") return !otherUserId
      return false
    })
    if (missing.length > 0) {
      addLog(`⚠️  Preencha os campos obrigatórios: ${missing.join(", ")}`)
      return
    }

    for (const tc of TEST_CASES) {
      if (executando) break
      await runTest(tc)
    }
    addLog("=== Todos os testes concluídos ===")
  }

  async function sendCustom() {
    setCustomLoading(true)
    setCustomResult(null)
    const inicio = performance.now()
    try {
      let headers: Record<string, string> = { "Content-Type": "application/json" }
      if (customHeaders.trim()) {
        for (const line of customHeaders.split("\n")) {
          const [k, ...v] = line.split(":")
          if (k && v.length) headers[k.trim()] = v.join(":").trim()
        }
      }
      const opts: RequestInit = { method: customMethod, headers }
      if (["POST", "PUT", "PATCH"].includes(customMethod) && customBody.trim()) {
        try {
          opts.body = JSON.stringify(JSON.parse(customBody))
        } catch {
          opts.body = customBody
        }
      }
      const res = await fetch(customUrl, opts)
      const elapsed = (performance.now() - inicio).toFixed(0)
      let body = ""
      try {
        body = JSON.stringify(await res.json(), null, 2)
      } catch {
        body = await res.text().catch(() => "(empty)")
      }
      setCustomResult({ statusCode: res.status, body, time: elapsed })
      addLog(`📡 Custom ${customMethod} ${customUrl} → HTTP ${res.status} (${elapsed}ms)`)
    } catch (e) {
      setCustomResult({ error: e instanceof Error ? e.message : "Erro de rede" })
      addLog(`📡 Custom ${customMethod} ${customUrl} → ERRO: ${e}`)
    }
    setCustomLoading(false)
  }

  const categories = [...new Set(TEST_CASES.map((t) => t.category))]
  const passed = Object.values(results).filter((r) => r.status === "ok").length
  const failed = Object.values(results).filter((r) => r.status === "fail").length
  const total = Object.values(results).length

  return (
    <div style={{ padding: 28, maxWidth: 1100, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8, color: "#b91c1c" }}>Teste de Segurança</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
        Tenta quebrar o sistema: role enforcement, IDOR, injeção, mass assignment, bugs conhecidos.
      </p>

      {/* Session Info */}
      <div
        style={{
          padding: "10px 16px",
          background: "#f0f4ff",
          borderRadius: 8,
          border: "1px solid #c7d2fe",
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        <strong>Sessão atual:</strong>{" "}
        {session
          ? `${session.user?.nome} — role: ${session.user?.role} — id: ${session.user?.id}`
          : "Carregando..."}
      </div>

      {/* Required IDs */}
      <div
        style={{
          padding: 16,
          background: "#fff7ed",
          borderRadius: 8,
          border: "1px solid #fed7aa",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "end",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a3412", marginBottom: 2 }}>
            Post alvo (ID)
          </label>
          <input
            value={targetPostId}
            onChange={(e) => setTargetPostId(e.target.value)}
            placeholder="uuid do post"
            style={{ padding: "6px 10px", fontSize: 13, border: "1px solid #fed7aa", borderRadius: 6, width: 200 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a3412", marginBottom: 2 }}>
            Comentário alvo (ID)
          </label>
          <input
            value={targetCommentId}
            onChange={(e) => setTargetCommentId(e.target.value)}
            placeholder="uuid do comentário"
            style={{ padding: "6px 10px", fontSize: 13, border: "1px solid #fed7aa", borderRadius: 6, width: 200 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9a3412", marginBottom: 2 }}>
            Outro usuário (ID)
          </label>
          <input
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
            placeholder="uuid de outro usuário"
            style={{ padding: "6px 10px", fontSize: 13, border: "1px solid #fed7aa", borderRadius: 6, width: 200 }}
          />
        </div>
      </div>

      {/* Summary + Legend */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
          alignItems: "start",
        }}
      >
        {total > 0 && (
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: failed === 0 ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${failed === 0 ? "#a7f3d0" : "#fecaca"}`,
              fontSize: 14,
              fontWeight: 600,
              color: failed === 0 ? "#065f46" : "#991b1b",
            }}
          >
            {passed}/{total} passaram, {failed} falharam
            {failed === 0 && total > 0 ? " ✅ Nenhuma vulnerabilidade detectada" : ""}
          </div>
        )}
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <strong>Legenda:</strong><br />
          <span style={{ color: "#16a34a" }}>✅ PASSOU</span> = O sistema se comportou <strong>como esperado</strong> (bloqueou o que deveria bloquear, permitiu o que deveria permitir)<br />
          <span style={{ color: "#dc2626" }}>❌ FALHOU</span> = O sistema se comportou <strong>diferente do esperado</strong> (vulnerabilidade potencial)<br />
          <span style={{ color: "#6b7280" }}>⚠️ ERRO</span> = A requisição falhou por erro de rede ou exceção não tratada
        </div>
      </div>

      {/* Run All */}
      <button
        onClick={runAll}
        disabled={!!executando}
        style={{
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 700,
          cursor: executando ? "not-allowed" : "pointer",
          background: executando ? "#ccc" : "#b91c1c",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        {executando ? "Executando..." : "▶ Executar todos os testes"}
      </button>

      {/* Test Categories */}
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#b91c1c",
              marginBottom: 8,
              paddingBottom: 4,
              borderBottom: "2px solid #fecaca",
            }}
          >
            {cat}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TEST_CASES.filter((t) => t.category === cat).map((tc) => {
              const res = results[tc.id]
              return (
                <div
                  key={tc.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${
                      res?.status === "ok"
                        ? "#a7f3d0"
                        : res?.status === "fail"
                          ? "#fecaca"
                          : "#e5e7eb"
                    }`,
                    background:
                      res?.status === "ok"
                        ? "#f0fdf4"
                        : res?.status === "fail"
                          ? "#fef2f2"
                          : "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14, flex: 1, minWidth: 180 }}>{tc.title}</strong>
                    <code style={{ fontSize: 11, color: "#666" }}>
                      {tc.method} {tc.url.length > 50 ? tc.url.substring(0, 50) + "..." : tc.url}
                    </code>
                    <button
                      onClick={() => runTest(tc)}
                      disabled={executando === tc.id}
                      style={{
                        padding: "4px 12px",
                        fontSize: 12,
                        cursor: executando === tc.id ? "not-allowed" : "pointer",
                        background: executando === tc.id ? "#ccc" : "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: 5,
                        flexShrink: 0,
                      }}
                    >
                      {executando === tc.id ? "..." : "Testar"}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0 0" }}>{tc.description}</p>
                  {res && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "6px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        background: res.status === "error" ? "#fef2f2" : "#f9fafb",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              res.status === "ok"
                                ? "#16a34a"
                                : res.status === "fail"
                                  ? "#dc2626"
                                  : "#6b7280",
                            fontSize: 13,
                          }}
                        >
                          {res.status === "ok"
                            ? "✅ PASSOU"
                            : res.status === "fail"
                              ? "❌ FALHOU"
                              : res.status === "running"
                                ? "⏳"
                                : "⚠️ ERRO"}
                        </span>
                        <span style={{ fontSize: 12, color: "#666" }}>
                          Esperado: <strong>{tc.expectedBlock ? "🚫 BLOQUEAR (4xx)" : "✅ PERMITIR (2xx)"}</strong>
                        </span>
                        <span style={{ fontSize: 12, color: "#666" }}>
                          · HTTP <strong style={{ color: res.statusCode && res.statusCode >= 400 ? "#dc2626" : "#16a34a" }}>{res.statusCode || "—"}</strong>
                        </span>
                        <span style={{ fontSize: 12, color: "#666" }}>
                          · {res.responseTime || "—"}ms
                        </span>
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        {tc.expectedBlock
                          ? res.statusCode && res.statusCode >= 400
                            ? "✅ Sistema bloqueou corretamente o acesso não autorizado"
                            : "❌ Sistema PERMITIU o acesso quando deveria ter BLOQUEADO — vulnerabilidade!"
                          : res.statusCode && res.statusCode >= 200 && res.statusCode < 400
                            ? "✅ Sistema permitiu o acesso conforme esperado"
                            : "❌ Sistema retornou erro inesperado para uma requisição válida"}
                      </div>
                      {res.responseBody && res.status === "fail" && (
                        <pre
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            maxHeight: 120,
                            overflow: "auto",
                            background: "#1a1a2e",
                            color: "#0f0",
                            padding: 6,
                            borderRadius: 4,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {res.responseBody}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Custom Request Builder */}
      <div
        style={{
          marginTop: 32,
          padding: 20,
          borderRadius: 10,
          border: "2px dashed #d1d5db",
          background: "#fafafa",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#374151" }}>
          🔧 Construtor de Requisição Personalizada
        </h2>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          Monte qualquer requisição HTTP para testar a API manualmente.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <select
            value={customMethod}
            onChange={(e) => setCustomMethod(e.target.value)}
            style={{ padding: "6px 12px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 6 }}
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="/api/posts"
            style={{ flex: 1, minWidth: 200, padding: "6px 12px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
          <button
            onClick={sendCustom}
            disabled={customLoading}
            style={{
              padding: "6px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: customLoading ? "not-allowed" : "pointer",
              background: customLoading ? "#ccc" : "#374151",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            {customLoading ? "..." : "Enviar"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 2 }}>
              Headers (um por linha: Chave: Valor)
            </label>
            <textarea
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              placeholder='Authorization: Bearer xxx&#10;X-Custom: value'
              rows={4}
              style={{
                width: "100%",
                padding: "6px 10px",
                fontSize: 12,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontFamily: "monospace",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 2 }}>
              Body (JSON)
            </label>
            <textarea
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              style={{
                width: "100%",
                padding: "6px 10px",
                fontSize: 12,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>
        {customResult && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 6,
              background: customResult.error ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${customResult.error ? "#fecaca" : "#a7f3d0"}`,
            }}
          >
            <strong style={{ fontSize: 13 }}>
              HTTP {customResult.statusCode || "ERRO"} ({customResult.time || "—"}ms)
            </strong>
            {customResult.body && (
              <pre
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  maxHeight: 200,
                  overflow: "auto",
                  background: "#1a1a2e",
                  color: "#0f0",
                  padding: 8,
                  borderRadius: 4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {customResult.body}
              </pre>
            )}
            {customResult.error && (
              <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{customResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Log */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#666" }}>Log</h3>
        <div
          ref={logRef}
          style={{
            padding: 10,
            background: "#1a1a2e",
            color: "#0f0",
            borderRadius: 8,
            fontSize: 11,
            maxHeight: 200,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {log || "Nenhum teste executado ainda."}
        </div>
      </div>
    </div>
  )
}
