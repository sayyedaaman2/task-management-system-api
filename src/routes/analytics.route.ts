import {Router} from "express";

import * as adminController from "@/controller/admin.controller.js";
const router = Router();

router.get("/:id",adminController.getUserActivity)
router.get("/",adminController.getSystemUsageData)

export default router;