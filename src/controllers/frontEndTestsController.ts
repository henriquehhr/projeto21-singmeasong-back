import { Request, Response } from "express";
import * as frontEndTestsService from "../services/frontEndTestsService.js";

export async function removeAll(req: Request, res: Response) {
  await frontEndTestsService.removeAll();
  res.sendStatus(200);
}