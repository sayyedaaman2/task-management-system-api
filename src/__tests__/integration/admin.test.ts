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
const { default: UserModel } = await import("@/model/user.model.js");

const registerAndLogin = async (isAdmin = false) => {
  const email = isAdmin ? "admin@example.com" : "user@example.com";

  await request(app).post("/api/v1/auth/register").send({
    name: isAdmin ? "Admin User" : "Regular User",
    email,
    password: "Test@1234",
  });

  if (isAdmin) {
    await UserModel.findOneAndUpdate({ email }, { userType: "admin" });
  }

  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email,
    password: "Test@1234",
  });

  return loginRes.body.data.accessToken as string;
};
describe("Admin Routes", () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    adminToken = await registerAndLogin(true);
    userToken = await registerAndLogin(false);
  });
 
  describe("GET /api/v1/admin/users", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });

    it("should return 400 if non-admin tries to access", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it("should return 200 with paginated users for admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("page");
      expect(res.body).toHaveProperty("totalPages");
    });
  });

  describe("DELETE /api/v1/admin/users/:id", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request(app).delete("/api/v1/admin/users/64f1a2b3c4d5e6f7a8b9c0d1");
      expect(res.status).toBe(401);
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app)
        .delete("/api/v1/admin/users/64f1a2b3c4d5e6f7a8b9c0d1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it("should return 200 on successful delete", async () => {
      const usersRes = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      const userId = usersRes.body.data[0]._id;

      const res = await request(app)
        .delete(`/api/v1/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("deleted successfully");
    });
  });

  describe("GET /api/v1/admin/tasks", () => {
    it("should return 200 with paginated tasks for admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/tasks")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("total");
    });
  });

  describe("GET /api/v1/admin/users/:id/tasks", () => {
    it("should return 200 with tasks for specific user", async () => {
      const usersRes = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      const userId = usersRes.body.data[0]._id;

      const res = await request(app)
        .get(`/api/v1/admin/users/${userId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("DELETE /api/v1/admin/tasks/:id", () => {
    it("should return 404 if task not found", async () => {
      const res = await request(app)
        .delete("/api/v1/admin/tasks/64f1a2b3c4d5e6f7a8b9c0d1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/admin/analytics", () => {
    it("should return 200 with system usage data", async () => {
      const res = await request(app)
        .get("/api/v1/admin/analytics")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });

    it("should return 200 with user activity data", async () => {
      const usersRes = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      const userId = usersRes.body.data[0]._id;

      const res = await request(app)
        .get(`/api/v1/admin/analytics/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  });
});