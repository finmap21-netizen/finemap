import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import companyRouter from "./company";
import dashboardRouter from "./dashboard";
import penaltiesRouter from "./penalties";
import calendarRouter from "./calendar";
import remindersRouter from "./reminders";
import knowledgeRouter from "./knowledge";
import newsRouter from "./news";
import rulesRouter from "./rules";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(companyRouter);
router.use(dashboardRouter);
router.use(penaltiesRouter);
router.use(calendarRouter);
router.use(remindersRouter);
router.use(knowledgeRouter);
router.use(newsRouter);
router.use(rulesRouter);
router.use(adminRouter);

export default router;
