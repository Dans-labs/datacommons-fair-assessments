import { createServerFn } from "@tanstack/react-start";
import { getApiConfig } from "./env.server";

export const getApiServerConfig = createServerFn({ method: "GET" }).handler(async () => {
  return getApiConfig();
});
