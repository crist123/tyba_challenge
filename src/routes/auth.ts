import { Router } from "express";
import { check } from "express-validator";
import { AuthController } from "../controllers/auth";
import { AuthMiddleware } from '../middleware/auth';
import { AuthorizationMiddleware } from '../middleware/authorization';
import { Roles } from '../helper/roles';

const router = Router();
const authController = new AuthController();
const authM = new AuthMiddleware();
const authorizationM = new AuthorizationMiddleware();

router.post('/login', [
  check('email').not().isEmpty().exists().withMessage("El email es requerido"),
  check('pass').not().isEmpty().exists().withMessage("La contraseña es requerida"),
], authController.login)
router.post('/register', [
  check('name').not().isEmpty().exists().withMessage("El nombre es requerido"),
  check('email').not().isEmpty().exists().withMessage("El email es requerido"),
  check('pass').not().isEmpty().exists().withMessage("La contraseña es requerida"),
], authController.register)
router.post('/logout', [
  authM.auth
], authController.logout)

export default router;