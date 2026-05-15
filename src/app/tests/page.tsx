"use client"

import Link from "next/link"

interface TestItem {
  href: string
  title: string
  description: string
  category: "performance" | "integridade" | "edge-case"
}

const tests: TestItem[] = [
  {
    href: "/tests/test-likes-comments",
    title: "Curtidas e Comentários",
    description: "Teste de carga combinado: feed consolidado, visualizar comentários, curtir/descurtir posts, adicionar comentários",
    category: "performance",
  },
  {
    href: "/tests/test-auth",
    title: "Autenticação",
    description: "Teste de carga no login: 500 requisições simultâneas com credenciais CPF + senha",
    category: "performance",
  },
  {
    href: "/tests/test-feed-performance",
    title: "Feed Page",
    description: "Teste de carga no feed principal: GET /api/posts + POST /api/posts/feed-data",
    category: "performance",
  },
  {
    href: "/tests/test-notifications",
    title: "Notificações",
    description: "Teste de carga nas notificações: polling de count + listagem",
    category: "performance",
  },
  {
    href: "/tests/test-likes-mass",
    title: "Like em Massa",
    description: "Muitos usuários curtindo o mesmo post simultaneamente — testa concorrência na unique constraint",
    category: "performance",
  },
  {
    href: "/tests/test-search",
    title: "Busca",
    description: "Teste de carga na busca: consultas concorrentes com termos variados",
    category: "performance",
  },
  {
    href: "/tests/test-comment-cascade",
    title: "Cascade de Comentários",
    description: "Verifica integridade: deletar comentário pai com profundidade > 2 não deve deixar órfãos",
    category: "integridade",
  },
  {
    href: "/tests/test-post-deletion",
    title: "Deleção de Post",
    description: "Verifica integridade: deletar post com comentários aninhados + likes remove tudo",
    category: "integridade",
  },
  {
    href: "/tests/test-like-rollback",
    title: "Rollback de Like",
    description: "Verifica se o frontend trata falha na API após update otimista de like/unlike",
    category: "integridade",
  },
  {
    href: "/tests/test-self-like",
    title: "Auto-Like",
    description: "Verifica edge case: usuário curtir próprio post não deve gerar notificação",
    category: "edge-case",
  },
  {
    href: "/tests/test-security",
    title: "Segurança",
    description: "Testes de role enforcement, IDOR, SQL injection, XSS, mass assignment e bugs conhecidos. Inclui construtor de requisição personalizada.",
    category: "edge-case",
  },
]

const categoryColors: Record<string, string> = {
  performance: "#0a4554",
  integridade: "#2d6a4f",
  "edge-case": "#9c6b1a",
}

const categoryLabels: Record<string, string> = {
  performance: "Performance",
  integridade: "Integridade",
  "edge-case": "Edge Case",
}

export default function TestsMenu() {
  return (
    <div style={{ padding: 40, maxWidth: 900, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: "#0a4554" }}>
        Central de Testes
      </h1>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 32 }}>
        Selecione um teste para executar. Testes de performance usam requisições
        reais contra a API. Testes de integridade verificam consistência dos dados.
      </p>

      {(["performance", "integridade", "edge-case"] as const).map((cat) => {
        const items = tests.filter((t) => t.category === cat)
        if (items.length === 0) return null
        return (
          <div key={cat} style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: categoryColors[cat],
                marginBottom: 12,
                paddingBottom: 6,
                borderBottom: `2px solid ${categoryColors[cat]}20`,
              }}
            >
              {categoryLabels[cat]}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((test) => (
                <Link
                  key={test.href}
                  href={test.href}
                  style={{
                    display: "block",
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: `1px solid ${categoryColors[cat]}30`,
                    textDecoration: "none",
                    color: "#212529",
                    transition: "all 0.15s",
                    background: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = categoryColors[cat]
                    e.currentTarget.style.boxShadow = `0 2px 8px ${categoryColors[cat]}20`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${categoryColors[cat]}30`
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: categoryColors[cat],
                        background: `${categoryColors[cat]}10`,
                        padding: "2px 8px",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    >
                      {categoryLabels[cat]}
                    </span>
                    <strong style={{ fontSize: 15 }}>{test.title}</strong>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#666",
                      marginTop: 4,
                      marginLeft: 0,
                    }}
                  >
                    {test.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
