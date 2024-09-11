import { Router } from "express";
import {healthcheck} from "../controllers/healthCheck.controller" 

const healthCheckRouter = Router();

healthCheckRouter.route("/health-check").get(healthcheck)

export default healthCheckRouter;