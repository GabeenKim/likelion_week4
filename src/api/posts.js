import { Router } from "express";
import Post from "../../models/post";

const app = Router();

//조회
app.get("/", async (req,res) => {                                  //해당주소로 get 요청 보낼 시, 데이터가 하나라도 있으면 전체를 다 보여준다. 
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

app.get("/:postId", async (req,res) => {                           //특정 주소로 get요청 시, 해당 id의 글만 보여준다.  
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

//생성
app.post("/", async(req,res) =>{                                  //해당주소로 post 요청 보낼 시, 글 생성-> 생성된 글의 ID만 나타내기
    const userId = parseInt(req.header("X_User_Id"));
    const {content} = req.body;
    
    const postCreate = await Post.create({                        //요청 내용과 헤더 아이디와 같은 row를 insert한다. 
        content : content,
        UserId : userId
    });
    
    return res.json({                                      
        data : {
            post : {
                id : postCreate["id"]        
            } 
        }
    });
});

//수정
app.put("/:postId", async (req,res) => {                            //해당주소로 put 요청 보낼 시, 글 수정. 단, 자기 글만 수정하기(id,작성자 모두 동일)    
    const userId = parseInt(req.header("X_User_Id"));            
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
    if( postDatas.UserId !== userId){                               //해당 글은 있으나 작성자가 다른 이일 경우
        return res.json({
            error : "Cannot modify post",
        })
    }

    await Post.update({                                             //동일 작성자, 동일 글일 경우에만 내용을 수정한다. 
        content : content  
    },{
        where : {
            UserId : userId,
            id : postId
        }
    });

    return res.json({                                  
        data : {
            id : postDatas["id"],                                   
        }
    });
});

//삭제
app.delete("/:postId", async (req,res) =>{                          //해당주소로 delete 요청 보낼 시, 글 삭제. 단, 자기 글만 수정하기(id,작성자 모두 동일)    
    const userId = parseInt(req.header("X_User_Id"));                                
    const {postId} = req.params;
    
    const postDatas = await Post.findOne({                          //id가 postId와 동일한 것 중 한 개만 읽어온다.(글의 존재여부, 작성자 식별을 위함))
        where : {
            id : postId
        }
    });

    if(!postDatas) {                                                //없는 글을 요청했을 시 
        return res.json({
            error : "That Post does not exist",
        }); 
    }
   
    if(postDatas.UserId !== userId){                                //요청한 글의 작성자가 자기가 아닐 경우. 
        return res.json({
            error : "Cannot delete post"
        });
    }

    postDatas.destroy({                                             //동일 작성자, 동일 글일 경우에만 내용을 수정한다.
        where : {
            id : postId,
            UserId : userId
        }
    })                                               
    res.json({
        data : "Successfully deleted"
    });
    
});


export default app;