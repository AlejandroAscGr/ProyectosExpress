// Aqui importamos parejito todo lo que venia en index.js
// Express
var express = require('express');
const router = express.Router();
//Validator
const { body, validationResult } = require('express-validator');
// Database
const db = require('../database/db');

//este es un get que trae todos los clientes parejos y los arregla en un yeison 
//en el orden de la base de datos
router.get('/', async function (req, res, next) {

    try {
        const [rows] = await db.query('SELECT * FROM clientes');
        res.json(rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});

//este get es para que busques un cliente por nombre
router.get('/:nombre', async function (req, res, next) {

    try {
        const [rows] = await db.query('SELECT * FROM clientes where nombre like ?', [req.params.nombre + '%']);
        res.json(rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }

});

// //este get es para que busques un cliente por nombre o por id con un . %.
// //osea, lo principal es que sea por id, osea un id exacto, 
// //y si no se encuentra, pues que busque por nombre agregando un % al final
// // yo creo que quedaria mejor con un if else, pero pues no hay tiempo para pruebas
// //tons se queda comentado el wey
// router.get('/:busqueda', async function (req, res, next) {
//   try {
//     const [rows] = await db.query(
//       'SELECT * FROM clientes WHERE id = ? OR nombre LIKE ?',
//       [req.params.busqueda, req.params.busqueda + '%']
//     );
//     res.json(rows);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: 'Error al conectar a la base de datos' });
//   }
// });

//este es el post con los datos que el profe pidio
//siempre le agrego el console.log porque es mas facil investigar errores asi

router.post('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'INSERT INTO clientes (ID, nombre, apellidos, RFC, correo, domicilio) VALUES (?, ?, ?, ?, ?, ?)',
            [null, req.body.nombre, req.body.apellidos, req.body.RFC, req.body.correo, req.body.domicilio]
        );

        if (rows.affectedRows === 1) {
            let envio = {
                msj: "Registro insertado",
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


//este es el put que pidio, nomas cambia el nombre en el id que se le indique igual que en clase
router.put('/', async (req, res) => {
    try {
        const [rows] = await db.query('UPDATE clientes SET nombre= ? where ID = ?', [req.body.nombre, req.body.ID]);
        if (rows.affectedRows === 1) {
            let envio = {
                msj: "Registro actualizado",
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

// //este put funciona igual que la consulta, nomas que cambia todo el registro con el id que se le indique
// //se tiene que especificar en la url el id
// // igual se queda comentado el wey
// router.put('/:id', async (req, res) => {
//     try {
//         const [rows] = await db.query(
//             'UPDATE clientes SET nombre=?, apellidos=?, RFC=?, correo=?, domicilio=? WHERE ID=?',
//             [req.body.nombre, req.body.apellidos, req.body.RFC, req.body.correo, req.body.domicilio, req.params.id]
//         );

//         if (rows.affectedRows === 1) {
//             res.json({
//                 msj: "Registro actualizado",
//             });
//         } else {
//            let error = {
//                msj:"Error: No se encontro el registro para actualizar"
//            }
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Error al conectar a la base de datos' });
//     }
// });

//este es el delete con params
router.delete('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('DELETE FROM clientes WHERE ID = ?', [req.params.id]);
        if (rows.affectedRows === 1) {
            let envio = {
                msj: "Registro eliminado correctamente",
                rows
            };
            res.json(envio);
        } else {
            let error = {
                msj: "Error: No se encontro el registro para eliminar"
            };
            res.json(error);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});

// aqui van las rutas
module.exports = router;