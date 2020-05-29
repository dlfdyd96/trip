import passport from 'passport'
import routes from '../router.js'
import User from '../models/User.js'
import Itinerary from '../models/Itinerary.js'
import jwt from 'jsonwebtoken'

// 회원가입
export const postJoin = async (req, res, next) => {
    const { 
        body : {
            password,
            verifyPassword,
            email,
            name
        }
    } = req;
    if (password !== verifyPassword) {
        res.status(401).send('Not match passwords!');
    }
    // User 이미 존재하면 미리다 체크해줌.
    const user = new User({email, name});
    try {
        await User.register(user, password);
        // res.status(200).send('join success');
        next(); // login 바로 연결
    }catch(err) {
        console.log(`Join Error : ${err}`);
        res.status(401).send('User is Already Exist!');
    }
}

// JWT
// 토큰
export const postLogin = (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
            // console.log(user);
            if (err || !user) {
                return res.status(400).json({
                    message: 'Check the account',
                    user   : user
                });
            }
            
            req.login(user, {session: false}, (err) => {
                if (err) {
                    res.send(err);
                }
                // generate a signed son web token with the contents of user object and return it in the response
                // console.log(`jwt 전`)
                const token = jwt.sign(user.email, 'thisIsMySecret');
                return res.json({
                    user : {
                        _id : user._id,
                        email : user.email,
                        name : user.name,
                        _selection : user.selections,
                    }, token});
            });
        }
    )(req, res);
}
// 확인
export const verifyUser = async (jwt_payload, done) => {
    console.log(`jwtPayload : ${jwt_payload}`);
    return await User.findOne({email:jwt_payload})
        .then(user => {
            return done(null, user);
        })
        .catch(err => {
            console.log(err);
            return done(err);
        })
}

// 성향 파악 질문
export const postTendency = async (req, res, next) => {
    const { body : { selection }  } = req;
    try {
        await User.findOneAndUpdate( { _id: req.user._id },
            { selection }
        )
        res.status(200).json({
            message: 'Success Update Tedency',
            selection   : selection
        })
    } catch(err) {
        console.log(`Error with Post Tedency : ${err}`)
        res.status(400).json({
            message: 'Fail to update Tedency',
            selection   : selection
        })
    }
}


// User Detail
export const getUserDetail = async (req, res, next) => {
    const {
        params : { id }
    } = req;
    try {
        const user = await User.findOne({_id : id});
        const itinerary = await Itinerary.find({creator : id})
        res.status(200).json({
            message : "Success get User Detail",
            user,
            itinerary
        })
    } catch(err) {
        console.log(`Get User Detail Error \n ${err}`);
        res.status(400).json({
            message : "Failed to get user Detail",
            error : err
        })
    }
}


// Change Password
export const postUpdatePassword = async (req, res, next) => {
    const { 
        body : { oldPassword, newPassword, newPassword2 },
        user    // JWT MiddleWare 추가
    } = req;
    try {
        if(newPassword === newPassword2) {
            await user.changePassword(oldPassword, newPassword);
            res.status(200).json({
                message : 'Success to Update password'
            });
        } else {
            res.status(400).json({
                message : 'Not Match New Password1 and New Password2'
            });
        }
    } catch(err) {
        console.log(err);
        res.status(400).json({
            error : err,
            message : "Can't Update Password T^T"
        });
    }
}

// Edit Profile
export const postEditProfile = async (req, res) => {
    const { body, user } = req;
    console.log(body);
    try {
        
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { ...body }
      );
      res.status(200).json({
          message: 'Sucess to Update Profile'
      });
    } catch (error) {
        res.status(400).json({
            error
        });
    }
  };