import { type Router } from "express";

import { createPoll } from "../controllers/polls";

export default (router: Router) => {
  router.post("/polls", createPoll);
};
