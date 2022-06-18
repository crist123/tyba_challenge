import { DataTypes, Sequelize, Model, UUIDV4 } from "sequelize";
import { Connection } from "../db/connection";

type includes = '';

const UsersModel = (include?: (includes)[]) => {
  const model = (Connection.getInstance().db as Sequelize).define<Model<IUser>>('users', {
    "id": {
      "type": DataTypes.UUID,
      "primaryKey": true,
      "defaultValue": UUIDV4
    },
    "name": {
      "type": DataTypes.STRING(45)
    },
    "email": {
      "type": DataTypes.STRING(45)
    },
    "password": {
      "type": DataTypes.TEXT
    },
    "status": {
      "type": DataTypes.BOOLEAN
    },
    "accessKey": {
      "type": DataTypes.TEXT
    },
    "createdAt": {
      "type": DataTypes.STRING
    },
    "updatedAt": {
      "type": DataTypes.STRING
    }
  }, { tableName: 'users' });

  return model;
}

export interface IUser {
  id?: string,
  name?: string,
  email?: string,
  password?: string,
  status?: boolean,
  accessKey?: string,
  createdAt?: string,
  updatedAt?: string,
}

export default UsersModel;