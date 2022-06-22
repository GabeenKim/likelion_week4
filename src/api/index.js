import { Router } from "express";
import posts from "./posts";
import auth from "./auth";


const api = Router();

api.use("/auth", auth);
api.use("/posts", posts);


export default api;
