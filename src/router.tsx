import { createRouter as createTanStackRouter, ErrorComponent } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// import type { ReactNode } from "react";
// import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { /*TanstackQueryProvider,*/ getContext } from "./integrations/tanstack-query/root-provider";
import Loader from "./components/Loader";

export function getRouter() {
  const context = getContext();

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    defaultPendingComponent: () => (
      <div className="p-2 flex justify-center items-center">
        <Loader />
      </div>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
