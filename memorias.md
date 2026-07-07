# Memórias do Projeto - Redikma

## Visão Geral
Rede social corporativa para comunicação interna, engajamento e colaboração.

## Stack
- Next.js 16.2.3 (App Router) + React 19.2.4
- TypeScript + Tailwind CSS v4
- Prisma 7.7.0 + PostgreSQL
- NextAuth v4
- Framer Motion, Lucide React, Sonner

## Estrutura de Diretórios
```
src/
├── app/
│   ├── admin/       # Painel administrativo
│   ├── api/         # Rotas de API (auth, posts, users, notifications)
│   ├── components/  # Componentes compartilhados (~20)
│   ├── intern/      # Área interna (feed, profile)
│   ├── providers/   # Contextos (Notification, PostModal)
│   ├── login/       # Página de login
│   └── page.tsx     # Landing page (redireciona conforme sessão)
├── components/      # Providers globais
├── hooks/           # useAuth
├── lib/             # prisma, likes, comentarios, uploads
└── types/           # next-auth.d.ts
```

## Paleta de Cores (CSS Custom Properties) - Brand Dikma
- Primary (Azul Royal): #272662
- Secondary (Azul Claro): #86B0DD
- Accent (Laranja): #F15A24
- Neutral (Bege): #F7ECDA
- Neutros: #111827, #1F2937, #6B7280, #D1D5DB, #E5E7EB, #FFFFFF, #F8FAFC

## Estrutura de Páginas Legais
- `/legais/termos-de-uso` — Termos de Uso
- `/legais/politicas de privacidade` — Política de Privacidade
- `/legais/lgpd` — LGPD

## Convenções
- Mobile-first com breakpoints sm(640), md(768), lg(1024)
- Mínimo 44px para elementos touch
- "use client" em componentes interativos
- API routes em src/app/api/
- Páginas legais seguem padrão: "use client" + template string com markdown + `<pre>` estilizado
