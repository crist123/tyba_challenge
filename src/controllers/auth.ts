import { Request, Response } from "express";
import crypto from "crypto";
import { validationResult } from "express-validator";
import { Sequelize, Transaction, Op } from "sequelize";
import { Connection } from "../db/connection";
import { Common } from "../helper/common";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import Roles_userModel from "../models/roles_user";
import RolesModel from "../models/roles";
import UsersModel from "../models/users";

export class AuthController {

  // Login
  public login = async (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    try {

      // Obtiene datos del usuario
      let _user = await UsersModel().findOne({
        where: {
          email: req.body.email
        }
      });

      const user = _user?.toJSON();

      // Si no existe el usuario
      if (!user) {
        throw { message: '¡Credenciales inválidas!', error: 'Invalid credentials', code: 20 };
      }

      // Si el usuario esta desactivado
      if (!user.status) {
        throw { message: 'No se pudo procesar tu inicio de sesión, comunicate con soporte', error: 'User disabled', code: 25 };
      }

      let compare = bcrypt.compareSync(req.body.pass, user.password!);

      // Si no existe el usuario
      if (!compare) {
        throw { message: '¡Credenciales inválidas!', error: 'Invalid credentials', code: 20 };
      }

      // Obtiene informacion del rol
      let role: any = await Roles_userModel(['roles']).findOne({
        where: {
          userId: user.id
        },
        include: [RolesModel()]
      });

      // Crea la llave para mantener la sesión
      const hash = crypto.createHash("sha256").update(Date.now() + user.id!).digest("hex");
      // No es necesario esperar respuesta para continuar con el flujo
      _user?.update({ accessKey: hash }, {
        where: {
          id: user.id
        }
      }).catch(e => null)

      // Generar token de login
      let token = await this.generateToken(user, hash, role.role.name);

      // Se regresa la respuesta
      res.header({ 'Authorization': token }).json({
        status: 'OK',
        user: {
          email: user.email,
          name: user.name
        }
      });
    } catch (error: any) {
      new Common().showLogMessage('Error controlado', error, 'error');

      // Si hay error
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
          error, code: 10
        });
    }
  }

  // Register
  public register = async (req: Request, res: Response, next: any) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    var transaction: Transaction;

    try {

      // Obtiene datos del usuario
      let user: any = await UsersModel().findOne({
        where: { email: req.body.email }
      });

      // Si no existe el usuario
      if (user && user.id) {
        throw { message: 'Ya existe un usuario registrado con la información suministrada, intenta iniciar sesión', error: true, code: 30 };
      }

      let adminRole: any = await RolesModel().findOne({
        where: {
          name: 'user'
        }
      });

      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      let pass = bcrypt.hashSync(req.body.pass || '', 10);

      // Crea la llave para mantener la sesión
      const hash = crypto.createHash("sha256").update(Date.now() + req.body.email!).digest("hex");

      // Crea el usuario
      let _user: any = await UsersModel().create({
        ...body,
        accessKey: hash,
        password: pass,
        status: true
      }, { transaction });

      // Agrega el rol
      await Roles_userModel().create({
        userId: _user.id,
        roleId: adminRole.id
      }, { transaction });

      // Generar token de login
      let token = await this.generateToken(_user, hash, 'user');

      // Commit a los cambios
      await transaction.commit();

      // Se regresa la respuesta
      res.header({ 'Authorization': token }).json({
        status: 'OK',
        user: {
          id: _user.id,
          email: _user.email,
          name: _user.name
        }
      });
    } catch (error: any) {

      // Rollback a los cambios
      if (transaction!) await transaction!.rollback().catch(e => null);

      new Common().showLogMessage('Error controlado', error, 'error');

      // Si hay error
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
          error, code: 10
        });
    }
  }

  async logout(req: Request, res: Response, next: any) {

    var transaction: Transaction;

    try {

      const reg = await UsersModel().findByPk((req as any).user.ius);
      if (!reg) {
        return res.status(404).json({
          message: `No se encuentra el recurso solicitado con el id ${(req as any).user.ius}`,
          error: 'Not found',
          code: 40
        });
      }

      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      await reg.update({ accessKey: "" }, {
        where: {
          id: (req as any).user.ius
        },
        transaction
      });

      // Commit a los cambios
      await transaction.commit();

      res.json("Sesión finalizada, Fecha: " + Date.now());

    } catch (error) {
      // Rollback a los cambios
      if (transaction!) await transaction!.rollback().catch(e => null);
      new Common().showLogMessage('Error controlado', error, 'error');
      next({
        message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
        error,
        code: 10
      });
    }
  }

  /**
  * Generar token para usuario app
  */
  public generateToken(user: any, hash: string, role?: any, expireMinutes?: number) {
    return new Promise((resolve, reject) => {
      try {
        const privateKey: any = hash;
        let token = jwt.sign({
          "ius": user.id,
          "rs": role
        },
          privateKey, {
          algorithm: "HS256",
          expiresIn: !expireMinutes ? '30d' : expireMinutes * 60
        });
        resolve(token);
      } catch (error) {
        reject('Error generando el  token ' + error);
      }
    })
  }
}