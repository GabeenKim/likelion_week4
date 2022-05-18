import { Router } from "express";
import posts from "./posts";
import { User} from "./data";

const router = Router();
let nextUser = 2;

router.use("/posts", posts);

router.get("/auth", (req,res) => {                                  //해당주소로 get 요청 보낼 시, 데이터가 하나라도 있으면 전체를 다 보여준다. 
    return res.json({
            data : User,
    });
});

router.post("/auth/register", (req,res) =>{                                  //해당주소로 post 요청 보낼 시, 글 생성-> 생성된 글의 ID만 나타내기
    const email = req.body.email;
    const password = req.body.password;
    
    if(User.some(user => user.email === email)){             //이미 존재하는 ID일 경우 작성 불가.
        return res.json({
            error : "User already exist"
        });
    }
    User.push({                                                 //해당 데이터 생성
        email : email,
        password : password,
        id : nextUser++
    });
    return res.json({                                      
        data : {
            user : {
                id : User[User.length-1]["id"],               //data 가장 끝 객체의 id키 값을 불러온다
            }
        }
    });
});

router.post("/auth/login", (req,res)=> {
    const email = req.body.email;
    const password = req.body.password;
    const index = User.findIndex((user) => user.email === email && user.password === password);

    if(index === -1){
        return res.json({
            error : "User not exist"
        });
    }
    return res.json({
        data : {
            user :{
                id : User[index]["id"],
            }
        }
    });
});

export default router;
