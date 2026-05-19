# Instruções de Desenvolvimento - Redikma

## Regras Obrigatórias
1. Compreender completamente o contexto antes de alterar qualquer arquivo.
2. Preservar compatibilidade com código existente.
3. Nunca alterar schema do Prisma (avisar usuário se necessário).
4. Nunca rodar migrações automaticamente.
5. Executar `npm run build` antes de finalizar qualquer tarefa.
6. Corrigir erros de build causados pelas alterações.

## Fluxo de Tarefas
1. Entender objetivo e identificar arquivos envolvidos.
2. Analisar dependências e impactos.
3. Executar mudanças.
4. Verificar regressões.
5. Build e correção de erros.

## Commits
- Commits só devem ser feitos quando solicitado explicitamente pelo usuário.
- Seguir convenções de commit do repositório.

## Documentação
- `memorias.md` - Contexto e decisões do projeto
- `checkpoints.md` - Histórico de alterações
- `instrucoes.md` - Este arquivo
