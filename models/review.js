const mongoose = require("mongoose")
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    body: String,
    rating: {
        type: Number,
        min: [0, "mininum rating should be given is 0"],
        max: [5, "rating cannot be more than 5"]
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

const Review = mongoose.model("Review", reviewSchema)
module.exports = Review