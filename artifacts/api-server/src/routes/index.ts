import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import meRouter from "./me";
import clientsRouter from "./clients";
import auditsRouter from "./audits";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(meRouter);
router.use(clientsRouter);
router.use(auditsRouter);

export default router;
