import express from "express";
import {
  addProjectIn,
  assignTask,
  create,
  get,
  getAllUsers,
  getProjectIn,
  remove,
  update,
} from "../controllers/user.controller";
import { checkAuth } from "../middlewares/auth";

const userRoute = express.Router();
userRoute.get("/project", checkAuth, getProjectIn);
userRoute.get("/getAll", getAllUsers);
userRoute.patch("/:id/project", addProjectIn);
userRoute.get("/", get);
userRoute.post("/", create);
userRoute.patch("/", update);
userRoute.delete("/:id", remove);
userRoute.patch("/:id/assign/:taskId", assignTask);

export default userRoute;
