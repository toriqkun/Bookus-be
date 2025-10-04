"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookSchema = exports.serviceSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.serviceSchema = joi_1.default.object({
    providerId: joi_1.default.string().uuid().required(),
    title: joi_1.default.string().min(3).max(100).required(),
    author: joi_1.default.string().allow(null, ""),
    isbn: joi_1.default.string().allow(null, ""),
    description: joi_1.default.string().allow(null, ""),
    coverUrl: joi_1.default.string().uri().allow(null, ""),
    durationDays: joi_1.default.number().integer().min(1).allow(null),
    price: joi_1.default.number().min(0).allow(null),
    copies: joi_1.default.number().integer().min(1).default(1),
    isActive: joi_1.default.boolean().default(true),
});
exports.createBookSchema = joi_1.default.object({
    providerId: joi_1.default.string().uuid().required(),
    title: joi_1.default.string().min(3).max(100).required(),
    author: joi_1.default.string().allow(null, ""),
    isbn: joi_1.default.string().allow(null, ""),
    description: joi_1.default.string().allow(null, ""),
    coverUrl: joi_1.default.string().uri().allow(null, ""),
    durationDays: joi_1.default.number().integer().min(1).allow(null),
    price: joi_1.default.number().min(0).allow(null),
    copies: joi_1.default.number().integer().min(1).default(1),
    isActive: joi_1.default.boolean().default(true),
});
