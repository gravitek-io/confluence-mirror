// Main exports for confluence-mirror-core

// Client and error handling
export { ConfluenceClient, ConfluenceApiError } from "./client/confluence-client";

// Authentication strategies
export {
  BasicAuthStrategy,
  OAuth2Strategy,
  type AuthStrategy,
} from "./client/auth-strategies";

// ADF processors
export { processADFWithMedia } from "./processors/media-processor";
export { processADFWithTOC } from "./processors/toc-processor";
export {
  processADF,
  extractTextFromADFNodes,
  generateSlug,
} from "./processors/adf-processor";

// Types
export * from "./types";