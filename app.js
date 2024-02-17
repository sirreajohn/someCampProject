if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const localStrategy = require("passport-local")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const MongoStore = require("connect-mongo")

const ExpressError = require("./utils/ExpressError")
const campgroundRouter = require("./routes/campgrounds")
const reviewRouter = require("./routes/reviews")
const userRouter = require("./routes/users")
const User = require("./models/user")
const rules = require("./utils/contentPolicyRules")

const {getFlashMessages} = require("./utils/middlewares")
const user = require("./models/user")


const DBUrl = process.env.DB_URL
// const DBUrl = "mongodb://localhost:27017/yelp-camp"

mongoose.connect(DBUrl)
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error: "))
db.once("open", () => {
    console.log("DataBase Connection Established!")
})

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

const sessionStore = MongoStore.create({
    mongoUrl: DBUrl,
    touchAfter:24*60*60,
    crypto: {
        secret: process.env.SECRET
    }
})

sessionStore.on("error", function(err) {
    console.log(`session store error -- ${err}`)
})

const sessionConfig = {
    store: sessionStore,
    name: "sid",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // seconds * minutes * hours * day * week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// middlewares have "use" verb
app.use(express.urlencoded({extended:true}))
app.use(mongoSanitize())

app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...rules.connectSrcUrls],
            "script-src": ["'self'", "'unsafe-inline'", "unsafe-hashes", ...rules.scriptSrcUrls],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", ...rules.styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...rules.fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())

app.use(getFlashMessages)

// Routes
app.use("/campgrounds", campgroundRouter)
app.use("/campgrounds/:camp_id/reviews", reviewRouter)
app.use("/", userRouter)


// GET reqs
app.get("/", (req, res) => {
    res.render("home")
})

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"))
})

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err
    if(!err.message) err.message = "unknown error encountered."
    res.status(statusCode).render("error", { err })
})

const server = app.listen(3000, ()=>{
    console.log(`listening`)
}) 

// server.timeout = 5*60*1000 // 5 min