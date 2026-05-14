import "dotenv/config"

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

import UserModel from "@/model/user.model.js";
import TaskModel from "@/model/task.model.js";

import {
  UserTypes,
  UserStatus,
  TaskStatus,
  TaskPriority,
} from "@/utils/constant.js";

import serverConfig from "@/config/env.js";

const connectDB = async () => {
  await mongoose.connect(serverConfig.mongodbUri);

  console.log("MongoDB Connected");
};

const seedDatabase = async () => {

  try {

    await connectDB();

    // clear database
    await TaskModel.deleteMany({});
    await UserModel.deleteMany({});

    console.log("Old data cleared");

    // hash password
    const hashedPassword =
      await bcrypt.hash("Password@123", 10);

    // create admin
    const admin = await UserModel.create({
      name: "System Admin",
      email: "admin@example.com",
      password: hashedPassword,
      userType: UserTypes.ADMIN,
      userStatus: UserStatus.ACTIVE,
    });

    console.log("Admin created");

    // create users
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

    const createdUsers =
      await UserModel.insertMany(users);

    console.log("Users created");

    // all users including admin
    const allUsers = [
      admin,
      ...createdUsers,
    ];

    // generate tasks
    const tasks = [];

    for (const user of allUsers) {

      for (let i = 1; i <= 25; i++) {

        tasks.push({

          title:
            faker.company.buzzPhrase(),

          description:
            faker.lorem.paragraph(),

          status:
            faker.helpers.arrayElement(
              TaskStatus.values
            ),

          priority:
            faker.helpers.arrayElement(
              TaskPriority.values
            ),

          dueDate:
            faker.date.future(),

          assignedTo:
            user._id,
        });
      }
    }

    await TaskModel.insertMany(tasks);

    console.log("Tasks created");

    console.log("Database seeded successfully");

    process.exit(0);

  } catch (error) {

    console.error(error);

    process.exit(1);
  }
};

seedDatabase();