const joi = require("joi");
const { BadRequest } = require("../errors");

const userValidationSchema = joi.object({
  firstName: joi.string().trim().required().messages({
    "any.required": "Please provide a first name",
  }),
  lastName: joi.string().trim().required().messages({
    "any.required": "Please provide a last name",
  }),
  email: joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),
  password: joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Please provide a password",
  }),
  confirmPassword: joi
    .string()
    .min(8)
    .required()
    .valid(joi.ref("password"))
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Please confirm your password",
      "any.only": "Passwords do not match",
    }),
});

const validateUser = (req, res, next) => {
  const { error } = userValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorDetails = error.details.map((err) => err.message);
    throw new BadRequest("Validation Error", errorDetails);
  }

  next();
};

const postValidationSchema = joi.object({
  user: joi.string().hex().required().messages({
    "any.required": "User ID is required for the post.",
    "string.empty": "User ID is required for the post.",
    "string.hex": "User ID should be a valid hexadecimal string.",
  }),
  content: joi.string().required().messages({
    "any.required": "Please provide content for your post.",
    "string.empty": "Please provide content for your post.",
  }),
  media: joi
    .array()
    .items(
      joi.object({
        type: joi.string().required().valid("image", "video").messages({
          "any.required": "Please enter a correct media type.",
          "string.empty": "Please enter a correct media type.",
          "any.only": "{VALUE} is not supported as a media type.",
        }),
        filePath: joi.string().required().messages({
          "any.required": "Please provide a media file.",
          "string.empty": "Please provide a media file.",
        }),
      })
    )
    .required()
    .messages({
      "array.required": "Please provide media information.",
    }),
  scheduledDate: joi.date().required().messages({
    "any.required": "Please enter a date for the post to be scheduled.",
  }),
  scheduledTime: joi.string().required().messages({
    "any.required": "Please enter a time for the post to be scheduled.",
    "string.empty": "Please enter a time for the post to be scheduled.",
  }),
  isPosted: joi.boolean(),
  numOfPosts: joi.number().default(0),
});

const validatePost = (req, res, next) => {
  const { error } = postValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorDetails = error.details.map((err) => err.message);
    throw new BadRequest("Validation Error", errorDetails);
  }

  next();
};

module.exports = { validateUser, validatePost };
