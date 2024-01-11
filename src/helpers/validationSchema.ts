import Joi from "@hapi/joi";

const RegistrationSchema = Joi.object({
  username: Joi.string().min(6).required(),
  email: Joi.string().min(10).lowercase().required(),
  password: Joi.string().min(6).required(),
});

const LoginSchema = Joi.object({
  email: Joi.string().min(10).lowercase().required(),
  password: Joi.string().min(4).required(),
});

export { RegistrationSchema, LoginSchema };
