# Melhorias do Feed - Layout Fullscreen para Fotos

## Visão Geral
Transformamos o feed para oferecer uma experiência estilo **Instagram Stories** para posts com fotos, mantendo o layout card tradicional para posts de texto.

## Arquitetura

### Novo Componente: `photo-post.tsx`
Componente dedicado para renderização de posts com fotos em layout fullscreen:

**Características principais:**
- Layout fullscreen que ocupa a tela inteira
- Imagem com proporção 9:16 (Instagram Stories)
- Imagem centralizada com sombra e border-radius
- Background abstrato com gradiente Dikma discreto (opacidade baixa)
- Header overlay semi-transparente com informações do autor
- Footer overlay com controles de interação

**Elementos do Header Overlay:**
- Avatar do autor com border branco
- Nome e cargo do autor
- Botão de menu (três pontos)
- Background com gradient fade to-transparent

**Elementos do Footer Overlay:**
- Texto do post (line-clamp-3)
- Contadores de likes e comentários
- Botão de like fullwidth com feedback visual
- Campo de comentário integrado com botão de envio
- Background com gradient fade to-black

### Modificações no `feed.tsx`
1. **Import**: Adicionado import do novo `PhotoPost`
2. **Renderização condicional**: 
   - Posts com `.image` → Renderizam com `PhotoPost` (fullscreen)
   - Posts sem imagem → Mantêm layout card atual
3. **Scroll Snap**: Adicionado `scrollSnapType: 'y mandatory'` para snap vertical

## Comportamento Visual

### Posts com Foto
- Cada scroll ocupa uma tela inteira
- Proporção 9:16 padronizada (altura x largura)
- Se foto for menor que 9:16, preenchida com fundo semi-transparente
- Overlays interativos (header + footer)
- Animações suaves com backdrop blur

### Posts de Texto
- Mantêm layout card com border 2px azul
- Podem ter 2+ posts por tela
- Totalmente interativos (likes, comentários)
- Design mantido conforme versão anterior

## Cores Aplicadas (Identidade Dikma)

**PhotoPost Background:**
- Gradiente: `linear-gradient(135deg, rgba(39, 38, 98, 0.08) 0%, rgba(241, 90, 36, 0.06) 100%)`
- Cores: Azul Royal (#272662) + Laranja (#F15A24)
- Opacidade: 6-8% (muito discreta)

**Botões Interativos:**
- Like: Laranja (#F15A24) quando curtido, branco semi-transparente quando não
- Enviar comentário: Laranja com hover effect
- Menu: Branco semi-transparente com backdrop blur

## Funcionalidades Preservadas

✓ Like/Unlike com contadores
✓ Comentários com validação
✓ Menu de opções (editar/deletar)
✓ Imagem fullscreen (modal)
✓ Double-tap para like
✓ Histórico de undo/redo
✓ Tooltip de likers
✓ Data e horário do post

## Componentes Envolvidos

- `photo-post.tsx` - Novo componente para posts com foto
- `feed.tsx` - Feed principal com lógica de renderização condicional
- Mantém compatibilidade com: `comentarios.tsx`, `posts-bar.tsx`, `modal-view-photo.tsx`, etc.

## Status de Implementação

✅ Componente PhotoPost criado e funcional
✅ Lógica condicional implementada
✅ Scroll snap vertical ativado
✅ Compilação TypeScript sem erros (photo-post.tsx)
✅ Servidor respondendo HTTP 200 OK
✅ Design Dikma aplicado ao novo layout

## Próximas Otimizações (Opcional)

- Lazy loading de imagens
- Preload de próximo post
- Animações de transição entre posts
- Controles de reprodução (se adicionar vídeos)
- Indicador visual de posição (1/10 posts)
