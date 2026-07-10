import {
  afterValidateInput,
  afterQualityCheck,
} from "../../../../src/graph/edges/conditionalEdges.js";

describe("Conditional edges", () => {
  const errorState = { error: "Some error" };
  const okState = { error: null };

  it("afterValidateInput routes to handleError on error", () => {
    expect(afterValidateInput(errorState)).toBe("handleError");
  });

  it("afterValidateInput routes to fetchVideo on success", () => {
    expect(afterValidateInput(okState)).toBe("fetchVideo");
  });

  it("afterQualityCheck routes to __end__ if no error", () => {
    expect(afterQualityCheck(okState)).toBe("__end__");
  });

  it("afterQualityCheck routes to handleError on error", () => {
    expect(afterQualityCheck(errorState)).toBe("handleError");
  });
});
