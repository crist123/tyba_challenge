import moment from "moment";
import { Op } from 'sequelize';
import chalk from 'chalk';

export class Common {
  /**
   * Muestra una traza en el log con tiempo
   */
  public showLogMessage(...[text, error, type]: ConfigLog) {

    // Si envian un error el determina el tipo
    type ??= error ? 'error' : 'log';

    // Si no hay error lo deja en null para que sea ignorado por el console
    error ??= '(Sin info)';

    // Si es error
    if (type == 'error') console.trace(`${chalk.green(moment(moment.now()).format('YYYY-MM-DD hh:mm:ss'))} :: ${chalk.red(text)}`, error);
    else console.log(chalk.green(moment(moment.now()).format('YYYY-MM-DD hh:mm:ss')) + ` :: ${chalk.blue(text)}`, error);
  }

  /**
   * Set value custom filter
   * @param query 
   * @param operation 
   */
  public setWhere(query: any, operation: 'or' | 'and' = 'or') {
    let filters: any = [];
    let where: any = null;

    for (const key in query) {
      if (key != 'page' && key != 'limit' && key != 'orderBy' && key != 'op') {
        filters.push({ [key]: { [Op.like]: `%${query[key]}%` } })
      }
    }

    if (filters.length > 0) {
      if (filters.length > 1) {
        where = {
          [Op[operation]]: filters
        }
      }
      else where = filters[0];
    }

    return where;
  }
}

/**
 * Configuración para la función de mensaje
 */
type ConfigLog =
  | [text: string, type?: 'error' | 'log']
  | [text: string, error: unknown, type?: 'error' | 'log']