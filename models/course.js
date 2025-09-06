const mongoose = require('mongoose');

const courseSchema =new mongoose.Schema({
courseName:{
    type:String,
},
courseDescription:{
    type:String,
},
instructor:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
},
whatYouWillLearn:{
    type:String,
},
courseContent:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section",
    }
],
ratingAndReview:[
{
    type:mongoose.Schema.Types.ObjectId,
    ref:"RatingAndReview",
}
],
price:{
    type:Number,  
    required: true, 
},
thumbnail:{
    type:String,
    required: true,
},
tag:{
    type:[String],
    required:true,
},
category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category"
},
studentsEnrolled:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    
}],
instructions:{
    type:[String]
},
status:{
    type:String,
    enum:["Draft","published"],
},
});

module.exports=mongoose.model("Course",courseSchema);

