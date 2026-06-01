# Paleta de Cores - Dikma

Documentação da paleta de cores implementada no projeto.

## Cores Brand Dikma

### Primárias
- **Primary** (Azul Royal): `#272662`
  - Uso: Fundos de sidebar, headers, botões principais
  - Aplicação: `var(--primary)`

- **Secondary** (Azul Claro): `#86B0DD`
  - Uso: Detalhes decorativos, gradientes, variações suaves
  - Aplicação: `var(--secondary)`

### Destaque
- **Accent** (Laranja): `#F15A24`
  - Uso: CTAs, elementos de alto destaque, hover states
  - Aplicação: `var(--accent)`

### Neutro
- **Neutral** (Bege Claro): `#F7ECDA`
  - Uso: Fundos alternativos, elementos de apoio
  - Aplicação: `var(--neutral)`

### Escala de Cinza
- **Black**: `#111827`
  - Uso: Textos principais
- **Gray Dark**: `#1F2937`
  - Uso: Textos de destaque, títulos
- **Gray**: `#6B7280`
  - Uso: Textos secundários, ícones desativados
- **Gray Light**: `#D1D5DB`
  - Uso: Bordas leves, placeholders
- **Border**: `#E5E7EB`
  - Uso: Todas as bordas e divisores
- **Background**: `#FFFFFF`
  - Uso: Fundo de páginas
- **Surface**: `#F8FAFC`
  - Uso: Superfícies secundárias, cards

## Gradientes
- **Primary**: `linear-gradient(135deg, #272662 0%, #1a1540 50%, #272662 100%)`
- **Primary Light**: `linear-gradient(135deg, #272662 0%, #86B0DD 100%)`
- **Accent**: `linear-gradient(135deg, #F15A24 0%, #d63a0a 100%)`
- **Brand**: `linear-gradient(90deg, #272662 0%, #86B0DD 50%, #F15A24 100%)`

## Opacidades
- `--primary-10`: `rgba(39, 38, 98, 0.1)`
- `--primary-15`: `rgba(39, 38, 98, 0.15)`
- `--primary-20`: `rgba(39, 38, 98, 0.2)`
- `--primary-30`: `rgba(39, 38, 98, 0.3)`
- `--accent-10`: `rgba(241, 90, 36, 0.1)`
- `--accent-15`: `rgba(241, 90, 36, 0.15)`
- `--accent-20`: `rgba(241, 90, 36, 0.2)`

## Implementação Técnica

### Arquivo: `src/app/globals.css`
Todas as cores estão definidas como CSS custom properties `:root` e mapeadas via `@theme inline` para uso com Tailwind v4.

```css
:root {
  --primary: #272662;
  --accent: #F15A24;
  --secondary: #86B0DD;
  --neutral: #F7ECDA;
  --black: #111827;
  --gray-dark: #1F2937;
  --gray: #6B7280;
  --gray-light: #D1D5DB;
  --border: #E5E7EB;
  --background: #FFFFFF;
  --surface: #F8FAFC;
  --white: #FFFFFF;
}
```

### Tailwind Classes Disponíveis
- `bg-primary`, `text-primary`, `border-primary`
- `bg-accent`, `text-accent`, `border-accent`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-neutral`, `text-neutral`, `border-neutral`
- `bg-background`, `bg-surface`, `bg-border`
- `text-text-primary`, `text-text-secondary`

## Diretrizes de Uso

### Estética Clean e Moderna
- Use `rounded-lg`, `rounded-xl`, ou `rounded-2xl` para componentes
- Aplique sombras subtis: `shadow-sm` ou `shadow-md`
- Mantenha espaçamento consistente com `gap`, `p-`, `m-`

### Contraste e Legibilidade
- Sobre fundos claros: use `var(--black)` ou `var(--primary)`
- Sobre fundos escuros: use `var(--white)` ou `var(--secondary)`
- Textos secundários: sempre `var(--gray)`

### Estados Interativos
- Hover: adicione `opacity-70` ou `hover:opacity-70`
- Foco: use `border` com `var(--primary)` e `box-shadow` com `var(--primary-10)`
- Disabled: use `opacity-50`

## Notas Importantes

1. **Nunca use cores hardcoded do Tailwind** (ex: `bg-gray-500`, `text-blue-600`)
2. **Sempre use as custom properties**: `var(--color-name)` ou classes Tailwind (`bg-primary`, `text-primary`)
3. **Mantenha a paleta consistente** em toda a aplicação
4. **Teste contraste** para garantir acessibilidade
