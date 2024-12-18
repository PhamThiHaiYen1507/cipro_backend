import express, { Response } from "express";
import passport from "passport";
import { logout, redirectToHomePage } from "../controllers/auth.controller";

const authRoute = express.Router();
authRoute.post("/login", passport.authenticate("local"), (req, res: Response) =>
  res.sendStatus(201)
);
authRoute.get("/logout", logout);
authRoute.get(
  "/github",
  passport.authenticate("github", { scope: ["repo", "workflow"] })
);
authRoute.get(
  "/github/callback",
  passport.authenticate("github"),
  redirectToHomePage
);
authRoute.get("/gitlab", passport.authenticate("gitlab"));
authRoute.get(
  "/gitlab/callback",
  passport.authenticate("gitlab"),
  redirectToHomePage
);

authRoute.post('/mobile/github', passport.authenticate("github-mobile"), (req, res: Response) =>
  res.sendStatus(201)
);

export default authRoute;
