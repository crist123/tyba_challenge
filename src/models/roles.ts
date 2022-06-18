import { DataTypes, Sequelize, Model, UUIDV4 } from "sequelize";
import { Connection } from "../db/connection";

type includes = '';

const RolesModel = (include?: (includes)[]) => {
  const model = (Connection.getInstance().db as Sequelize).define<Model<IRole>>('roles', {
    "id": {
      "type": DataTypes.UUID,
      "primaryKey": true,
      "defaultValue": UUIDV4
    },
    "name": {
      "type": DataTypes.STRING(45)
    },
    "key": {
      "type": DataTypes.STRING(45)
    },
    "createdAt": {
      "type": DataTypes.STRING
    },
    "updatedAt": {
      "type": DataTypes.STRING
    }
  }, { tableName: 'roles' });

  return model;
}

export interface IRole {
  id?: string,
  name?: string,
  key?: string,
  createdAt?: string,
  updatedAt?: string,
}

export default RolesModel;