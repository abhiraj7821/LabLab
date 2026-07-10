import supertest from "supertest";
import { createApp } from "../../src/api/server.js";

const app = createApp();

describe("API integration", () => {
  it("GET /health returns 200", async () => {
    const res = await supertest(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/v1/caption without videoUrl returns 400", async () => {
    const res = await supertest(app)
      .post("/api/v1/caption")
      .send({ styles: ["formal"] });
    expect(res.status).toBe(400);
  });
});
