import { Router } from "express";
import posts from "./posts";
import User from "../../models/user";

const app = Router();

app.use("/posts", posts);

app.get("/auth", async (req,res) => {                           //해당주소로 get 요청 보낼 시, 데이터가 하나라도 있으면 전체를 다 보여준다. 
    const userDatas = await User.findAll({});
    if(userDatas.length===0){                                   //데이터가 하나도 없으면 userDatas의 길이는 0, []
        return res.json({
            data : []
        });
    }
    res.json({
        data : userDatas,
    });
});

//회원가입
app.post("/auth/register", async (req,res) =>{                  //해당주소로 post 요청 보낼 시, 유저 생성하기.
    const email = req.body.email;
    const password = req.body.password;

    const userDatas = await User.findAll({                      //해당 이메일 존재여부를 확인하기 위해 우선적으로 요청 email과 동일한 것을 읽어온다. 
        where : {
            email: email  
        }
    }); 
    if(userDatas.some(user => user.email === email)){           //이미 존재하는 이메일일 경우 작성 불가.
        return res.json({
            error : "User already exist"
        });
    }
    const userCreate = await User.create({                      //기존회원이 아닐 경우, 요청 email과 pw을 지닌 row insert
        email : email,
        password : password,
    });
    
    return res.json({                                      
        data : {
            user : {
                id : userCreate["id"]        
            } 
        }
    });
});

//로그인
app.post("/auth/login", async(req,res)=> {                      //해당주소로 post 요청 보낼 시 email과 pw 확인 후, 등록된 회원일 경우 해당 id 반환하기
    const email = req.body.email;
    const password = req.body.password;
    
    const userDatas = await User.findAll({                      //요청한 것과 동일한 email과 pw를 지닌 행을 읽어온다. 
        where : {
            email : email,
            password : password
        }
    });

    if(userDatas.length === 0){                                 //해당 유저가 없다면 usersData의 길이가 0임.
        return res.json({
            error : "User not exist"
        });
    }
    res.json({
        data : {
            user : {
                id : userDatas[0]["id"]
            }
        }
    });
});

export default app;
