import { Request, Response } from "express";
import { Transaction, Sequelize } from 'sequelize';
import { Connection } from "../db/connection";
import { Common } from "../helper/common";
import Roles_userModel from "../models/roles_user";

export class Controller {

  async getAll(req: Request, res: Response, next: any) {
    try {
      let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
      let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
      let offset = (page - 1) * limit;
      let where: any = new Common().setWhere(req.query, req.query.op as any);

      const results = await Roles_userModel().findAndCountAll({
        where,
        limit,
        offset
      });

      let rpt = {
        data: results.rows,
        meta: {
          total: results.count,
          page
        }
      }

      res.json({ ...rpt });
    } catch (error) {
      new Common().showLogMessage('Error controlado', error, 'error');
      next({
        message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
        error,
        code: 10
      });
    }
  }

  async get(req: Request, res: Response, next: any) {
    try {

      const { id } = req.params;
      const reg = await Roles_userModel().findByPk(id);

      if (!reg) {
        return res.status(404).json({
          message: `No se encuentra el recurso solicitado con el id ${id}`,
          error: 'Not found',
          code: 40
        })
      }

      res.json(reg);

    } catch (error) {
      new Common().showLogMessage('Error controlado', error, 'error');
      next({
        message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
        error,
        code: 10
      });
    }
  }

  async add(req: Request, res: Response, next: any) {

    const { body } = req;
    var transaction: Transaction;

    try {
      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      const reg = await Roles_userModel().create(body, { transaction });

      // Commit a los cambios
      await transaction.commit();

      res.json(reg);

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

  async update(req: Request, res: Response, next: any) {

    const { id } = req.params;
    const { body } = req;
    var transaction: Transaction;

    try {

      const reg = await Roles_userModel().findByPk(id);
      if (!reg) {
        return res.status(404).json({
          message: `No se encuentra el recurso solicitado con el id ${id}`,
          error: 'Not found',
          code: 40
        });
      }

      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      await reg.update(body, {
        where: {
          id
        },
        transaction
      });

      // Commit a los cambios
      await transaction.commit();

      res.json(reg);

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

  async delete(req: Request, res: Response, next: any) {

    const { id } = req.params;
    var transaction: Transaction;

    try {

      const reg = await Roles_userModel().findByPk(id);
      if (!reg) {
        return res.status(404).json({
          message: `No se encuentra el recurso solicitado con el id ${id}`,
          error: 'Not found',
          code: 40
        });
      }

      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      // Eliminación fisica
      await reg.destroy({ transaction });

      // Commit a los cambios
      await transaction.commit();

      res.json({
        message: `El registro con el ID ${id} ha sido eliminado`
      })

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
}
