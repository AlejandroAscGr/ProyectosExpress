var express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const bcrypt = require('bcrypt');

/* GET home page. */
/*
Envio de informacion dentro del request 
*/

router.get('/no/:mensaje', function (req, res, next) {
  let msj = req.params.mensaje;
  res.send("No sirveeeee, mensaje enviado por " + msj);
  res.render('index', { title: 'Grupo 7C DSM' });
});

router.get('/', async function (req, res, next) {

  try {
    const [rows] = await db.query('SELECT * FROM empleados');
    res.json(rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
  //res.render('index', { title: 'Grupo 7C DSM', datos: rows });

});

router.get('/empleados/:nombre', async function (req, res, next) {

  try {
    const [rows] = await db.query('SELECT * FROM empleados where nombre like ?', [req.params.nombre + '%']);
    res.json(rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
  //res.render('index', { title: 'Grupo 7C DSM', datos: rows });

});

/*los parametros del metodo (GET, POST, PUT, DELETE) son: la ruta y una funcion que recibe dos parametros 
(request y response)
El primero es la URI:
Reglas de la URI: No se puede usar a misma URI en el mismo metodo en la misma API

El segundo es la funcicon anonima
Los parametros de la funcion anonima son: request (peticion), response (respuesta) y next operacion
)
*/

router.post('/no', (req, res) => {
  res.send("No sirve");
});


//solo el metodo get se ouede ejecutar en la barra de navegacion

//npm install --save express-validator
//'/api/users' (Cambiar la URI en app,js)

/*
 * 
 * 1. Primero importas body y validationResult arriba en tu archivo.
 * 2. En la ruta router.post('/'), le pasas como segundo parametro un arreglo [] 
 *    con las reglas que quieres validar.
 * 3. Adentro de la funcion, llamas a validationResult(req) para ver si todo salio bien.
 * 4. Si hay errores (!errores.isEmpty()), cortas la ejecucion con res.status(400) 
 *    y le devuelves los errores al usuario en Postman.
 * 5. Si no hay errores, ejecutastu query de MySQL.
 */

router.post('/prueba', [
  body("nombre").isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
  body("apellidopaterno").isLength({ min: 2, max: 100 }).withMessage("El apellido paterno debe tener entre 2 y 100 caracteres"),
  body("apellidomaterno").isLength({ min: 2, max: 100 }).withMessage("El apellido materno debe tener entre 2 y 100 caracteres"),
  body("edad").isInt({ min: 1, max: 120 }).withMessage("La edad debe ser un numero valido entre 1 y 120")
], async (req, res) => {

  // Revisamos si express-validator encontro alguna falla
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  // Si todo esta chido, insertamos en la base de datos
  try {
    const { nombre, apellidopaterno, apellidomaterno, edad } = req.body;
    const [result] = await db.query(
      'INSERT INTO empleados (nombre, apellidopaterno, apellidomaterno, edad) VALUES (?, ?, ?, ?)',
      [nombre, apellidopaterno, apellidomaterno, edad]
    );
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al insertar en la base de datos' });
  }
});


//en mi bd no tengo password, voy a encriptar el password
router.post('/', async (req, res) => {
  try {
    let salt = await bcrypt.genSalt(10);
    let passcifrado = await bcrypt.hash(req.body.password, salt);
    const [rows] = await db.query(
      'INSERT INTO empleados (id, nombre, apellidopaterno, apellidomaterno, edad, usuario, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [null, req.body.nombre, req.body.apellidopaterno, req.body.apellidomaterno, req.body.edad, req.body.usuario, passcifrado]
    );

    if (rows.affectedRows === 1) {
      let envio = {
        msj: "Registro insertado",
        rows
      };
      res.status(201).json(envio);
    } else {
      res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});

router.put('/', async (req, res) => {
  try {
    const [rows] = await db.query('UPDATE empleados SET nombre= ? where ID = ?', [req.body.nombre, req.body.ID]);
    if (rows.affectedRows === 1) {
      let envio = {
        msj: "Registro actualizado",
        rows
      };
      res.json(envio);
    } else {
      let error = {
        msj: "Error: No se pudo actualizar el registro"
      };
      res.json(error);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('DELETE FROM empleados WHERE ID = ?', [id]);

    if (rows.affectedRows === 1) {
      let envio = {
        msj: "Registro eliminado correctamente",
        rows
      };
      res.json(envio);
    } else {
      let error = {
        msj: "Error: No se encontró el registro para eliminar"
      };
      res.status(404).json(error);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});

router.post('/iniciosesion', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM empleados where usuario = ?', [req.body.usuario]);
    if (rows.length === 0) {
      return res.send("Error: usuario y contraseña incorrectos");
    }
    if (! await bcrypt.compare(req.body.password, rows[0].password)) {
      return res.send("Error: usuario y contraseña incorrectos");
    }
    res.json(rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});

module.exports = router;

