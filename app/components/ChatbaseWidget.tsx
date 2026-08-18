import Script from "next/script";

const chatbaseAgentId = "fPfaIJRRxKKRL2FQSWrXw";

export function ChatbaseWidget() {
  return (
    <Script
      id="chatbase-widget-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            if (!window.chatbase || window.chatbase("getState") !== "initialized") {
              window.chatbase = (...arguments) => {
                if (!window.chatbase.q) window.chatbase.q = [];
                window.chatbase.q.push(arguments);
              };
              window.chatbase = new Proxy(window.chatbase, {
                get(target, prop) {
                  if (prop === "q") return target.q;
                  return (...args) => target(prop, ...args);
                },
              });
            }

            const loadChatbase = function () {
              if (document.getElementById(${JSON.stringify(chatbaseAgentId)})) return;

              const script = document.createElement("script");
              script.src = "https://www.chatbase.co/embed.min.js";
              script.id = ${JSON.stringify(chatbaseAgentId)};
              script.domain = "www.chatbase.co";
              document.body.appendChild(script);
            };

            if (document.readyState === "complete") {
              loadChatbase();
            } else {
              window.addEventListener("load", loadChatbase, { once: true });
            }
          })();
        `,
      }}
    />
  );
}
