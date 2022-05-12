import { Router } from "express";
import posts from "./posts";
import post from "./post";

const router = Router();

router.use("/posts", posts);
router.use("/post", post);

export default router;
