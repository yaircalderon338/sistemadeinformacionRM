const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @openapi
 * /admin:
 *   get:
 *     summary: Obtener todos los administradores
 *     description: Devuelve una lista de todos los administradores registrados en el sistema.
 *     responses:
 *       200:
 *         description: Lista de administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: "admin1"
 *                   password:
 *                     type: string
 *                     example: "password123"
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_admin');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /admin/{id}:
 *   get:
 *     summary: Obtener un administrador por ID
 *     description: Devuelve los detalles de un administrador específico usando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del administrador
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detalles del administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "admin1"
 *                 password:
 *                   type: string
 *                   example: "password123"
 *       404:
 *         description: Administrador no encontrado
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM tbl_admin WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /admin:
 *   post:
 *     summary: Crear un nuevo administrador
 *     description: Crea un nuevo administrador en el sistema con un nombre de usuario y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin1"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Administrador creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "admin1"
 *                 password:
 *                   type: string
 *                   example: "password123"
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_admin (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /admin/{id}:
 *   put:
 *     summary: Actualizar los detalles de un administrador
 *     description: Actualiza el nombre de usuario y la contraseña de un administrador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del administrador
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin1"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Administrador actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "admin1"
 *                 password:
 *                   type: string
 *                   example: "newpassword123"
 *       404:
 *         description: Administrador no encontrado
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_admin SET username = $1, password = $2 WHERE id = $3 RETURNING *',
      [username, password, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /admin/{id}:
 *   delete:
 *     summary: Eliminar un administrador
 *     description: Elimina un administrador del sistema usando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del administrador a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Administrador eliminado
 *       404:
 *         description: Administrador no encontrado
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM tbl_admin WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    res.json({ message: 'Admin eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
