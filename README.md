# tyba_challenge

API para la prueba técnica de Tyba

## Iniciar en local

Se necesita tener instalado [Node.js](https://nodejs.org/).

1. Ejecutar los siguientes comandos

```sh
npm install
npm run start:local
```

2. La aplicación estará corriendo en [http://localhost:4000](http://localhost:4000/).

## Correr pruebas unitarias

1. Ejecutar el siguiente comando

```sh
npm run test
```

## Desplegar e iniciar con Docker 

1. Compilar paquete en prod

```sh
npm run build:prod
```

2. Copiar contenido de la carpeta dist al servidor

**Nota:** Si esta corriendo la base de datos en local se recomienda cambiar la variable de entorno de la conexión a base de datos en el archivo `environments/.prod.env` de la siguiente manera en el caso de que su sistema sea Mac, en caso contrario puede revisar estas [instrucciones](https://docs.docker.com/desktop/windows/networking/) para modificarlo de acuerdo a su SO 

```js
...
HOST_DB="host.docker.internal" // Para mac
...
```

3. En la carpeta donde quede alojado el contenido, iniciar el contenedor con docker-compose

```sh
docker-compose up -d
```

4. La aplicación estará corriendo en [http://localhost:4001](http://localhost:40001/).

## Documentación

La documentación es una colección de Postman, la encontrará en el archivo `Tyba challenge doc.postman_collection.json`, debe importar este archivo en su entorno de Postman

## Authors

* **Andres Fajardo** - [visit site](https://github.com/crist123)

## License

View file [LICENSE.md](LICENSE.md) for more details.