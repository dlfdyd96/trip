import Content from '../models/Content';
import Comment from '../models/Comment';

// get Detail
export const getContentDetail = async (req, res) => {
    const {
        params : { id }
    } = req;

    try {
        const content = await Content.findOne({content:id})

        if(content) { // 찾은경우
            try{
                const comments = await Comment.find({ content : content._id})
                                            .populate("author")
                                            .sort({createdAt : -1});
                res.status(200).json({
                    message: 'Success Get Content Detail',
                    content,
                    comments
                })
            } catch(err) {
                console.log(err);
                res.status(400).json({error: err});
            }
            
        } else {
            const newContent = await Content.create({
                content: id,
            })
            res.status(200).json({
                message: 'Success Create Content Detail',
                content : newContent,
                comments : [],
            })
            res.end();
        }
    } catch(err){
        console.log(err);
        res.status(400).json({error : err});
        res.end();
    }
}