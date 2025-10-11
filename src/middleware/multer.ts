import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log(
      "📂 File diterima di multer:",
      file?.originalname,
      file?.mimetype
    );
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Hanya file JPG/PNG yang diizinkan"));
    } else {
      cb(null, true);
    }
  },
});
