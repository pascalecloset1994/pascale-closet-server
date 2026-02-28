import multer from "multer";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads", "blogs");
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback)  => {
        const ext = path.extname(file.originalname).toLowerCase();
        callback(null, `blog_${Date.now()}${ext}`);
    }
})
export const upload = multer({ storage });