# Paleta de Cores - Dikma

Documentação da paleta de cores implementada no projeto.

## Cores Obrigatórias

### Primárias
- **Primary Dark** (Azul Escuro): `#0A4554`
  - Uso: Fundos de sidebar, headers, botões principais
  - Aplicação: `style={{ backgroundColor: 'var(--primary-dark)' }}`

- **Secondary** (Ciano): `#4FC3D9`
  - Uso: Estados hover, links, detalhes, avatares
  - Aplicação: `style={{ backgroundColor: 'var(--secondary)' }}`

### Indicadores
- **Success** (Verde): `#6BC28D`
  - Uso: Indicadores positivos, confirmações
  
- **Warning** (Amarelo): `#FBB04B`
  - Uso: Estados de atenção, alertas, botões secundários
  
- **Accent** (Amarelo Forte): `#FDE205`
  - Uso: CTAs de alto destaque, avisos críticos

### Escala de Cinza
- **Black**: `#1A1A1A`
  - Uso: Textos principais
  
- **Gray**: `#757575`
  - Uso: Textos secundários, ícones desativados
  
- **Border**: `#E0E0E0`
  - Uso: Todas as bordas e divisores
  
- **Background**: `#F5F5F5`
  - Uso: Cor de fundo das páginas, inputs, áreas secundárias
  
- **White**: `#FFFFFF`
  - Uso: Cards, elementos flutuantes, containers principais

## Implementação Técnica

### Arquivo: `src/app/globals.css`
Todas as cores estão definidas como CSS custom properties `:root`:

```css
:root {
  --primary-dark: #0A4554;
  --secondary: #4FC3D9;
  --success: #6BC28D;
  --warning: #FBB04B;
  --accent: #FDE205;
  --black: #1A1A1A;
  --gray: #757575;
  --border: #E0E0E0;
  --background: #F5F5F5;
  --white: #FFFFFF;
}
```

### Uso em Componentes React

**Exemplo 1 - Cor de fundo:**
```jsx
<div style={{ backgroundColor: 'var(--primary-dark)' }}>
  Conteúdo
</div>
```

**Exemplo 2 - Texto:**
```jsx
<p style={{ color: 'var(--black)' }}>Texto principal</p>
<p style={{ color: 'var(--gray)' }}>Texto secundário</p>
```

**Exemplo 3 - Borda:**
```jsx
<div style={{ border: '1px solid var(--border)' }}>
  Conteúdo com borda
</div>
```

**Exemplo 4 - Accent para inputs:**
```jsx
<input style={{ accentColor: 'var(--primary-dark)' }} type="checkbox" />
```

## Aplicação no Projeto

### Páginas Atualizadas
- ✅ `src/app/page.tsx` - Landing page
- ✅ `src/app/login/page.tsx` - Página de login
- ✅ `src/app/feed/page.tsx` - Feed principal
- ✅ `src/app/feed/new-post/page.tsx` - Criação de post

### Componentes Atualizados
- ✅ `src/app/components/sidebar.tsx` - Sidebar esquerda
- ✅ `src/app/components/feed.tsx` - Feed de notícias
- ✅ `src/app/components/cardUser.tsx` - Card de usuário
- ✅ `src/app/components/modal-postagem.tsx` - Modal de criação
- ✅ `src/app/components/stories.tsx` - Sidebar direita (atualizações)

## Diretrizes de Uso

### Estética Clean e Moderna
- Use `rounded-lg`, `rounded-xl`, ou `rounded-2xl` para componentes
- Aplique sombras subtis: `shadow-sm` ou `shadow-md`
- Mantenha espaçamento consistente com `gap`, `p-`, `m-`

### Contraste e Legibilidade
- Sobre fundos claros: use `var(--primary-dark)` ou `var(--black)`
- Sobre fundos escuros: use `var(--white)` ou `var(--secondary)`
- Textos secundários: sempre `var(--gray)`

### Estados Interativos
- Hover: adicione `opacity-70` ou `hover:opacity-70`
- Foco: use `border` com `var(--secondary)`
- Disabled: use `opacity-50`

## Notas Importantes

1. **Nunca use cores hardcoded do Tailwind** (ex: `bg-gray-500`, `text-blue-600`)
2. **Sempre use as custom properties**: `var(--color-name)`
3. **Mantenha a paleta consistente** em toda a aplicação
4. **Teste contraste** para garantir acessibilidade
