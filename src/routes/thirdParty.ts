import express from "express";
import {
  changeStatusAction,
  create,
  get,
  getAll,
  getGithubWorkflowsInfo,
  getReposFromGithub,
  getReposFromGitlab,
  remove,
  update,
} from "../controllers/thirdParty.controller";

const thirdPartyRoute = express.Router();

thirdPartyRoute.get("/", getAll);
thirdPartyRoute.get("/:id", get);
thirdPartyRoute.post("/", create);
thirdPartyRoute.put("/:id", update);
thirdPartyRoute.delete("/:id", remove);
thirdPartyRoute.get("/github/repo", getReposFromGithub);
thirdPartyRoute.get("/gitlab/repo", getReposFromGitlab);
thirdPartyRoute.get("/github/workflows", getGithubWorkflowsInfo);
thirdPartyRoute.put("/github/workflows/status", changeStatusAction);
export default thirdPartyRoute;
