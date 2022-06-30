import { Router } from "express";
import Post from "../../models/post";
import cors from "cors";                                      //여기에 불러와야 auth 라우터에 적용이 안 돼서,,?

const post = Router();
const {verifyToken} = require('./middlewares');

const corsOptions = {
    origin : "http://localhost:3000",                         //허락하고자 하는 요청주소여야 함!
    credentials: true,
    methods : '*',                                            //GET,HEAD,POST만 기본 메소드. 나머지는 설정해줘야함. 
    allowedHeaders : 'authorization',
    exposedHeaders : 'authorization'
}  
post.options("*",cors(corsOptions));                           //PUT, DELETE 등 + 사용자 정의 헤더를 위해 pre-flight 요청해줘야함.

//조회 - 헤더에 Access-Control-Allow-Origin 토큰 이용하기 
post.get("/", async (req,res) => {               
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials",  true);    

    const postDatas = await Post.findAll({});
    if(postDatas.length===0){                                        //데이터가 하나도 없을 시, []
        return res.json({
            data : []
        }); 
    }
    res.json({
        data : postDatas,
    });
});

post.get("/:postId" , async (req,res) => {    
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials",  true);
    
    const {postId} = req.params;
    const postDatas = await Post.findOne({                         //id가 postId와 동일한 것 중 한 개만 읽어온다. 
        where : {
            id : postId
        }
    });
    if(!postDatas) {                                               //postDatas가 false이면 존재하지 않는 것이다. 
        return res.json({
            error : "Post not exist",
        }); 
    }
    return res.json({
        data : postDatas
    });
});

//생성 - 모듈 이용
post.post("/",cors(corsOptions), verifyToken, async(req,res) =>{                     //해당주소로 post 요청 보낼 시, 글 생성-> 생성된 글의 ID만 나타내기
    const jwtUserId = req.decoded.id;                              //jwt 검증된 id  
    const {content} = req.body;
   
    const postCreate = await Post.create({                         
        content : content,
        UserId : jwtUserId
    });
  
    return res.json({                                      
        data : {
            post : {
                id : postCreate["id"]        
            } 
        }
    });
});

//수정 -모듈 이용
post.put("/:postId",cors(corsOptions), verifyToken,async (req,res) => {    
    const jwtUserId = req.decoded.id;            
    const {content} = req.body;                                
    const {postId} = req.params;                                

    const postDatas = await Post.findOne({                          //id가 postId와 동일한 것 중 한 개만 읽어온다.(글의 존재여부, 작성자 식별을 위함))
        where : {
            id : postId
        }
    });

    if(!postDatas) {                                                //해당 글이 없을 시 
        return res.json({
            error : "That Post does not exist",
        }); 
     }
    if( postDatas.UserId !== jwtUserId){                               //jwt 검증된 id와 작성자가 다를 시 수정 금지. 
        return res.json({
            error : "Cannot modify post",
        })
    }

    await Post.update({                                             //동일 작성자, 동일 글일 경우에만 내용을 수정한다. 
        content : content  
    },{
        where : {
            UserId : jwtUserId,
            id : postId
        }
    });

    return res.json({                                  
        data : {
            id : postDatas["id"],                                   
        }
    });
});

//삭제 -모듈 이용
post.delete("/:postId",cors(corsOptions), verifyToken, async (req,res) =>{                              
    const jwtUserId = req.decoded.id;                                
    const {postId} = req.params;
    
    const postDatas = await Post.findOne({                          //id가 postId와 동일한 것 중 한 개만 읽어온다.(글의 존재여부, 작성자 식별을 위함))
        where : {
            id : postId
        }
    });

    if(!postDatas) {                                                 //없는 글을 요청했을 시 
        return res.json({
            error : "That Post does not exist",
        }); 
    }
   
    if(postDatas.UserId !== jwtUserId){                                //jwt 검증된 id와 작성자가 다를 시 삭제 금지.
        return res.json({
            error : "Cannot delete post"
        });
    }

    postDatas.destroy({                                             //동일 작성자, 동일 글일 경우에만 내용을 삭제한다.
        where : {
            id : postId,
            UserId : jwtUserId
        }
    })                                               
    res.json({
        data : "Successfully deleted"
    });
    
});


export default post;