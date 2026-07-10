import { jest } from "@jest/globals";
import {
  createCaption,
  getCaptionStatus,
} from "../../../src/api/controllers/caption.controller.js";
import { AppError } from "../../../src/utils/errors.js";

describe("Caption controller", () => {
  describe("getCaptionStatus", () => {
    it("should return 404 if job not found", () => {
      const req = { params: { id: "non-existent-id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      getCaptionStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
