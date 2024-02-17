const Campground = require("../models/campground")
const Review = require("../models/review")

module.exports.createReview = async (req, res) => {
    const currCampground = await Campground.findById(req.params.camp_id)
    const newReview = new Review(req.body.review)
    newReview.author = req.user._id

    currCampground.reviews.push(newReview)
    await newReview.save()
    await currCampground.save()

    req.flash("success", "Created a new review")
    res.redirect(`/campgrounds/${currCampground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const {camp_id, review_id} = req.params

    await Campground.findByIdAndUpdate(camp_id, {$pull: {reviews: review_id}})
    await Review.findByIdAndDelete(req.params.review_id)

    req.flash("success", "Deleted a review.")
    res.redirect(`/campgrounds/${camp_id}`)
}


