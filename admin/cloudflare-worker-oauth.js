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
  return new Response(
    `<!doctype html><html><body><script>
      (function(){
        function send(){
          if(!window.opener){return;}
          window.opener.postMessage(${JSON.stringify(message)}, "*");
        }
        window.addEventListener("message", function(e){
          if(e.data === "authorizing:github"){ send(); }
        });
        send();
      })();
    </script></body></html>`,
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
      if (tokenData.error) return renderPopupResponse("error", tokenData);

      return renderPopupResponse("success", {
        token: tokenData.access_token,
        provider: "github"
      });
    }

    return new Response("Decap CMS OAuth proxy — use /auth", { status: 200 });
  }
};
