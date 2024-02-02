import express from "express";

import { registerController, loginController, generatePdfController } from '../controllers/userControllers.js'

const router = express.Router()

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/generatePdf', generatePdfController)

export default router;