import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload route
router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: "File uploaded successfully",
    file: {
      name: req.file.originalname,
      filename: req.file.filename,
      url: fileUrl,
    },
  });
});

// List files route
router.get("/files", (req: Request, res: Response) => {
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    return res.json({ success: true, files: [] });
  }
  
  const files = fs.readdirSync(uploadDir).map(filename => ({
    filename,
    url: `/uploads/${filename}`,
  }));
  
  res.json({ success: true, files });
});

export default router;
