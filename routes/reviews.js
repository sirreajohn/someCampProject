const express = require("express")
const router = express.Router({mergeParams: true})

const Campground = require("../models/campground")
const Review = require("../models/review")

const catchAsyncErr = require("../utils/catchAsyncErr")
const {reviewValidation, isLoggedIn, isReviewAuthor, convertRatingToInt} = require("../utils/middlewares")

const reviewController = require("../controllers/reviews")


// non - get req
router.post("/", [isLoggedIn, convertRatingToInt, reviewValidation], catchAsyncErr(reviewController.createReview))
router.delete("/:review_id", [isLoggedIn, isReviewAuthor], catchAsyncErr(reviewController.deleteReview))


module.exports = router
