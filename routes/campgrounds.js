const express = require("express")
const router = express.Router()

const { storage } = require("../cloudinary")

const multer = require("multer")
const upload = multer({storage})

const catchAsyncErr = require("../utils/catchAsyncErr")

const {midAddDollarToPrice, campgroundValidation, 
    isLoggedIn, isAuthor} = require("../utils/middlewares")
const campgroundController = require("../controllers/campgrounds")

// pattern - <req type> <path> <any(middlewares)> <controllers>

router.get("/", catchAsyncErr(campgroundController.index))
router.get("/new", isLoggedIn, campgroundController.newCampgroundForm)  // no async
router.get("/:id", catchAsyncErr(campgroundController.showCampground))
router.get("/:id/edit", [isLoggedIn, isAuthor], catchAsyncErr(campgroundController.editCampgroundForm))

router.post("/", [isLoggedIn, upload.array("image"), campgroundValidation, midAddDollarToPrice], catchAsyncErr(campgroundController.createCampground))
router.put("/:id", [isLoggedIn, isAuthor, upload.array("image"), campgroundValidation, midAddDollarToPrice], catchAsyncErr(campgroundController.editCampground))
router.delete("/:id", [isLoggedIn, isAuthor], catchAsyncErr(campgroundController.deleteCampground))


module.exports = router 