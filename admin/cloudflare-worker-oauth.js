// Cloudflare Worker — OAuth proxy para Decap CMS + GitHub
// Deploy em workers.cloudflare.com (gratuito)
// Define os secrets: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
//
// Endpoints:
//   /auth      → redireciona usuário pro GitHub OAuth
//   /callback  → recebe code do GitHub, troca por token, devolve pro Decap

const SCOPES = "repo,user";

const renderPopupResponse = (status, content) => {
  const payload = JSON.stringify(content);
  const message = `authorization:github:${status}:${payload}`;
  const contentSafe = JSON.stringify(content, null, 2)
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui;padding:24px;background:#111;color:#eee">
      <h2>OAuth ${status}</h2>
      <p id="status">Conectando ao Decap CMS...</p>
      <details ${status === "error" ? "open" : ""} style="margin-bottom:12px">
        <summary>Conteúdo OAuth</summary>
        <pre style="background:#000;padding:12px;font-size:12px;white-space:pre-wrap">${contentSafe}</pre>
      </details>
      <pre id="log" style="background:#000;padding:12px;font-size:12px;white-space:pre-wrap"></pre>
      <script>
        var log = document.getElementById('log');
        var statusEl = document.getElementById('status');
        function append(line){ log.textContent += line + "\\n"; }
        append("status: ${status}");
        append("opener exists: " + (!!window.opener));
        if (!window.opener) {
          statusEl.textContent = "Erro: popup sem janela pai. Feche e tente de novo.";
          append("ERROR: window.opener is null");
        } else {
          var sent = false;
          function receiveMessage(e) {
            append("received from opener: " + e.origin);
            window.opener.postMessage(${JSON.stringify(message)}, e.origin);
            window.removeEventListener("message", receiveMessage, false);
            sent = true;
            statusEl.textContent = "Token enviado pro Decap. NÃO feche esta janela ainda — confirma se o /admin carregou. Se sim, fecha. Se não, manda print desta tela.";
          }
          window.addEventListener("message", receiveMessage, false);
          append("posting 'authorizing:github' to opener");
          window.opener.postMessage("authorizing:github", "*");
          setTimeout(function(){
            if (!sent) {
              append("WARNING: opener did not respond in 5s. Trying fallback broadcast.");
              window.opener.postMessage(${JSON.stringify(message)}, "*");
              statusEl.textContent = "Tentativa fallback. Você pode fechar esta janela.";
            }
          }, 5000);
        }
      </script>
    </body></html>`,
    { headers: { "content-type": "text/html;charset=UTF-8" } }
  );
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const redirectUri = `${url.origin}/callback`;
      const ghUrl = new URL("https://github.com/login/oauth/authorize");
      ghUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      ghUrl.searchParams.set("redirect_uri", redirectUri);
      ghUrl.searchParams.set("scope", SCOPES);
      ghUrl.searchParams.set("state", state);
      return Response.redirect(ghUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return renderPopupResponse("error", { message: "missing code" });

      // Debug: confirm secrets are loaded
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        return renderPopupResponse("error", {
          message: "missing secrets",
          client_id_present: !!env.GITHUB_CLIENT_ID,
          client_secret_present: !!env.GITHUB_CLIENT_SECRET
        });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "content-type": "application/json", "accept": "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
        return renderPopupResponse("error", {
          github_error: tokenData.error || "no_access_token",
          description: tokenData.error_description || "GitHub did not return an access_token",
          raw: tokenData
        });
      }

      return renderPopupResponse("success", {
        token: tokenData.access_token,
        provider: "github"
      });
    }

    return new Response("Decap CMS OAuth proxy — use /auth", { status: 200 });
  }
};
