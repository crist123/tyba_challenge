import request from 'supertest'
import server from '../index';

var _server = server;
const api = request(_server.app);
var auth: string;

describe('Transactions API', () => {

  beforeAll(done => {
    // Inicio de sesion
    api.post('/tyba/api/auth/login')
      .send({
        email: 'test@test.com',
        pass: 'qwerty'
      }).then(res => {
        auth = res.headers.authorization;
        // El timeout es para que alcance a refrescar el token
        setTimeout(() => {
          done();
        }, 1000);
      })
  });

  it('Crear transacción con coordenadas', async () => {

    const res = await api
      .post('/tyba/api/transactions')
      .set('Authorization', auth)
      .send({
        "coordinates": "4.575683,-74.115945",
        "radius": 800,
      })

    // Revisa que el código de respuesta sea OK
    expect(res.statusCode).toEqual(200)
    // Revisa que el contenido de la respuesta sea un arreglo
    expect(Array.isArray(res.body)).toBe(true);
    // Revisa que el arreglo de la respuesta tenga objetos
    expect(res.body.length).toBeGreaterThan(0);

    // Recorre todas los registros para ver que tenga las propiedades necesarias
    for (const obj of res.body) {
      expect(obj).toHaveProperty('geometry')
      expect(obj).toHaveProperty('name')
      expect(obj).toHaveProperty('types')
    }
  });

  it('Crear transacción con ciudad', async () => {

    const res = await api
      .post('/tyba/api/transactions')
      .set('Authorization', auth)
      .send({
        "city": "bogota,colombia",
        "radius": 800,
      })

    // Revisa que el código de respuesta sea OK
    expect(res.statusCode).toEqual(200)
    // Revisa que el contenido de la respuesta sea un arreglo
    expect(Array.isArray(res.body)).toBe(true);
    // Revisa que el arreglo de la respuesta tenga objetos
    expect(res.body.length).toBeGreaterThan(0);

    // Recorre todas los registros para ver que tenga las propiedades necesarias
    for (const obj of res.body) {
      expect(obj).toHaveProperty('geometry')
      expect(obj).toHaveProperty('name')
      expect(obj).toHaveProperty('types')
    }
  });

  it('Obtener histórico transacciones', async () => {
    const res = await api
      .get('/tyba/api/transactions?page=1&limit=10')
      .set('Authorization', auth)

    // Revisa que el código de respuesta sea OK
    expect(res.statusCode).toEqual(200)
    // Revisa que el body de la respuesta tenga las propiedades data y meta
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('meta')

    // Revisa que el contenido de meta tenga las propiedades total y page
    expect(res.body.meta).toHaveProperty('total')
    expect(res.body.meta).toHaveProperty('page')

    // Recorre todas los registros para ver que tenga las propiedades necesarias
    for (const obj of res.body.data) {
      expect(obj).toHaveProperty('id')
      expect(obj).toHaveProperty('coordinates')
      expect(obj).toHaveProperty('city')
      expect(obj).toHaveProperty('userId')
      expect(obj).toHaveProperty('results')
      expect(obj).toHaveProperty('radius')
    }
  });

  it('Obtener histórico transacciones, sin token', async () => {
    const res = await api
      .get('/tyba/api/transactions?page=1&limit=10')

    // Revisa que el código de respuesta sea Unauthorized
    expect(res.statusCode).toEqual(401)
    // Revisa que el body de la respuesta sea el mensaje "Token not found"
    expect(res.body).toEqual('Token not found')
  });

  it('Obtener histórico transacciones, token invalido', async () => {
    const res = await api
      .get('/tyba/api/transactions?page=1&limit=10')
      .set('Authorization', "bad_token")

    // Revisa que el código de respuesta sea Unauthorized
    expect(res.statusCode).toEqual(401)
    // Revisa que el body de la respuesta sea el mensaje "Invalid token"
    expect(res.body).toEqual('Invalid token')
  });

  afterAll(() => {
    // El id del usuario es el de test
    const user_id = "a36bafe2-5605-4480-8de6-8d7d50335352";
    // Elimina las transacciones de prueba que se hicieron
    api.delete('/tyba/api/transactions/user/' + user_id)
      .set('Authorization', auth)
      .then(res => {
        // Cierre de sesion
        api.post('/tyba/api/auth/logout')
          .set('Authorization', auth)
          .then(res => {
            server.close();
          })
      })
  });
})