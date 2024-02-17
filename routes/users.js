const express = require("express")
const passport = require("passport")

const router = express.Router()

const catchAsyncErr = require("../utils/catchAsyncErr")
const { redirectUrl } = require("../utils/middlewares")

const userController = require("../controllers/users")


router.get("/register", userController.registerUserForm)
router.get("/login", userController.loginUserForm)
router.get("/logout", userController.logoutUser)

router.post("/register", catchAsyncErr(userController.registerUser))
router.post("/login", [
    redirectUrl, 
    passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"})
], userController.loginUser)


module.exports = router