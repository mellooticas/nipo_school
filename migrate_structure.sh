# íº€ COMANDOS DIRETOS - Execute um por vez no terminal

echo "íº€ Iniciando migraÃ§Ã£o da estrutura Nipo School..."

# 1. CRIAR ESTRUTURA DE PASTAS
mkdir -p src/app/router
mkdir -p src/features/{auth,admin,professores,alunos,instrumentos,gamificacao,modulos,devocional,turmas}/{components,pages,hooks,services}
mkdir -p src/shared/services

echo "âœ… Estrutura de pastas criada!"

# 2. MOVER ARQUIVOS APP-LEVEL
mv src/App.jsx src/app/
mv src/main.jsx src/app/
mv src/router/AppRouter.jsx src/app/router/
mv src/pages/professores/ProfessorRoute.jsx src/app/router/

echo "âœ… App-level movido!"

# 3. FEATURE: AUTH
mv src/pages/Login.jsx src/features/auth/pages/
mv src/pages/Register.jsx src/features/auth/pages/
mv src/pages/Vote.jsx src/features/auth/pages/
mv src/pages/ConfirmEmail.jsx src/features/auth/components/

echo "âœ… Feature AUTH organizada!"

# 4. FEATURE: ADMIN
mv src/components/admin/AdminQuickAccess.jsx src/features/admin/components/
mv src/components/kanban/KanbanBoard.jsx src/features/admin/components/
mv src/components/kanban/AulaCard.jsx src/features/admin/components/
mv src/pages/admin/dashboard.jsx src/features/admin/pages/
mv src/pages/admin/AdminInstruments.jsx src/features/admin/pages/
mv src/pages/admin/AdminInstrumentDetails.jsx src/features/admin/pages/
mv src/pages/admin/Kanban.jsx src/features/admin/pages/
mv src/pages/admin/aulas/AulaDetail.jsx src/features/admin/pages/
mv src/shared/hooks/useAulas.js src/features/admin/hooks/
mv src/services/adminService.js src/features/admin/services/

echo "âœ… Feature ADMIN organizada!"

# 5. FEATURE: PROFESSORES
mv src/components/professores/*.jsx src/features/professores/components/
mv src/pages/professores/*.jsx src/features/professores/pages/
mv src/shared/hooks/useProfessoresConteudos.js src/features/professores/hooks/
mv src/shared/hooks/useProfessoresStats.js src/features/professores/hooks/
mv src/shared/hooks/useFileUpload.js src/features/professores/hooks/
mv src/services/professoresService.js src/features/professores/services/

echo "âœ… Feature PROFESSORES organizada!"

# 6. FEATURE: INSTRUMENTOS
mv src/pages/instrumentos/*.jsx src/features/instrumentos/pages/
mv src/shared/hooks/useInstruments.js src/features/instrumentos/hooks/
mv src/shared/hooks/useInstrumentPage.js src/features/instrumentos/hooks/
mv src/services/instrumentsService.js src/features/instrumentos/services/
mv src/services/instrumentPageService.js src/features/instrumentos/services/

echo "âœ… Feature INSTRUMENTOS organizada!"

# 7. OUTRAS FEATURES
mv src/shared/hooks/useAchievements.js src/features/gamificacao/hooks/
mv src/shared/hooks/useModules.js src/features/modulos/hooks/
mv src/shared/hooks/useDevotionals.js src/features/devocional/hooks/
mv src/shared/hooks/useProgress.js src/features/alunos/hooks/
mv src/shared/hooks/useTurmas.js src/features/turmas/hooks/
mv src/shared/hooks/useAulasAvancado.js src/features/turmas/hooks/
mv src/services/turmasService.js src/features/turmas/services/

echo "âœ… Outras features organizadas!"

# 8. ORGANIZAR SHARED
mv src/services/redirectService.js src/shared/services/

echo "âœ… SHARED organizado!"

# 9. LIMPEZA
rmdir src/components/admin 2>/dev/null
rmdir src/components/kanban 2>/dev/null
rmdir src/components/professores 2>/dev/null
rmdir src/components/{Audio,RafaBeat,Conquistas,Dashboard,instrumentos,Modulos,Perfil} 2>/dev/null
rmdir src/pages/admin/aulas 2>/dev/null
rmdir src/pages/{admin,professores,instrumentos,alunos,auth,conquistas,devocional,modulos,perfil,pratica,rafa-beat,turmas} 2>/dev/null
rmdir src/router 2>/dev/null
rmdir src/services 2>/dev/null

echo "âœ… MIGRAÃ‡ÃƒO CONCLUÃDA!"
echo "í´ Verificando nova estrutura:"
ls -la src/features/

