---
description: Como rodar o ambiente de desenvolvimento do MonstroBolso
---

Para iniciar o desenvolvimento e testar o jogo localmente:

1. Certifique-se de que todos os arquivos estão na raiz do projeto (`index.html`, `style.css`, pasta `js/`, etc.).
2. Use um servidor HTTP simples para evitar problemas de CORS com módulos ES6.
// turbo
3. Se você tiver o `npx` instalado, execute: `npx serve .`
4. Abra o navegador no endereço indicado (geralmente `http://localhost:3000`).
5. Clique no botão "Iniciar Jogo" na tela principal.

Comandos úteis:
- `i`: Abre a mochila (ver console).
- `Enter`: Mergulha (em tiles laranjas).
- `b`: Inicia uma batalha de teste.
- `g`: Simula derrota do Giovanni (libera mapa urbano).
