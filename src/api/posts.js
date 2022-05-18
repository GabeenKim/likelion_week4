import { Router } from "express";
import { data} from "./data";

const router = Router();
let nextId = 4;

router.get("/", (req,res) => {                                  //해당주소로 get 요청 보낼 시, 데이터가 하나라도 있으면 전체를 다 보여준다. 
    return res.json({
            data : data,
    });
});

router.get("/:postId", (req,res) => {
    const {postId} = req.params;

    if(!data[postId -1]) {
        return res.json({
            error : "Post not exist",
        }); 
    }
    return res.json({
        data : data[postId-1]
    });
});

router.post("/", (req,res) =>{                                  //해당주소로 post 요청 보낼 시, 글 생성-> 생성된 글의 ID만 나타내기
    const id = req.header("id");
    const {content} = req.body;
    data.push({                                                 //해당 데이터 생성
        id : nextId++,
        content : content,
        writer : id
    });
    return res.json({                                      
        data : {
            post : {
                id : data[data.length-1]["id"],               //data 가장 끝 객체의 id키 값을 불러온다
            }
        }
    });
});

router.put("/:postId", (req,res) => {                                          //해당주소로 put 요청 보낼 시, 글 수정. 단, 자기 글만 수정하기(id,작성자 모두 동일)    
    const userId = req.header("id");
    const {postId} = req.params;
    const {content} = req.body;
    const index = data.findIndex((post) => post.id === Number(postId));   //요청한 글의 ID와 동일한 ID의 index를 찾는다.
    console.log(postId);
    if(index == -1){                                                    //요청한 ID가 아예 없는 경우.
            return res.json({
                error : "That Post does not exist"
            });
        }

    if(!(data[index].writer === userId)){
        return res.json({
            error : "Cannot modify post",
        })
    }

    data[index].content = content;

    return res.json({                                  
        data : {
            id : data[index].id,                                      //자기 글일 경우, 요청한 것과 동일한 index의 객체에서 ID키의 값을 불러온다. 
        }
    });
});

router.delete("/:postId", (req,res) =>{                                        //해당주소로 delete 요청 보낼 시, 글 삭제. 단, 자기 글만 수정하기(id,작성자 모두 동일)    
    const {postId} = req.params;
    const userId = req.header("id");
    const index = data.findIndex((post) => post.id === Number(postId));   //지우고자 요청한 ID를 가진 글의 인덱스를 찾는다. 
    if(index == -1){                                                    //요청한 ID가 아예 없는 경우.
        return res.json({
            error : "That Post does not exist"
        });
    }
    console.log(userId);
    if(!(data[index].writer === userId)){                      //요청한 ID의 작성자가 자기가 아닐 경우. 
        return res.json({
            error : "Cannot delete post"
        });
    }

    data.splice(index,1);                                               //요청한 ID가 위치한 인덱스를 제거.(data=data.filter(data=>data.id !== req.body.postId 시, data is read only 오류가 자꾸 발생해서 일단 이렇게 작성했습니다..!ㅜㅜ)
    //data = data.filter((post)=> post.id !== Number(postId));
    --nextId;
    res.json({
        data : "Successfully deleted"
    });
    
});


export default router;