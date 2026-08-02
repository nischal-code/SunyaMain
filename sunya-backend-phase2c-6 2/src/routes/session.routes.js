import { Router } from "express";
import * as sessionController from "../controllers/session.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", sessionController.getMySessions);
router.delete("/all-others", sessionController.revokeAllOtherSessions);
router.delete("/:sessionId", sessionController.revokeSession);

export default router;
