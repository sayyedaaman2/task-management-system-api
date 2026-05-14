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
describe("Auth Routes", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should return 400 if all fields are missing", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 201 and user object on success", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "Test@1234",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain("successfully");
      expect(res.body.user).toHaveProperty("_id");
    });

    it("should return 400 if email already exists", async () => {
      await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "duplicate@example.com",
        password: "Test@1234",
      });

      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "duplicate@example.com",
        password: "Test@1234",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        password: "Test@1234",
      });
    });

    it("should return 400 if all fields are missing", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 200 with accessToken and set refreshToken cookie", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "Test@1234",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data.user).not.toHaveProperty("password");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "notfound@example.com",
        password: "Test@1234",
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("not found");
    });

    it("should return 400 if password is incorrect", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "WrongPass",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid password");
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    it("should return 401 if refresh token is missing", async () => {
      const res = await request(app).get("/api/v1/auth/refresh-token").send({});

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("No token provided");
    });

    it("should return 200 with new accessToken if refresh token is valid", async () => {
  await request(app).post("/api/v1/auth/register").send({
    name: "Refresh User",
    email: "refresh@example.com",
    password: "Test@1234",
  });

  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email: "refresh@example.com",
    password: "Test@1234",
  });

  console.log("login status:", loginRes.status);
  console.log("cookies:", loginRes.headers["set-cookie"]);

const cookies = (loginRes.headers["set-cookie"] as unknown) as string[];
  const res = await request(app)
    .get("/api/v1/auth/refresh-token")
    .set("Cookie", cookies)
    .set("Authorization", `Bearer ${loginRes.body.data.accessToken}`);

  console.log("refresh status:", res.status);
  console.log("refresh body:", res.body);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("accessToken");
});
  });

  describe("GET /api/v1/auth/profile", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/v1/auth/profile");

      expect(res.status).toBe(401);
    });

    it("should return 200 with user profile if token is valid", async () => {
      await request(app).post("/api/v1/auth/register").send({
        name: "Profile User",
        email: "profile@example.com",
        password: "Test@1234",
      });

      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "profile@example.com",
        password: "Test@1234",
      });

      const { accessToken } = loginRes.body.data;

      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).not.toHaveProperty("password");
    });
  });
});
