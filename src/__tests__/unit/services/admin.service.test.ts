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

const { default: adminService } = await import("@/service/admin.service.js");
const { default: authService } = await import("@/service/auth.service.js");
const { default: taskService } = await import("@/service/task.service.js");
const { AppError } = await import("@/utils/error.js");

const createUser = async () => {
  const email = `user_${Date.now()}@example.com`;
  const user = await authService.register("Test User", email, "Test@1234");
  return user;
};

const createTask = async (userId: string) => {
  return await taskService.createTask({
    title: "Test Task",
    description: "Test Description",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    priority: "low",
    status: "pending",
    assignedTo: userId as never,
  });
};

describe("AdminService", () => {
  describe("getAllUsers", () => {
    it("should return paginated users", async () => {
      await createUser();
      const result = await adminService.getAllUsers({});

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should filter by userType", async () => {
      const result = await adminService.getAllUsers({ userType: "user" });

      expect(result.data.every((u) => u.userType === "user")).toBe(true);
    });

    it("should throw AppError for invalid userType", async () => {
      await expect(adminService.getAllUsers({ userType: "invalid" })).rejects.toThrow(AppError);
    });

    it("should throw AppError for invalid userStatus", async () => {
      await expect(adminService.getAllUsers({ userStatus: "invalid" })).rejects.toThrow(AppError);
    });

    it("should filter by search", async () => {
      await authService.register("SearchUser", "searchuser@example.com", "Test@1234");
      const result = await adminService.getAllUsers({ search: "SearchUser" });

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const user = await createUser();
      const deleted = await adminService.deleteUser(user._id.toString());

      expect(deleted?._id.toString()).toBe(user._id.toString());
    });

    it("should throw AppError if user not found", async () => {
      await expect(adminService.deleteUser("64f1a2b3c4d5e6f7a8b9c0d1")).rejects.toThrow(AppError);
    });
  });

  describe("getAllTasks", () => {
    it("should return paginated tasks", async () => {
      const user = await createUser();
      await createTask(user._id.toString());

      const result = await adminService.getAllTasks({});

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
    });
  });

  describe("getAllTasksByUser", () => {
    it("should return tasks for specific user", async () => {
      const user = await createUser();
      await createTask(user._id.toString());

      const result = await adminService.getAllTasksByUser(user._id.toString(), {});

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should return empty data if user has no tasks", async () => {
      const user = await createUser();
      const result = await adminService.getAllTasksByUser(user._id.toString(), {});

      expect(result.total).toBe(0);
    });
  });

  describe("deleteTask", () => {
    it("should delete task successfully", async () => {
      const user = await createUser();
      const task = await createTask(user._id.toString());

      const deleted = await adminService.deleteTask(task._id.toString());

      expect(deleted._id.toString()).toBe(task._id.toString());
    });

    it("should throw AppError if task not found", async () => {
      await expect(adminService.deleteTask("64f1a2b3c4d5e6f7a8b9c0d1")).rejects.toThrow(AppError);
    });
  });

  describe("analyzeUserActivity", () => {
    it("should return user activity stats", async () => {
      const user = await createUser();
      await createTask(user._id.toString());

      const result = await adminService.analyzeUserActivity(user._id.toString());

      expect(result).toHaveProperty("totalTasks");
      expect(result).toHaveProperty("completedTasks");
      expect(result).toHaveProperty("pendingTasks");
      expect(result).toHaveProperty("overdueTasks");
      expect(result.totalTasks).toBeGreaterThan(0);
    });
  });

  describe("analyzeSystemUsage", () => {
    it("should return system usage stats", async () => {
      const result = await adminService.analyzeSystemUsage();

      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("totalTasks");
      expect(result).toHaveProperty("completedTasks");
      expect(result).toHaveProperty("pendingTasks");
    });
  });
});
