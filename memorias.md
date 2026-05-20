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

## Paleta de Cores (CSS Custom Properties)
- Primary Dark: #0A4554
- Secondary: #4FC3D9
- Success: #6BC28D
- Warning: #FBB04B
- Accent: #FDE205
- Neutros: #1A1A1A, #757575, #E0E0E0, #F5F5F5, #FFFFFF

## Convenções
- Mobile-first com breakpoints sm(640), md(768), lg(1024)
- Mínimo 44px para elementos touch
- "use client" em componentes interativos
- API routes em src/app/api/
