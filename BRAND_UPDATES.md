# Atualização de Identidade Visual - Intranet

## Resumo das Mudanças

O Intranet foi totalmente rebranded de acordo com o Manual de Marca da **Dikma**. Todas as cores, tipografias e elementos visuais foram atualizados para refletir a identidade corporativa da matriz.

---

## 🎨 Paleta de Cores (Dikma Brand)

### Cores Primárias

| Nome           | Código HEX | RGB           | Uso                                                  |
| -------------- | ---------- | ------------- | ---------------------------------------------------- |
| **Azul Royal** | `#272662`  | 39, 38, 98    | Headers, Sidebars, Títulos, Links, Ícones principais |
| **Laranja**    | `#F15A24`  | 241, 90, 36   | Botões de ação, CTAs, Indicadores ativos, Alerts     |
| **Azul Claro** | `#86B0DD`  | 134, 176, 221 | Cards, Badges informativos, Fundos suaves            |
| **Creme**      | `#F7ECDA`  | 247, 236, 218 | Backgrounds alternativos, Seções institucionais      |

### Cores Neutras

| Nome             | Código HEX | RGB           | Uso                      |
| ---------------- | ---------- | ------------- | ------------------------ |
| **Preto**        | `#111827`  | 17, 24, 39    | Texto primário           |
| **Cinza Escuro** | `#1F2937`  | 31, 41, 55    | Texto secundário         |
| **Cinza**        | `#6B7280`  | 107, 114, 128 | Texto desabilitado       |
| **Branco**       | `#FFFFFF`  | 255, 255, 255 | Backgrounds principais   |
| **Surface**      | `#F8FAFC`  | 248, 250, 252 | Backgrounds alternativos |

---

## 🔤 Tipografia

### Fonte Principal

- **Red Hat Display** - Para títulos e destaques
  - Pesos: 300, 400, 500, 600, 700, 800, 900
- **Red Hat Text** - Para corpo de texto
  - Pesos: 300, 400, 500, 600, 700

### Hierarquia Tipográfica

- **Títulos Principais**: Weight 700, Cor Azul Royal (#272662)
- **Subtítulos**: Weight 600, Cor Azul Royal (#272662)
- **Texto Corrido**: Weight 400, Cor Cinza Escuro (#1F2937)
- **Destaques**: Weight 600-700, Cor Laranja (#F15A24)

---

## 📐 Design Tokens (CSS Variables)

Todos os tokens estão definidos em `src/app/globals.css`:

```css
:root {
  /* Cores Brand Dikma */
  --primary: #272662;
  --accent: #f15a24;
  --secondary: #86b0dd;
  --neutral: #f7ecda;

  /* Escala de Cinza */
  --black: #111827;
  --gray-dark: #1f2937;
  --gray: #6b7280;
  --gray-light: #d1d5db;
  --border: #e5e7eb;
  --background: #ffffff;
  --surface: #f8fafc;
  --white: #ffffff;

  /* Fontes */
  --font-sans: "Red Hat Display", "Red Hat Text", sans-serif;
  --font-mono: var(--font-geist-mono);

  /* Raios de Borda */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Sombras */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
}
```

---

## 📝 Arquivos Atualizados

### Configuração Global

- ✅ `src/app/globals.css` - Novo sistema de tokens e cores Dikma
- ✅ `src/app/layout.tsx` - Fontes Red Hat Display/Text carregadas

### Componentes

- ✅ `src/app/components/sidebar.tsx` - Cores atualizadas para brand Dikma
- ✅ `src/app/components/admin-sidebar.tsx` - Barra superior com cor primária
- ✅ `src/app/components/feedHeader.tsx` - Header com nova cor de logo e notificações
- ✅ `src/app/components/feed.tsx` - Cores RGB atualizadas
- ✅ `src/app/components/posts-bar.tsx` - Cores da paleta atualizada
- ✅ `src/app/components/comentarios.tsx` - Gradientes e cores atualizados
- ✅ `src/app/components/modal-post-view.tsx` - Cores primárias atualizadas
- ✅ Todos os componentes admin - Cores consistentes com brand

### Substituições Globais Realizadas

- ✅ `var(--primary-dark)` → `var(--primary)` (em todos os arquivos)
- ✅ `var(--warning)` → `var(--accent)` (em todos os arquivos)
- ✅ `rgba(10, 69, 84, ...)` → `rgba(39, 38, 98, ...)` (cor antiga → nova)
- ✅ Background `#F5F5F5` → `#FFFFFF` (com tokens)

---

## 🎯 Características Visuais da Identidade Dikma

A interface agora transmite:

- ✅ **Confiança** - Azul Royal como cor primária
- ✅ **Solidez** - Paleta corporativa profissional
- ✅ **Inovação** - Laranja para ações e chamadas
- ✅ **Dinamismo** - Gradientes com cores brand
- ✅ **Modernidade** - Tipografia Red Hat contemporânea
- ✅ **Organização** - Consistência em toda a aplicação

---

## 🔄 Variáveis CSS Antigas (Removidas)

As seguintes variáveis foram substituídas:

- ❌ `--primary-dark` (agora: `--primary`)
- ❌ `--secondary` (mantido com novo valor: `#86B0DD`)
- ❌ `--success` (use `--primary` ou `--accent`)
- ❌ `--warning` (agora: `--accent`)
- ❌ `--accent` (antigo, agora: `#FDE205` → novo: `#F15A24`)

---

## 📱 Responsividade

Todas as cores foram aplicadas mantendo a responsividade:

- Mobile: Cores consistentes
- Tablet: Componentes adaptados
- Desktop: Layout completo com sidebar e header

---

## ✨ Próximos Passos (Opcional)

Para complementar a identidade Dikma:

1. Adicionar grafismos do catavento derivados do logo em fundos institucionais
2. Implementar animações com a cor laranja para ações importantes
3. Criar variações de hover/active com a paleta secundária
4. Aplicar badges com cores específicas para status diferentes

---

## 📞 Suporte

Para dúvidas sobre a identidade visual, consulte o **Manual de Marca — Grupo Dikma**.

**Data de atualização**: 20 de maio de 2026
**Versão do Intranet**: 2.0 (Brand Update)
