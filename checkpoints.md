# Checkpoints - Intranet

## [2026-05-19] Versão 0.9.98

- Criação do projeto
- Redesign completo da UI com paleta profissional
- Implementação de responsividade mobile-first

## [2026-05-19] Galeria como padrão + Editor Mobile Profissional

- **new-post page**: Agora abre galeria por padrão em vez de câmera. Câmera só é ativada quando usuário clica em "Usar câmera".
- **photo-editor-mobile.tsx**: Redesign completo como editor profissional
  - Sistema de abas: Ajustes, Filtros, Cortar
  - 7 controles de ajuste (brilho, contraste, saturação, temperatura, nitidez, exposição, vibração)
  - 8 filtros predefinidos (Original, Clarity, Warm, Cool, Vintage, Noir, Fade, Vibrant)
  - Ferramentas de corte: 6 proporções, rotação 90°, espelhamento H/V
- **photo-editor-mobile.tsx**: Controles agora abrem como overlay sobre a própria imagem. Toolbar compacta com ícones abaixo da imagem. Aspect ratio padrão alterado para 4/3 (mais área de foto).
  - Undo/Redo com histórico (20 ações)
  - Comparação antes/depois (botão eye)
  - Reset completo com 1 clique
  - Suporte a pinch-to-zoom em touch
  - Grade de terços durante interação
