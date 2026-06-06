# Setup Painel Admin — Decap CMS

Passos manuais (única vez, ~20min total) pra ativar o painel `/admin`.

## 1. Cria GitHub OAuth App

1. Vai em: https://github.com/settings/developers
2. Clica **OAuth Apps** → **New OAuth App**
3. Preenche:
   - **Application name:** `Vitor Mateus CMS`
   - **Homepage URL:** `https://mmarcelocaldeira-source.github.io/vitormateus/`
   - **Authorization callback URL:** `https://decap-oauth-vitormateus.<seu-subdominio>.workers.dev/callback`
     - (vai ajustar depois de criar o Worker no passo 2)
4. **Register application**
5. Anota o **Client ID**
6. Clica **Generate a new client secret** → anota o **Client Secret** (só aparece uma vez)

## 2. Cria Cloudflare Worker (OAuth proxy)

1. Cria conta gratuita em https://workers.cloudflare.com
2. Dashboard → **Workers & Pages** → **Create application** → **Create Worker**
3. Nome do Worker: `decap-oauth-vitormateus`
4. Deploy default. Depois clica **Edit code**.
5. Apaga código padrão, cola o conteúdo de `admin/cloudflare-worker-oauth.js`
6. **Save and Deploy**
7. Volta no dashboard do Worker → **Settings** → **Variables and Secrets**
8. Adiciona dois **secrets** (clica "Add" + escolhe tipo Secret):
   - `GITHUB_CLIENT_ID` = (Client ID do passo 1.5)
   - `GITHUB_CLIENT_SECRET` = (Client Secret do passo 1.6)
9. Anota a URL do Worker (algo tipo `https://decap-oauth-vitormateus.<subdominio>.workers.dev`)

## 3. Atualiza GitHub OAuth callback

Volta na OAuth App do GitHub (passo 1) e edita **Authorization callback URL** com URL real:

```
https://decap-oauth-vitormateus.<subdominio>.workers.dev/callback
```

Salva.

## 4. Atualiza `admin/config.yml`

Abre `admin/config.yml` e troca a linha:

```yaml
base_url: https://decap-oauth-vitormateus.SUBSTITUIR.workers.dev
```

Pela URL real do Worker (sem `/callback`, sem barra no final):

```yaml
base_url: https://decap-oauth-vitormateus.<subdominio>.workers.dev
```

Commit + push.

## 5. Convida o cliente como colaborador

GitHub → repo settings → Collaborators → Add → conta do cliente.

Cliente precisa:
- Ter conta GitHub
- Aceitar convite por email
- Confirmar 2FA (recomendado)

## 6. Cliente acessa o painel

URL: `https://mmarcelocaldeira-source.github.io/vitormateus/admin/`

Login com conta GitHub. Cliente vê 4 categorias, pode editar projetos, trocar fotos, adicionar novos projetos.

## Manutenção

- **Custo:** $0/mês (Cloudflare Workers free tier = 100k requests/dia; OAuth são poucos requests/login)
- **Atualizações Decap CMS:** automáticas via CDN (`@^3.0.0`)
- **Tutorial pro cliente:** ver `admin/MANUAL-CLIENTE.md` (criar depois)
