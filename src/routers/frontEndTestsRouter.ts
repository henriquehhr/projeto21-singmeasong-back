import { Router } from "express";
import { removeAll, createMany } from "../controllers/frontEndTestsController.js";

const frontEndTestsRouter = Router();

frontEndTestsRouter.delete("/recommendations", removeAll);
frontEndTestsRouter.post("/recommendations/test", createMany);

export default frontEndTestsRouter;