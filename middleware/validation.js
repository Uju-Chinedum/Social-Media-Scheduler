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

module.exports = { validateUser };
