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

const { default: taskService } = await import("@/service/task.service.js");
const { default: authService } = await import("@/service/auth.service.js");
const { AppError } = await import("@/utils/error.js");

const createUser = async () => {
  return await authService.register("Task User", `taskuser_${Date.now()}@example.com`, "Test@1234");
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

describe("TaskService", () => {
  describe("createTask", () => {
    it("should create a task successfully", async () => {
      const user = await createUser();
      const task = await createTask(user._id.toString());

      expect(task).toHaveProperty("_id");
      expect(task.title).toBe("Test Task");
      expect(task.assignedTo.toString()).toBe(user._id.toString());
    });

    it("should throw AppError if assignedTo user not found", async () => {
      await expect(
        taskService.createTask({
          title: "Test Task",
          description: "Test Description",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          priority: "low",
          status: "pending",
          assignedTo: "64f1a2b3c4d5e6f7a8b9c0d1" as never,
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getAllTasks", () => {
    it("should return paginated tasks for a user", async () => {
      const user = await createUser();
      await createTask(user._id.toString());

      const result = await taskService.getAllTasks(user._id.toString(), {});

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("totalPages");
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should return empty data if user has no tasks", async () => {
      const user = await createUser();
      const result = await taskService.getAllTasks(user._id.toString(), {});

      expect(result.total).toBe(0);
      expect(result.data.length).toBe(0);
    });
  });

  describe("getTaskById", () => {
    it("should return task by id", async () => {
      const user = await createUser();
      const task = await createTask(user._id.toString());

      const result = await taskService.getTaskById(task._id.toString(), user._id.toString());

      expect(result._id.toString()).toBe(task._id.toString());
    });

    it("should throw AppError for invalid task id", async () => {
      const user = await createUser();

      await expect(taskService.getTaskById("invalidid", user._id.toString())).rejects.toThrow(
        AppError
      );
    });

    it("should throw AppError if task not found", async () => {
      const user = await createUser();

      await expect(
        taskService.getTaskById("64f1a2b3c4d5e6f7a8b9c0d1", user._id.toString())
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateTask", () => {
    it("should update task successfully", async () => {
      const user = await createUser();
      const task = await createTask(user._id.toString());

      const updated = await taskService.updateTask(task._id.toString(), user._id.toString(), {
        title: "Updated Task",
      });

      expect(updated.title).toBe("Updated Task");
    });

    it("should throw AppError if task not found or unauthorized", async () => {
      const user = await createUser();

      await expect(
        taskService.updateTask("64f1a2b3c4d5e6f7a8b9c0d1", user._id.toString(), {
          title: "Updated",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("deleteTask", () => {
    it("should delete task successfully", async () => {
      const user = await createUser();
      const task = await createTask(user._id.toString());

      const deleted = await taskService.deleteTask(task._id.toString(), user._id.toString());

      expect(deleted._id.toString()).toBe(task._id.toString());
    });

    it("should throw AppError if task not found or unauthorized", async () => {
      const user = await createUser();

      await expect(
        taskService.deleteTask("64f1a2b3c4d5e6f7a8b9c0d1", user._id.toString())
      ).rejects.toThrow(AppError);
    });
  });
});
