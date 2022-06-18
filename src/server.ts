import { createServer, Server as HTTPServer } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import { Sequelize } from "sequelize";
import { Connection } from "./db/connection";

// Middlewares
import { ErrorMiddleware } from "./middleware/errorHandler";
import { NotFoundMiddleware } from "./middleware/notFoundHandler";

// Rutas
import rolesRoutes from "./routes/roles";
import roles_userRoutes from "./routes/roles_user";
import transactionsRoutes from "./routes/transactions";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";

export class Server {

  public app: Application = express();
  private httpServer: HTTPServer = createServer(this.app);

  private initialize(): void {

    // Inicia la configuración de la app
    this.initApp();
    this.configureRoutes();
    this.dbConnection();
    // Inicia los middelwares
    this.mountMiddlewares();
  }

  /**
   * Inicia la aplicación
   */
  private initApp(): void {

    this.app.disable("x-powered-by");
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(cors({
      exposedHeaders: ['Authorization', 'authorization', 'Content-Length'],
    }));

    // Establece las respuestas del header
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
    });
  }

  async dbConnection() {
    try {
      await (Connection.getInstance().db as Sequelize).authenticate();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Establece las rutas
   */
  private mountMiddlewares(): void {

    const errorMid = new ErrorMiddleware();
    const notFound = new NotFoundMiddleware();

    // 404
    this.app.use(notFound.notFountHandler);

    // Manejo de errores
    this.app.use(errorMid.logErrors);
    this.app.use(errorMid.wrapErrors);
    this.app.use(errorMid.errorHandler);
  }
  
  /**
   * Inicia las rutas
   */
  private configureRoutes(): void {
    this.app.use("/tyba/api/auth", authRoutes);
    this.app.use("/tyba/api/roles", rolesRoutes);
    this.app.use("/tyba/api/roles_user", roles_userRoutes);
    this.app.use("/tyba/api/transactions", transactionsRoutes);
    this.app.use("/tyba/api/users", usersRoutes);
  }

  /**
   * Inicia el listener del server
   * @param callback 
   */
  public listen(callback: (port: number) => void): void {
    let port = parseInt(process.env.PORT as any);
    this.httpServer.listen(port, () => {
      callback(port);
      this.initialize();
    });
  }

  public close() {
    this.httpServer.close();
  }
}