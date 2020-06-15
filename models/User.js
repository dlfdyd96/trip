import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    // 계정 관련
    name : String,
    email : {
        type : String,
        required: 'Email is required',
        validate: [validator.isEmail]
    },
    kakaoId : Number,
    createdAt : {
        type: Date,
        default : Date.now
    },
    // item 정보
    // selections : [String],
    selections : [ Number ],
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

const model = mongoose.model('User', userSchema);

export default model;
