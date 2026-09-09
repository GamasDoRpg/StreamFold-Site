# StreamFold — DEXIS

Site institucional e frontend do portal de avaliação B2B do DEXIS.

## Estrutura

- `index.html`: landing page comercial, com links para `pilot/`.
- `pilot/index.html`: login e workspace do piloto.
- `pilot/pilot.css`: estilos responsivos do portal.
- `pilot/pilot.js`: navegação, formulários, diálogos e cópia de comandos.
- `pilot/service.js`: ponto de integração reservado para o backend.
- `CNAME`: domínio personalizado existente, preservado.

Sem dependências de build, fontes remotas ou bibliotecas externas. O portal usa JavaScript; a página institucional é independente dele.

## Abrir e navegar

Sirva a raiz do repositório em um servidor estático. Para desenvolvimento local:

```sh
python -m http.server 8000
```

- Página inicial: `http://localhost:8000/`
- Login: `http://localhost:8000/pilot/`
- Prévia do workspace: `http://localhost:8000/pilot/?preview=1`

Os links relativos funcionam tanto no domínio personalizado quanto em um GitHub Pages hospedado sob o nome do repositório. GitHub Pages deve publicar `main`, pasta `/`.

## O que funciona nesta etapa

- Links do menu e rodapé da landing page para o portal.
- Prévia explícita das áreas Overview, Downloads, Getting started, Release notes, Support e Account.
- Navegação por hash, incluindo abertura direta de uma seção na prévia.
- Validação dos campos e confirmação da nova senha.
- Mostrar/ocultar senha e diálogos com fechamento por Escape.
- Cópia de comandos e do checksum, com seleção de texto quando a área de transferência não estiver disponível.
- Links de suporte que abrem o aplicativo de e-mail do visitante.

## Limite atual: somente frontend

Não há autenticação nem autorização implementadas. O formulário de login **não** concede acesso; mostra que o serviço ainda está indisponível. A opção “Explore the portal” abre uma prévia pública sem login e com aviso permanente.

Nenhuma senha é persistida, enviada ou registrada. Os formulários não têm campos nomeados para envio nativo e só habilitam a submissão depois que seus handlers estão conectados. Todos os métodos de `PilotService` rejeitam com `PILOT_NOT_CONNECTED`.

Os botões de download estão desativados e não há instaladores ou links privados no repositório. A versão e o SHA-256 mostrados são uma fotografia do release `v0.4.0-beta.2`, publicado em 9 de setembro de 2026. Nenhum ZIP portátil foi encontrado nesse release, portanto sua linha indica indisponibilidade. Alterar o visual ou adicionar `?preview=1` não representa autenticação.

## Próxima etapa: Supabase

Substituir `pilot/service.js` e conectar os resultados às telas:

| Operação | Integração futura |
| --- | --- |
| `signIn({ email, password })` | Supabase Auth; obter a sessão e verificar o acesso da empresa antes de renderizar dados privados |
| `resetPassword(email)` | Fluxo real de recuperação, com redirecionamento permitido e configuração de envio de e-mail |
| `changePassword({ currentPassword, newPassword })` | Sessão autenticada e atualização de senha |
| `getDownload(releaseId, artifactId)` | Autorizar acesso ativo ao piloto e emitir download autenticado ou URL temporária do bucket privado |

Também integrar sessão/saída, empresa, expiração do acesso, catálogo de releases e erros de acesso revogado. Implementar RLS para dados e Storage; esconder controles no navegador não protege arquivos. Desativar cadastro público e manter a criação de contas no painel administrativo.

Manter somente URL e chave publicável do projeto no cliente. Nunca colocar chave administrativa, service role, senhas, tokens de transferência ou URLs permanentes de arquivos privados neste repositório público.

Antes de ativar contas reais, remover a entrada pública da prévia ou isolá-la permanentemente de dados e serviços autenticados. O parâmetro `preview` deve continuar sendo apenas uma demonstração, sem influência sobre permissões. A interface atual não redireciona para o workspace ao submeter uma senha.

## Documentação do produto

O guia acompanha os comandos documentados do DEXIS 0.4: instalação no Windows, pack/inspect/verify/unpack, receptor local em loopback e transferência de duas versões com o mesmo token e diretório do receptor. Ele não provisiona um receptor de produção. As condições de licença são as fornecidas com o instalador.

## Validação

```sh
node --check pilot/service.js
node --check pilot/pilot.js
```

Os arquivos HTML, IDs, âncoras, rotas e dependências locais foram verificados. O bloqueio das operações de autenticação, alteração de conta e download também foi exercitado sem backend. Não foi realizado teste visual em navegador nesta etapa.
