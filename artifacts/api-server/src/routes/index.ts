import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import oauthRouter from "./oauth";
import meRouter from "./me";
import clientsRouter from "./clients";
import auditsRouter from "./audits";
import connectionsRouter from "./connections";
import planRouter from "./plan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(oauthRouter);
router.use(meRouter);
router.use(clientsRouter);
router.use(auditsRouter);
router.use(connectionsRouter);
router.use(planRouter);

export default router;
