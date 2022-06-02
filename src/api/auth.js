import { Router } from "express";
import User from "../../models/user";
import bcrypt from "bcrypt";                    

const auth = Router();
const jwt = require('jsonwebtoken');
const {verifyToken} = require('./middlewares');

auth.get("/", async (req,res) => {                          
    const userDatas = await User.findAll({});
    if(!userDatas){                                             //데이터가 하나도 없으면 []
        return res.json({
            data : []
        });
    }
    res.json({
        data : userDatas,
    });
});

//회원가입
auth.post("/register", async (req,res) =>{                  
    const {email, password} =req.body ;
    const userDatas = await User.findAll({                      //해당 이메일 존재여부를 확인하기 위해 우선적으로 요청 email과 동일한 것을 읽어온다. 
        where : {
            email: email  
        }
    });
    if(!email && !password) {                                   //요청에 email, password 없는 경우
        return res.json("정상적인 요청이 아닙니다.")
    }
    if(userDatas.some(user => user.email === email)){           //이미 존재하는 이메일일 경우 작성 불가.
        return res.json({
            error : "User already exist"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);     //10 : salt/pw bcrypt 이용해 hash로 암호화.
    const userCreate = await User.create({                      //기존회원이 아닐 경우, 요청 email과 pw을 지닌 row insert
        email : email,
        password : hashedPassword,                              //암호화된 pw로 insert
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
auth.post("/login", async(req,res)=> {                      
    const {email, password} = req.body;

    const userDatas = await User.findAll({                      //요청한 것과 동일한 email과 pw를 지닌 행을 읽어온다. 
        where : {
            email : email
        }
    });
    //console.log(Boolean(userDatas))
    if(userDatas.length === 0){                                 //!userDatas를 사용해보려고 했으나, 해당 유저가 없을 때 즉, 빈 객체일 때도 자꾸 true로 인식되어 일단 리뷰 전 방식으로 택하였습니다 ㅜㅜ
        return res.json({
            error : "이메일또는 비밀번호가 일치하지 않습니다."
        });
    }
    const comparedPw = await bcrypt.compareSync(password,userDatas[0].password); //요청된 pw와 select해온 이메일의 pw 비교. boolean 값으로 반환받기 위해 compareSync 사용

    if(comparedPw){                                             //DB에 저장된 pw와 동일한 경우
        const token = jwt.sign({                                //jwt 생성
            id : userDatas[0].id,                               //추후 jwt 검증 시 유저 id를 사용하기 위해 작성해줌. 
            email: req.body.email,
            password: req.body.password,
        }, process.env.JWT_SECRET, {
            expiresIn: '5m', //1분
            issuer: 'nodebird',
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다',
            token,
        }); 
    }
    return res.json({
        message: '이메일또는 비밀번호가 일치하지 않습니다.',
    })
      
});
auth.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
  });
  

export default auth;