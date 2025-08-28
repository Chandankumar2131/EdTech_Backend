const Tags = require('../models/tags');

// create tag ka handller function

exports.createTag = async(req,res)=>{
    try {
        const{name,description}=req.body;

        // valdation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        // create entry in Db

        const tagDetails= await Tags.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);
        return res.status(200).json({
            success:true,
            message:"Tag creted successfully"
        })
        

         } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
};

// get all Tags

exports.showAllTags = async(req,res)=>{
    try {
        
const allTags = await Tags.find({},{name:true,description:true});
return res.status(200).json({
    success:true,
    message:"All tags returned successfully"
})
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}