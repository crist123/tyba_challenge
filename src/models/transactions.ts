import { DataTypes, Sequelize, Model, UUIDV4 } from "sequelize";
import { Connection } from "../db/connection";
import UsersModel, { IUser } from "./users";

type includes = 'users';

const TransactionsModel = (include?: (includes)[]) => {
  const model = (Connection.getInstance().db as Sequelize).define<Model<ITransaction>>('transactions', {
    "id": {
      "type": DataTypes.UUID,
      "primaryKey": true,
      "defaultValue": UUIDV4
    },
    "coordinates": {
      "type": DataTypes.JSON
    },
    "city": {
      "type": DataTypes.STRING(45)
    },
    "userId": {
      "type": DataTypes.STRING(36)
    },
    "results": {
      "type": DataTypes.JSON
    },
    "radius": {
      "type": DataTypes.INTEGER.UNSIGNED
    },
    "createdAt": {
      "type": DataTypes.STRING
    },
    "updatedAt": {
      "type": DataTypes.STRING
    }
  }, { tableName: 'transactions' });

  // Si incluye users
  if (include && include.includes('users')) {
    model.hasOne(UsersModel(), {
      sourceKey: 'userId',
      foreignKey: 'id',
    });
    UsersModel().belongsTo(model);
  }

  return model;
}

export interface ITransaction {
  id?: string,
  userId?: string,
  coordinates?: any,
  city?: string,
  results?: any,
  radius?: number,
  createdAt?: string,
  updatedAt?: string,
  user?: IUser,
}

export default TransactionsModel;