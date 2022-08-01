import cors from "cors";
import express from "express";
import "express-async-errors";
import dotenv from "dotenv";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import recommendationRouter from "./routers/recommendationRouter.js";
import frontEndTestsRouter from "./routers/frontEndTestsRouter.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/recommendations", recommendationRouter);
if(process.env.MODE === "TEST") {
  app.use(frontEndTestsRouter);
}
app.use(errorHandlerMiddleware);

export default app;
