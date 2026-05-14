import "dotenv/config";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import serverConfig from "@/config/env.js";
import TaskModel from "@/model/task.model.js";
import UserModel from "@/model/user.model.js";
import { UserTypes, UserStatus, TaskStatus, TaskPriority } from "@/utils/constant.js";
import logger from "@/utils/logger.js";

const connectDB = async () => {
  await mongoose.connect(serverConfig.mongodbUri);
  logger.info("MongoDB Connected");
};
const seedDatabase = async () => {
  await connectDB();

  await TaskModel.deleteMany({});
  await UserModel.deleteMany({});

  logger.info("Old data cleared");

  const hashedPassword = await bcrypt.hash("Password@123", serverConfig.bcryptSaltRounds);

  const admin = await UserModel.create({
    name: "System Admin",
    email: "admin@example.com",
    password: hashedPassword,
    userType: UserTypes.ADMIN,
    userStatus: UserStatus.ACTIVE,
  });

  logger.info("Admin created");

  const users = [];

  for (let i = 1; i <= 5; i++) {
    users.push({
      name: faker.person.fullName(),

      email: `user${i}@example.com`,

      password: hashedPassword,

      userType: UserTypes.USER,

      userStatus: UserStatus.ACTIVE,
    });
  }

  const createdUsers = await UserModel.insertMany(users);

  logger.info("Users created");

  const allUsers = [admin, ...createdUsers];

  const tasks = [];

  for (const user of allUsers) {
    for (let i = 1; i <= 25; i++) {
      tasks.push({
        title: faker.company.buzzPhrase(),

        description: faker.lorem.paragraph(),

        status: faker.helpers.arrayElement(TaskStatus.values),

        priority: faker.helpers.arrayElement(TaskPriority.values),

        dueDate: faker.date.future(),

        assignedTo: user._id,
      });
    }
  }

  await TaskModel.insertMany(tasks);

  logger.info("Tasks created");

  logger.info("Database seeded successfully");
};

seedDatabase()
  .then(async () => {
    await mongoose.disconnect();

    logger.info("Database disconnected");
    return true;
  })
  .catch(async (error) => {
    logger.error(error);

    await mongoose.disconnect();
  });
