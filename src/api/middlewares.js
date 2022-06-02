const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);   //첫번째 인수 토큰, 두번째 인수는 토큰 비밀키
    return next();
  } catch (error) {
    if (!req.headers.authorization){        // 로그인 하지 않았을 때. 즉, 헤더가 아예 비어있을 때
        return res.json({
            error : {
                message: "로그인을 먼저 해주세요.",
            }
        });
    }
    if (error.name === 'TokenExpiredError') { // 토큰 유효기간 초과
        return res.status(419).json({
        error : {
            message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        }
      });
    }
    return res.status(401).json({             // 잘못된 토큰일 경우.
        error : {
            message: "토큰 정보가 잘못되었습니다. 다시 시도해주세요.",
        }
    });
  }
};
