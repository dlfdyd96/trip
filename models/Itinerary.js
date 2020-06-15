import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const itinerarySchema = new mongoose.Schema({
    creator : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "Creator is required"
    },
    img : {
        type : String,
        default : `${process.env.DOMAIN_URL}/static/image.png` // 아이유 이미지
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
    },
    areaCodes : [{
        type : mongoose.Schema.Types.Mixed,
        required : "areaCodes Required"
    }]
})

const model = mongoose.model('Itinerary', itinerarySchema);

export default model;
