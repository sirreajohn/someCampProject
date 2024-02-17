const Campground = require("../models/campground")
const { cloudinary } = require("../cloudinary")

const mapbox = require("@mapbox/mapbox-sdk/services/geocoding")
const geocoder = mapbox({accessToken: process.env.MAPBOX_TOKEN})

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({})
    res.render("campgrounds/index", { allCampgrounds })
}

module.exports.newCampgroundForm = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const thisCampground = await Campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author" // populating review's author info
        }
    }).populate("author") // populating this campground's author

    if(!thisCampground) {
        req.flash("error", "Cannot find that campground!")
        res.redirect("/campgrounds")
    }
    else
        res.render("campgrounds/show", { thisCampground })
}

module.exports.createCampground = async (req, res, next) => {

    const geoResponse = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const newCampground = new Campground(req.body.campground)

    newCampground.geometry = geoResponse.body.features[0].geometry
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = req.user._id  // added by passport in this session.

    await newCampground.save()

    req.flash("success", "Sucessfully made a new campground.")
    res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.editCampgroundForm = async (req, res) => {
    const currCampground = await Campground.findById(req.params.id)

    if(!currCampground) {
        req.flash("error", "Cannot find that campground!")
        res.redirect("/campgrounds")
    }
    else
        res.render("campgrounds/edit", { currCampground })
}

module.exports.editCampground = async (req, res) => {
    // three calls to update one element?? super inefficient
    const thisCampground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    if(!thisCampground) {
        req.flash("error", "Cannot find that campground!")
        res.redirect("/campgrounds")
    }
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    thisCampground.images.push(...images)
    await thisCampground.save()

    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await thisCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }

    req.flash("success", "Sucessfully Updated a campground.")
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.deleteCampground = async (req, res) => { 
    await Campground.findByIdAndDelete(req.params.id)

    req.flash("success", "Sucessfully deleted a campground.")
    res.redirect("/campgrounds")
}
