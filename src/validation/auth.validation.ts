import joi from "joi";

import { UserStatus, UserTypes } from "@/utils/constant.js";

export const signUpValidation = joi.object({
  name: joi.string().trim().min(3).max(50).required(),

  email: joi.string().trim().lowercase().email().required(),

  password: joi
    .string()
    .min(8)
    .max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .required()
    .messages({
      "string.pattern.base": "Password must contain uppercase, lowercase and number",
    }),

  userType: joi
    .string()
    .valid(...UserTypes.values)
    .default(UserTypes.USER),

  userStatus: joi
    .string()
    .valid(...UserStatus.values)
    .default(UserStatus.ACTIVE),
});

export const loginValidation = joi.object({
  email: joi.string().trim().lowercase().email().required(),

  password: joi.string().min(8).max(128).required(),
});
