import { Router } from "express";
import {data} from "./data.js";

const router = Router();

// get요청을 보낼시 body에 포함된 id가 있을 시 해당 결과를 보여준다. 
router.get("/", (req,res) => {
    const index = data.findIndex(data => data.id ===req.body.id);
    const result = data.filter(data => data.id ===req.body.id)[0];

    if(index === -1) {
        return res.json({
            error : "Post not exist",
        }); 
    }
    res.json({
        data : result
    });
});

export default router;