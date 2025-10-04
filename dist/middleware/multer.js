"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = "others";
        if (file.fieldname === "cover")
            folder = "book";
        else if (file.fieldname === "profileImage")
            folder = "profile";
        const dest = path_1.default.resolve(__dirname, `../uploads/${folder}`);
        ensureDir(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            cb(new Error("Hanya file JPG/PNG yang diizinkan"));
        }
        else {
            cb(null, true);
        }
    },
});
