const basejoi = require("joi")
const sanitizeHtml = require("sanitize-html")

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                })
                if (clean)
                    return clean;
                else
                    return helpers.error("string.escapeHTML", { value });
            }
        }
    }
})

const joi = basejoi.extend(extension)



module.exports.campgroundSchema = joi.object({
    campground: joi.object({
        title: joi.string().required().escapeHTML(),
        price: joi.alternatives(
            joi.number().min(1).max(99999).required(),
            joi.string().pattern(new RegExp("(f|F)ree")).required().escapeHTML()
        ).required(),
        location: joi.string().required().escapeHTML(),
        // imageUrl: joi.string().required(),
        description: joi.string().required().escapeHTML()

    }).required(),
    deleteImages: joi.array()
})

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().min(0).max(5).required(),
        body: joi.string().required().escapeHTML()
    }).required()
})


