import { DEBUG } from "@logger";

export function shouldInclude(): {
  shouldIncludeFrontend: boolean;
  shouldIncludeBackend: boolean;
  shouldIncludeWebserver: boolean;
} {
  const shouldIncludeFrontend = process.argv.includes("--withFrontend");
  const shouldIncludeBackend = process.argv.includes("--withBackend");
  const shouldIncludeWebserver = process.argv.includes("--withWebserver");

  if (![shouldIncludeFrontend, shouldIncludeBackend, shouldIncludeWebserver].some(Boolean)) {
    DEBUG("Didn't find any flags, building everything");

    return {
      shouldIncludeFrontend: true,
      shouldIncludeBackend: true,
      shouldIncludeWebserver: true
    };
  }

  DEBUG`Found some flags: ${{
    withFrontend: shouldIncludeFrontend,
    withBackend: shouldIncludeBackend,
    withWebserver: shouldIncludeWebserver
  }}`;

  return {
    shouldIncludeFrontend,
    shouldIncludeBackend,
    shouldIncludeWebserver
  };
}
