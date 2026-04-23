# Guia de Responsividade - Dikma

## Visão Geral

Aplicação totalmente responsiva focada em usabilidade mobile-first com suporte a desktop.

## Breakpoints Tailwind Utilizados

```
sm: 640px   (Tablets pequenos)
md: 768px   (Tablets e acima)
lg: 1024px  (Desktop)
```

## Páginas Responsivas

### 1. Feed Page (`/feed`)
**Mobile (< 640px)**
- Sidebar esquerda: Oculta (`hidden`)
- Stories direita: Oculta (`hidden`)
- Feed: Ocupa 100% da largura
- Footer: Oculto para economizar espaço
- Bottom nav: Visível e flutuante

**Tablet (md+)**
- Footer: Compactado com 2 colunas
- Feed: Mantém max-width responsivo

**Desktop (lg+)**
- Sidebar visível (w-64)
- Stories visível (w-96)
- Footer: 4 colunas completo
- Bottom nav: Oculto

### 2. Landing Page (`/`)
**Características Responsivas**
- Fontes: text-2xl (mobile) → text-5xl (desktop)
- Header: h-14 (mobile) → h-16 (desktop)
- Grid features: 1 coluna → 2 → 3
- Stats: Stack vertical → 3 colunas
- Padding: px-4 → px-6 → px-[10%]
- CTA buttons: Full width mobile → side-by-side tablet+

### 3. Login Page (`/login`)
**Responsividade**
- Card: max-w-sm (mobile) → max-w-md (desktop)
- Padding: p-6 (mobile) → p-8 (desktop)
- Ícones: Redimensionados por breakpoint
- Input height: 40px (mobile) → 44px (desktop)

### 4. New Post Page (`/feed/new-post`)
**Elementos Responsivos**
- Textarea: h-24 (mobile) → h-32 (desktop)
- Preview imagem: h-48 (mobile) → h-64 (desktop)
- Label: text-xs (mobile) → text-sm (desktop)

## Componentes Responsivos

### Feed Component
```jsx
// Responsive spacing
<section className="w-full space-y-4 md:space-y-6">
  {/* Posts com padding adaptativo */}
  <div className="p-3 md:p-4">
```

**Ajustes principais:**
- Ícones: 18px (mobile) → 20px (desktop)
- Avatar: 32px → 40px
- Font sizes: xs (mobile) → sm (desktop)
- Images: max-h-[300px] (mobile) → max-h-[500px] (desktop)

### Header Component
**Height adaptativa:**
- Mobile: h-14 (56px)
- Desktop: h-16 (64px)

**Padding responsivo:**
- Mobile: px-4
- Tablet: px-[5%]
- Desktop: px-[10%]

## Padrões de Responsividade

### 1. Text Sizing
```jsx
// Padrão geral
className="text-sm md:text-base lg:text-lg"

// Headers
className="text-xl md:text-2xl lg:text-4xl"
```

### 2. Spacing
```jsx
// Gap entre elementos
className="gap-2 md:gap-3 lg:gap-4"

// Padding
className="p-3 md:p-4 lg:p-6"

// Margin
className="m-4 md:m-6"
```

### 3. Visibility
```jsx
// Ocultar em mobile
className="hidden md:block"
className="hidden lg:flex"

// Mostrar apenas mobile
className="block md:hidden"
```

### 4. Width
```jsx
// Cards e containers
className="w-full md:w-96 lg:w-full"

// Sidebars
className="hidden lg:w-64 lg:flex"
```

## Touch-Friendly Sizing

Seguindo WCAG guidelines:

```jsx
// Buttons e inputs (mínimo 44x44px)
className="py-2.5 md:py-3"  // 40px + padding mobile, 48px+ desktop

// Icons (mínimo 24px para toque)
size={18}   // Mobile
size={20}   // Desktop (com md:)
```

## Comportamento Responsivo Específico

### Navegação
- **Mobile**: Bottom nav flutuante com 5 ícones
- **Desktop**: Bottom nav oculto (lg:hidden)
- **Header**: Sempre visível e responsivo

### Footer
- **Mobile**: Oculto (hidden md:flex)
- **Tablet**: 2 colunas compactas
- **Desktop**: 4 colunas completo

### Sidebar Left
- **Mobile**: Oculto (hidden lg:flex)
- **Desktop**: w-64, não rola verticalmente

### Feed (Centro)
- **Mobile**: 100% width com padding
- **Desktop**: max-w-3xl, overflow-y-auto

### Stories (Direita)
- **Mobile**: Oculto (hidden lg:flex)
- **Desktop**: w-96, overflow-y-auto

## Testando Responsividade

### Breakpoints para testar
1. **320px** - iPhone SE (mobile mínimo)
2. **375px** - iPhone 12 (mobile comum)
3. **640px** - Breakpoint `sm`
4. **768px** - iPad (breakpoint `md`)
5. **1024px** - iPad Pro / Desktop (breakpoint `lg`)
6. **1280px+** - Desktop grande

### Chrome DevTools
```
Ctrl + Shift + M  (Toggle Device Toolbar)
Ctrl + Shift + P  (Adicionar device customizado)
```

## Convenções do Projeto

1. **Mobile-First**: Classes padrão = mobile, prefixar com breakpoint para maiores
2. **Consistency**: Usar sempre sm/md/lg (nunca criar custom breakpoints)
3. **Touch-Friendly**: Mínimo 44px altura para elementos interativos
4. **Performance**: Evitar overflow horizontal em mobile
5. **Legibilidade**: Font mínimo 12px em mobile, 14px em desktop

## Exemplo Completo

```jsx
<div className="space-y-4 md:space-y-6">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Título
  </h1>
  
  <p className="text-sm md:text-base lg:text-lg" style={{ color: 'var(--gray)' }}>
    Descrição
  </p>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {/* Cards */}
  </div>
  
  <button 
    className="w-full md:w-auto px-4 md:px-8 py-2.5 md:py-3"
    style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--white)' }}
  >
    Ação
  </button>
</div>
```

## Performance Mobile

Otimizações implementadas:
- Lazy loading em imagens grandes
- Redução de font weights em mobile
- Padding reduzido para economizar espaço
- Flex gap em vez de margin para melhor layout
- Hidden elements removidos do layout (não apenas visualmente)

---

**Última atualização**: 2026-04-23
**Status**: Implementação Completa
