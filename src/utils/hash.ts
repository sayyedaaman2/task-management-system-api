import bcrypt from "bcryptjs";

import serverConfig from "../config/env.js";

export const hashPassword = async (password:string)=>{
    const salt = await bcrypt.genSalt(serverConfig.bcryptSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const comparePassword = async (password:string, hashedPassword:string)=>{
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}