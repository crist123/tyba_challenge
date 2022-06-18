import { Request, Response } from "express";
import { Transaction, Sequelize } from 'sequelize';
import axios from 'axios';
import { Connection } from "../db/connection";
import { Common } from "../helper/common";
import TransactionsModel from "../models/transactions";

export class Controller {

  async getAll(req: Request, res: Response, next: any) {
    try {
      let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
      let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
      let offset = (page - 1) * limit;

      const results = await TransactionsModel().findAndCountAll({
        where: { userId: (req as any).user.ius },
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
      const reg = await TransactionsModel().findByPk(id);

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

      // Si no hay ni coordenadas ni ciudad
      if (!body.coordinates && !body.city) {
        return res.status(422).json({
          message: `Debe pasar coordenadas o ciudad`,
          error: 'Not found "city" or "coordinates"'
        });
      }

      var coordinates = body.coordinates;

      /**
       * Si no hay coordenadas pero hay ciudad obtiene las coordenadas de la ciudad
       * Usa el servicio gratuito de position stack para parsear ubicaciones
       */
      if (!body.coordinates && body.city) {
        var config = {
          method: 'get',
          url: `${process.env.URL_API_POSITION_STACK}/forward?access_key=${process.env.API_KEY_POSITION_STACK}&query=${body.city}&limit=1&output=json`,
          headers: {}
        };

        const response = await axios(config);

        // Si no encuentra la ubicacion
        if (!response.data.data.length) {
          throw new Error("Error al parsear la ciudad, no se encuentra su ubicación, pruebe usar otras palabras para identificar la ciudad");
        }

        coordinates = `${response.data.data[0].latitude},${response.data.data[0].longitude}`;
      }

      // Radio por defecto 200 metros
      if (!body.radius) body.radius = 200;

      var config = {
        method: 'get',
        url: `${process.env.URL_API_GOOGLE}?location=${coordinates}&radius=${body.radius}&type=restaurant&key=${process.env.GOOGLE_MAPS_API_KEY!}`,
        headers: {}
      };

      const response = await axios(config);

      // Establece el objeto de coordenadas para almacenarlo
      if (body.coordinates) {
        const [lat, lng] = body.coordinates.split(',');
        body.coordinates = { lat, lng };
      }

      var places: any = [];

      // Arma un objeto custom
      for (const place of response.data.results) {
        const { geometry, name, types, vicinity, rating } = place;
        places.push({ geometry, name, types, vicinity, rating });
      }

      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      await TransactionsModel().create({
        ...body,
        results: JSON.stringify(places),
        // User id
        userId: (req as any).user.ius
      }, { transaction });

      // Commit a los cambios
      await transaction.commit();

      res.json(places);

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

      const reg = await TransactionsModel().findByPk(id);
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

  async deleteAllUser(req: Request, res: Response, next: any) {

    const { id } = req.params;
    var transaction: Transaction;

    try {

      // Inicia una transacción
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      // Eliminación fisica
      await TransactionsModel().destroy({
        where: { userId: id },
        transaction
      });

      // Commit a los cambios
      await transaction.commit();

      res.json({
        message: `Transacciones del usuario ${id} eliminadas correctamente`
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

  async delete(req: Request, res: Response, next: any) {

    const { id } = req.params;
    var transaction: Transaction;

    try {

      const reg = await TransactionsModel().findByPk(id);
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
