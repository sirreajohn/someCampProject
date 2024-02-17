
const { campgroundSchema, reviewSchema } = require("../schemas")
const Campground = require("../models/campground")
const Review = require("../models/review")

const ExpressError = require("../utils/ExpressError")

module.exports.midAddDollarToPrice = (req, res, next) => {
    bodyJson = req.body.campground
    if (bodyJson["price"] != undefined)
        bodyJson["price"] = `$${bodyJson.price}`
    req.body.campground = bodyJson
    next()
}


module.exports.campgroundValidation = (req, res, next) => {
    const result = campgroundSchema.validate(req.body)

    if (result.error) {
        const errorDetails = result.error.details.map(ele => ele.message).join(",")
        throw new ExpressError(400, errorDetails)
    }
    else
        next()
}


module.exports.reviewValidation = (req, res, next) => {
    const result = reviewSchema.validate(req.body)

    if (result.error) {
        const errorDetails = result.error.details.map(ele => ele.message).join(",")
        throw new ExpressError(400, errorDetails)
    }
    else
        next()
}

module.exports.getFlashMessages = (req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next()
}

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnUrl = req.originalUrl
        req.flash("error", "You must be logged in.")
        return res.redirect("/login")
    }
    next()
}

module.exports.redirectUrl = (req, res, next) => {
    if (req.session.returnUrl)
        res.locals.redirectUrl = req.session.returnUrl
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params
    const currCampground = await Campground.findById(id)
    if(!currCampground)
    {
        req.flash("Specified campground not found")
        res.redirect("/campgrounds")
    }
    if(!currCampground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that operation")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {camp_id, review_id} = req.params
    const thisReview = await Review.findById(review_id)   
    if (!thisReview.author.equals(req.user._id))
    {
        req.flash("error", "You do have permission to do that operation")
        return res.redirect(`/campgrounds/${camp_id}`)
    }
    next()

}

module.exports.convertRatingToInt = (req, res, next) => {
    try {
        const {review} = req.body
        review.rating = Number(review.rating[review.rating.length - 1])
        next()
    } catch(err)
    {
        next(err)
    }
}