import { Router } from "express";
import { Controller } from "../controllers/transactions";
import { AuthMiddleware } from '../middleware/auth';
import { AuthorizationMiddleware } from '../middleware/authorization';
import { Roles } from '../helper/roles';

const router = Router();
const controller = new Controller();
const authM = new AuthMiddleware();
const authorizationM = new AuthorizationMiddleware();

router.get('/', [
  authM.auth,
  authorizationM.authorize([Roles.ADMIN, Roles.USER])
], controller.getAll)
router.get('/:id', [
  authM.auth,
  authorizationM.authorize([Roles.ADMIN])
], controller.get)
router.post('/', [
  authM.auth,
  authorizationM.authorize([Roles.ADMIN, Roles.USER])
], controller.add)
router.put('/:id', [
  authM.auth,
  authorizationM.authorize([Roles.ADMIN])
], controller.update)
router.delete('/user/:id', [
  authM.auth,
  authorizationM.authorize([Roles.ADMIN, Roles.USER])
], controller.deleteAllUser)
router.delete('/:id', [
  authM.auth,
  authorizationM.authorize([Roles.ADMIN])
], controller.delete)

export default router;