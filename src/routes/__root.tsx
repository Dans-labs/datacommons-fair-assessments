import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import { getLocale } from "@/paraglide/runtime";
import appCss from "@/styles.css?url";
import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "#/components/ThemeProvider";
import Header from "#/components/Header";
import Footer from "#/components/Footer";
import { getApiServerConfig } from "#/api/api-config";
import { setApiBaseUrl } from "#/api/client";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }
    const apiConfig = await getApiServerConfig();
    setApiBaseUrl(apiConfig.baseUrl);
    return { apiConfig };
  },

  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "EOSC DataCommons FAIR Assessments",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        children: `
        (function() {
          var theme = localStorage.getItem('theme') || 'system';
          var isDark = theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        })();
      `,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-linear-to-b from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 min-h-screen flex flex-col">
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
