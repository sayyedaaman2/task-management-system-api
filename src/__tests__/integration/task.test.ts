import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("@/lib/redis", () => ({
  getRedisClient: () => ({
    get: () => Promise.resolve(null),
    set: () => Promise.resolve("OK"),
    setEx: () => Promise.resolve("OK"),
    del: () => Promise.resolve(1),
    connect: () => Promise.resolve(null),
  }),
}));

const { default: app } = await import("@/app.js");

const registerAndLogin = async () => {
  await request(app).post("/api/v1/auth/register").send({
    name: "Task User",
    email: "taskuser@example.com",
    password: "Test@1234",
  });

  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email: "taskuser@example.com",
    password: "Test@1234",
  });

  return loginRes.body.data.accessToken as string;
};

describe("Task Routes", () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await registerAndLogin();
  });

  describe("POST /api/v1/tasks", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request(app).post("/api/v1/tasks").send({});

      expect(res.status).toBe(401);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should return 201 and created task", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Test Task",
          description: "Test Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "low",
          status: "pending",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toBe("Test Task");
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/v1/tasks");

      expect(res.status).toBe(401);
    });

    it("should return 200 with paginated tasks", async () => {
      const res = await request(app)
        .get("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("page");
      expect(res.body).toHaveProperty("totalPages");
    });
  });

  describe("GET /api/v1/tasks/:id", () => {
    it("should return 400 if invalid task id", async () => {
      const res = await request(app)
        .get("/api/v1/tasks/invalidid")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });

    it("should return 404 if task not found", async () => {
      const res = await request(app)
        .get("/api/v1/tasks/64f1a2b3c4d5e6f7a8b9c0d1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 200 with task", async () => {
      const createRes = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Get Task",
          description: "Test Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "low",
          status: "pending",
        });

      const res = await request(app)
        .get(`/api/v1/tasks/${createRes.body._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(createRes.body._id);
    });
  });

  describe("PUT /api/v1/tasks/:id", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .put("/api/v1/tasks/64f1a2b3c4d5e6f7a8b9c0d1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should return 404 if task not found", async () => {
      const res = await request(app)
        .put("/api/v1/tasks/64f1a2b3c4d5e6f7a8b9c0d1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Updated Task",
          description: "Updated Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "high",
          status: "in progress",
        });

      expect(res.status).toBe(404);
    });

    it("should return 200 with updated task", async () => {
      const createRes = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Update Task",
          description: "Test Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "low",
          status: "pending",
        });

      const res = await request(app)
        .put(`/api/v1/tasks/${createRes.body._id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Updated Task",
          description: "Updated Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "high",
          status: "in progress",
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Task");
      expect(res.body.priority).toBe("high");
    });
  });

  describe("DELETE /api/v1/tasks/:id", () => {
    it("should return 404 if task not found", async () => {
      const res = await request(app)
        .delete("/api/v1/tasks/64f1a2b3c4d5e6f7a8b9c0d1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 200 on successful delete", async () => {
      const createRes = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Delete Task",
          description: "Test Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "low",
          status: "pending",
        });

      const res = await request(app)
        .delete(`/api/v1/tasks/${createRes.body._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("deleted successfully");
    });
  });
});
