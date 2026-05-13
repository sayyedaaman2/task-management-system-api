import type{ NextFunction, Request, Response } from 'express';

import { UserTypes } from '@/utils/constant.js';
import { AppError } from '@/utils/error.js';
import {verifyToken} from "@/utils/jwt.js"

export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded; 
        next();
    } catch (err) {
        next(err);
    }
}

export const verifyAdminAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
    try {
        if(req.user.UserType !==  UserTypes.ADMIN){
            next(new AppError("Access denied",400))
        }
        next();
    } catch (err) {
        next(err);
    }
}