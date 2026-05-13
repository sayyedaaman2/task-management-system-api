export const UserTypes = {
  ADMIN: "admin",
  USER: "user",
  values: ["admin", "user"],
} as const;

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  values: ["active", "inactive"],
} as const;

export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in progress",
  COMPLETED: "completed",
  values: ["pending", "in progress", "completed"],
} as const;

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  values: ["low", "medium", "high"],
} as const;
