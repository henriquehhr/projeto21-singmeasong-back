import { Router } from "express";
import { removeAll } from "../controllers/frontEndTestsController.js";

const frontEndTestsRouter = Router();

frontEndTestsRouter.delete("/recommendatios", removeAll);

export default frontEndTestsRouter;