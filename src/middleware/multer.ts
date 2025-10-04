import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "others";

    if (file.fieldname === "cover") folder = "book";
    else if (file.fieldname === "profileImage") folder = "profile";

    const dest = path.resolve(__dirname, `../uploads/${folder}`);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Hanya file JPG/PNG yang diizinkan"));
    } else {
      cb(null, true);
    }
  },
});
