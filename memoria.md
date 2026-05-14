# Memória do Projeto - ReDikma

## Visão Geral

**ReDikma** é uma plataforma de comunicação interna corporativa (intranet social) desenvolvida para a **Dikma**, uma empresa brasileira. Permite que funcionários compartilhem postagens, comentem, curtam, visualizem stories/atualizações da empresa e gerenciem perfis de usuário.

- **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Prisma 7 + PostgreSQL (Supabase)
- **Autenticação:** NextAuth.js com Credentials Provider (CPF + senha)
- **Armazenamento:** Supabase Storage para imagens
- **Branch principal de trabalho:** `opencode`

---

## Arquitetura

### Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raiz (Providers, Toaster)
│   ├── page.tsx            # Landing page (redirect baseado em auth)
│   ├── globals.css         # Estilos globais + paleta de cores
│   ├── login/              # Página de login
│   ├── intern/             # Área autenticada
│   │   ├── layout.tsx      # Layout com Sidebar + Header
│   │   ├── feed/           # Feed principal
│   │   └── profile/        # Perfil do usuário
│   ├── admin/              # Área administrativa
│   │   ├── layout.tsx      # Verificação de role no servidor
│   │   ├── usuarios/       # Gerenciamento de usuários
│   │   └── cadastro/       # Criação de usuários
│   ├── api/                # API Routes
│   │   ├── auth/           # NextAuth + logout
│   │   ├── posts/          # CRUD posts, likes, comments
│   │   ├── notifications/  # Notificações
│   │   ├── users/          # Perfil do usuário
│   │   ├── usuarios/       # Admin: CRUD usuários
│   │   ├── search-posts/   # Busca de posts
│   │   └── version-mobile/ # Versão do app mobile
│   ├── providers/
│   │   └── NotificationProvider.tsx
│   └── components/         # Componentes da aplicação
│       ├── sidebar.tsx
│       ├── feedHeader.tsx
│       ├── feed.tsx
│       ├── comentarios.tsx
│       ├── modal-postagem.tsx
│       ├── modal-stories.tsx
│       ├── modal-view-photo.tsx
│       ├── posts-bar.tsx
│       ├── stories.tsx
│       ├── likes-view.tsx
│       ├── postDelete.tsx
│       ├── cardUser.tsx
│       ├── floatButtonMobile.tsx
│       ├── box-notify.tsx
│       ├── photo-editor-desktop.tsx
│       ├── photo-editor-mobile.tsx
│       └── footer.tsx
├── components/
│   └── Providers.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── prisma.ts
│   ├── likes.ts
│   ├── comentarios.tsx
│   ├── uploads.ts
│   ├── ofensivas.ts
│   └── notifications/
│       ├── types.ts
│       └── notify.ts
└── types/
    └── next-auth.d.ts
```

### Banco de Dados (Prisma - PostgreSQL)

**Modelos principais:**
- **User:** id, nome, username, cpf, senha_hash, cargo, role (SYSTEM_ADM, ADMIN, POSTADOR, COMMON), foto, telefone, email, aniversario, admissao
- **Postagem:** id, label, authorId, duration, publicado, image, video, postador, createdAt
- **Like:** id, postId?, comentarioId?, userId (unique composto: postId+userId e comentarioId+userId)
- **Comentario:** id, texto, aprovado, postId, authorId, parentId (auto-relacionamento para respostas), createdAt
- **Notification:** id, userId, actorId, type (enum), title, message, data (Json?), read, createdAt
- **autoPost:** id, label, author, type (enum), mensagem, imagem, video

### Autenticação e Autorização

- Login via CPF + senha (NextAuth Credentials Provider)
- JWT com sessão de 7 dias
- Roles: SYSTEM_ADM > ADMIN > POSTADOR > COMMON
- Senha padrão: primeiros 6 dígitos do CPF (auto-hash no primeiro login)
- Admin layout faz verificação server-side com `getServerSession()`

### Sistema de Notificações

- Provider React Context (`NotificationProvider`)
- Polling a cada 30s para contagem de não lidas
- Limpeza automática de notificações com mais de 7 dias
- Tipos: LIKE, COMMENT, NEW_POST, REACTION, PROFILE_UPDATE, PROMOTION, BIRTHDAY, WORK_ANNIVERSARY

---

## Convenções de Código

- **Estilo:** Tailwind CSS com CSS custom properties (paleta de cores via variáveis CSS, sem hardcoded Tailwind colors)
- **Componentes:** Client Components ("use client") quando necessário interatividade
- **API Routes:** Arquivos route.ts dentro de subpastas em `src/app/api/`
- **Tipagem:** TypeScript estrito, tipos estendidos via `next-auth.d.ts`

---

### Sistema de Notificações (Delete Manual + Cache Local)

**Arquivos:**
- `src/app/api/notifications/route.ts` — GET (listar), POST (criar), DELETE (deletar individual)
- `src/app/components/box-notify.tsx` — Lista com lixeira + cache localStorage

**Fluxo atual:**
1. Notificações são criadas no banco via `notify()` (server-side) ou POST /api/notifications
2. `feedHeader.tsx` faz polling a cada 30s via `/api/notifications/count` para exibir badge
3. Ao clicar no sino, `NotificationsBox` abre e busca notificações da API
4. `NotificationsBox` salva as notificações no `localStorage` (`notifications-cache-{userId}`)
5. Cada notificação tem um ícone de lixeira (visível ao passar o mouse)
6. Ao clicar na lixeira → DELETE `/api/notifications?id=X` → remove do banco + do estado + atualiza cache local
7. **7-day cleanup:** toda chamada GET já limpa notificações com mais de 7 dias

**Benefícios:** Usuário controla o que deletar, notificações deletadas persistem no navegador, cleanup automático de 7 dias para não acumular.

---

## Histórico de Alterações

### 14/05/2026 - Sistema de Notificações: Lixeira Manual + Cache Local
- DELETE `/api/notifications?id=X` adicionado para deletar notificação individual
- `NotificationsBox`: cada notificação tem lixeira (visível no hover) que deleta do banco
- Cache `localStorage` (`notifications-cache-{userId}`) mantém notificações deletadas visíveis
- POST `/api/notifications` adicionado para suportar `NotificationProvider`
- 7-day cleanup automático mantido para notificações não deletadas

### 14/05/2026 - Foto de Perfil nos Likes
- `list-likes/route.ts`: fallback corrigido de pravatar para `/photoProfile/userDefault.png`
- `feed.tsx`: avatar do comentário usa `userDefault.png` em vez de pravatar
- `admin/usuarios/page.tsx`: fallback corrigido para `userDefault.png`

### Commit Inicial - 14/05/2026
- Criação dos arquivos `memoria.md` e `checkpoints.md`
- Branch `opencode` criada para desenvolvimento
