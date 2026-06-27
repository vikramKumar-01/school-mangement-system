import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadStudyMaterial, getStudyMaterials } from "../controllers/studymaterial.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
  .post(uploadStudyMaterial)
  .get(getStudyMaterials);

export default router;
