import { ConfluenceClient } from "../src";

// Smoke test: guards the package entry point and the test toolchain wiring.
it("exports the client", () => {
  expect(typeof ConfluenceClient.extractPageIdFromUrl).toBe("function");
});
