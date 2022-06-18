import { Sequelize } from "sequelize";

export class Connection {
  private static instance: Connection;
  public db?: Sequelize;

  constructor() { }

  /**
   * Obtiene la instancia de la clase
   */
  public static getInstance(): Connection {
    if (!Connection.instance) {
      Connection.instance = new Connection();

      Connection.instance.db = new Sequelize(process.env.DB as string, process.env.USER_DB as string, process.env.PASS_DB, {
        host: process.env.HOST_DB,
        dialect: 'mysql',
        define: {
          timestamps: false,
        },
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 60000,
          idle: 10000,
        },
      })
    }

    return Connection.instance;
  }
}