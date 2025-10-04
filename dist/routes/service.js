"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const service_1 = require("../controllers/service/service");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.post("/services", authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"), service_1.createBook);
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const books = yield prisma.service.findMany({
        include: { provider: true, slots: true },
    });
    res.json(books);
}));
exports.default = router;
