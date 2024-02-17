const mongoose = require("mongoose")
const Review = require("./review")
const Schema = mongoose.Schema

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
}, { toJSON: { virtuals: true }})

CampgroundSchema.virtual("properties.popUpMarkup").get(function() {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
    `
})

CampgroundSchema.post("findOneAndDelete", async function (data) {
    if (data) {
        await Review.deleteMany({ _id: { $in: data.reviews } })
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema)