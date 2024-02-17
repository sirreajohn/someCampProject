const User = require("../models/user")

module.exports.registerUserForm = (req, res) => {
    res.render("users/register")
}

module.exports.loginUserForm =  (req, res) => {
    res.render("users/login")
}

module.exports.registerUser = async(req, res) => {
    try {
        const { email, username, password } = req.body
        const thisUser = new User({email, username})
        const registeredUser = await User.register(thisUser, password)

        req.login(registeredUser, err => {
            if(err) return next(err)

            req.flash("success", "Registered successfully, Welcome to Yelpcamp!")
            res.redirect("/campgrounds")
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect("/register")
    }
    
}

module.exports.loginUser = (req, res) => {
    const {username} = req.body
    req.flash("success", `Welcome ${username}`)
    redirect_path = res.locals.redirectUrl? res.locals.redirectUrl: "/campgrounds"
    res.redirect(redirect_path)
}

module.exports.logoutUser = (req, res) => {

    req.logout((err) => {
        if(err)
            return next(err)

        req.flash("success", "you have been logged out.")
        res.redirect("/campgrounds")
    })
}