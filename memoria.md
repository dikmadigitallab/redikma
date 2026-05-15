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

### Sistema de Notificações (Consume ao Abrir + Cache Local)

**Arquivos:**
- `src/app/api/notifications/route.ts` — GET (listar + consume), POST (criar), DELETE (deletar individual)
- `src/app/components/box-notify.tsx` — Lista com lixeira + cache localStorage

**Fluxo atual:**
1. Notificações são criadas no banco via `notify()` (server-side) ou POST /api/notifications
2. `feedHeader.tsx` faz polling a cada 30s via `/api/notifications/count` para exibir badge
3. Ao clicar no sino, `NotificationsBox` abre e busca com `consume=true`: busca **e deleta do DB**
4. `NotificationsBox` faz merge das notificações novas com o cache do `localStorage` (`notifications-cache-{userId}`)
5. Cada notificação tem um ícone de lixeira (visível ao passar o mouse)
6. Ao clicar na lixeira → remove apenas do `useState` e do `localStorage` (já foi deletada do DB no passo 3)
7. **7-day cleanup:** toda chamada GET já limpa notificações com mais de 7 dias

**Benefícios:** DB funciona como fila de entrega, notificações persistem no navegador, cleanup automático de 7 dias.

---

## Histórico de Alterações — 14/05/2026

### Commit Inicial
- Criação dos arquivos `memoria.md` e `checkpoints.md`
- Branch `opencode` criada e configurada no GitHub

### Notificações — Lixeira + Cache Local
- DELETE `/api/notifications?id=X` p/ deletar notificação individual do banco
- `NotificationsBox`: lixeira visível no hover que deleta do banco
- Cache `localStorage` (`notifications-cache-{userId}`) mantém notificações mesmo após deletadas
- POST `/api/notifications` adicionado
- 7-day cleanup automático (já existia)

### Notificações — Foto do Autor + Tempo Relativo
- `Notification` type agora inclui `actor { nome, foto }`
- Exibe foto de perfil de quem gerou a notificação (fallback `userDefault.png`)
- Função `timeAgo()`: "agora", "há X min", "há X h", "há X dias", "há 1 semana", ou data formatada

### Notificações — Curtidas, Comentários e Respostas
- `comments-likes/route.ts`: notifica autor do comentário quando alguém curte
- `posts-comments/route.ts`: notifica autor do post quando comentam
- `posts-comments/route.ts`: notifica autor do comentário pai quando respondem
- `types.ts`: corrigido tipo `data` de `Record<string, ''>` para `Record<string, any>`

### Notificações — Modal de Postagem
- `PostModalContext`: provider global com `openPost(postId)` e `closePost()`
- `modal-post-view.tsx`: modal completo com autor, texto, imagem, curtidas (toggle + LikeView), CommentsBox, ImageModal
- `box-notify.tsx`: clique na notificação abre o modal
- `layout.tsx`: `PostModalProvider` adicionado ao root layout
- Scrollbar personalizada (aparece apenas ao rolar/hover)

### Foto de Perfil — Fallback Corrigido
- `list-likes/route.ts`: fallback de pravatar → `/photoProfile/userDefault.png`
- `feed.tsx`: avatar do input de comentário corrigido
- `admin/usuarios/page.tsx`: fallback corrigido

### Double-tap to Like + Comments Scroll — 15/05/2026
- `modal-view-photo.tsx`: duplo toque na foto em mobile curte a postagem com animação de coração
- `modal-view-photo.tsx`: aceita `postId` e `authorId` como props opcionais
- `feed.tsx`: `handleOpenImage` agora guarda `postId`/`authorId` e repassa ao modal
- `modal-post-view.tsx`: repassa `postId`/`authorId` ao ImageModal
- `globals.css`: keyframe `heart-burst` para animação do coração
- `comentarios.tsx`: CommentsBox mudou de dropdown absoluto para fluxo inline (funciona no scroll do mobile)
- `feed.tsx`: `toggleComments` abre automaticamente os comentários e scrolla o post inteiro
- `feed.tsx`: adicionado `setTimeout` no scrollIntoView para aguardar teclado mobile abrir

### Footer Branco no Mobile — 15/05/2026
- `footer.tsx`: footer agora visível no mobile com fundo branco (antes era `hidden md:block`)
- `footer.tsx`: espaço vertical `h-6` no mobile para boundary visual sem conteúdo extra

### Notificações — Consume ao Abrir + Lixeira Local — 15/05/2026
- `box-notify.tsx`: fetch agora usa `consume=true` — busca e deleta do DB ao abrir o sininho
- `box-notify.tsx`: merge de notificações novas com cache existente (em vez de sobrescrever)
- `box-notify.tsx`: lixeira agora remove apenas do estado e localStorage (sem chamar DELETE API)

### Edição de Posts — 15/05/2026
- `src/app/api/posts/[id]/route.ts`: nova rota PUT para editar texto do post (label)
- `modal-edit-post.tsx`: modal de edição com textarea pré-preenchido, apenas texto (sem imagem)
- `feed.tsx`: `handleEditPost` agora abre o modal de edição; `onSaved` atualiza o feed
- `modal-post-view.tsx`: botão editar visível apenas para o autor do post no cabeçalho
- Permissão: autor ou admin podem editar; imagem não pode ser alterada na edição
- Build validado com sucesso
