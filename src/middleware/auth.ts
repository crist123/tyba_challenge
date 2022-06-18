import * as jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import UsersModel from "../models/users";

export class AuthMiddleware {

  constructor() {
  }

  /**
   * Realiza la autorización
   */
  public auth = async (req: any, res: Response, next: NextFunction) => {

    let jwtToken = req.header('Authorization');
    if (!jwtToken) return res.status(401).json('Token not found');

    try {
      const payload: any = jwt.decode(jwtToken);
      const reg = await UsersModel().findByPk(payload.ius);
      jwt.verify(jwtToken, reg?.toJSON().accessKey!);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json('Invalid token');
    }
  }
}