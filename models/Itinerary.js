import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
    creator : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "Creator is required"
    },
    img : {
        type : String,
        default : `http://simg.donga.com/ugc/MLBPARK/Board/15/48/98/57/1548985783315.jpg` // 아이유 이미지
    },
    title : {
        type : String,
        reqruied: "Title is Required"
    },
    description : String,
    createdAt : {
        type: Date,
        default : Date.now
    },
    routes : [Number],
    publish: {
        type: Boolean,
        default: false
    },
    date : {
        type : String,
        required : "Date is Required"
    }
})

const model = mongoose.model('Itinerary', itinerarySchema);

export default model;
