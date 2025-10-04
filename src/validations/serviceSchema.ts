import Joi from "joi";

export const serviceSchema = Joi.object({
  providerId: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(100).required(),
  author: Joi.string().allow(null, ""),
  isbn: Joi.string().allow(null, ""),
  description: Joi.string().allow(null, ""),
  coverUrl: Joi.string().uri().allow(null, ""),
  durationDays: Joi.number().integer().min(1).allow(null),
  price: Joi.number().min(0).allow(null),
  copies: Joi.number().integer().min(1).default(1),
  isActive: Joi.boolean().default(true),
});

export const createBookSchema = Joi.object({
  providerId: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(100).required(),
  author: Joi.string().allow(null, ""),
  isbn: Joi.string().allow(null, ""),
  description: Joi.string().allow(null, ""),
  coverUrl: Joi.string().uri().allow(null, ""),
  durationDays: Joi.number().integer().min(1).allow(null),
  price: Joi.number().min(0).allow(null),
  copies: Joi.number().integer().min(1).default(1),
  isActive: Joi.boolean().default(true),
});
