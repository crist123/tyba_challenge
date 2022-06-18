import { DataTypes, Sequelize, Model, UUIDV4 } from "sequelize";
import { Connection } from "../db/connection";
import RolesModel, { IRole } from "./roles";

type includes = 'roles';

const Roles_userModel = (include?: (includes)[]) => {
  const model = (Connection.getInstance().db as Sequelize).define<Model<IRoleUser>>('roles_user', {
    "id": {
      "type": DataTypes.UUID,
      "primaryKey": true,
      "defaultValue": UUIDV4
    },
    "userId": {
      "type": DataTypes.STRING(36)
    },
    "roleId": {
      "type": DataTypes.STRING(36)
    },
    "createdAt": {
      "type": DataTypes.STRING
    },
    "updatedAt": {
      "type": DataTypes.STRING
    }
  }, { tableName: 'roles_user' });

  // Si incluye roles
  if (include && include.includes('roles')) {
  	model.hasOne(RolesModel(), {
  		sourceKey: 'roleId',
  		foreignKey: 'id',
  	});
  	RolesModel().belongsTo(model);
  }

  return model;
}

export interface IRoleUser {
  id?: string,
  userId?: string,
  roleId?: string,
  createdAt?: string,
  updatedAt?: string,
  role?: IRole,
}

export default Roles_userModel;