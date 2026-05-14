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

const { default: authService } = await import("@/service/auth.service.js");
const { AppError } = await import("@/utils/error.js");

describe("AuthService", () => {
  describe("register", () => {
    it("should register a new user successfully", async () => {
      const user = await authService.register("Test User", "test@example.com", "Test@1234");

      expect(user).toHaveProperty("_id");
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("Test User");
    });

    it("should throw AppError if user already exists", async () => {
      await authService.register("Test User", "duplicate@example.com", "Test@1234");

      await expect(
        authService.register("Test User", "duplicate@example.com", "Test@1234")
      ).rejects.toThrow(AppError);
    });

    it("should hash the password before saving", async () => {
      const user = await authService.register("Test User", "hash@example.com", "Test@1234");

      expect(user.password).not.toBe("Test@1234");
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await authService.register("Login User", "login@example.com", "Test@1234");
    });

    it("should return user on valid credentials", async () => {
      const user = await authService.login("login@example.com", "Test@1234");

      expect(user).toHaveProperty("_id");
      expect(user.email).toBe("login@example.com");
    });

    it("should throw AppError if user not found", async () => {
      await expect(authService.login("notfound@example.com", "Test@1234")).rejects.toThrow(
        AppError
      );
    });

    it("should throw AppError if password is incorrect", async () => {
      await expect(authService.login("login@example.com", "WrongPass")).rejects.toThrow(AppError);
    });
  });

  describe("getProfile", () => {
    it("should return user profile without password", async () => {
      const registered = await authService.register(
        "Profile User",
        "profile@example.com",
        "Test@1234"
      );

      const profile = await authService.getProfile(registered._id.toString());

      expect(profile).toHaveProperty("_id");
      expect(profile?.password).toBeUndefined();
    });

    it("should return null if user not found", async () => {
      const profile = await authService.getProfile("64f1a2b3c4d5e6f7a8b9c0d1");

      expect(profile).toBeNull();
    });
  });
});
