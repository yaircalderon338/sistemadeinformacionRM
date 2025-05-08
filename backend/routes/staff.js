/**
 * @fileoverview Rutas para la gestión de empleados (tbl_staff) en el sistema.
 */

const express = require('express');
const router = express.Router();
const client = require('../db');

/**
 * @route GET /
 * @description Obtiene todos los empleados.
 * @returns {Array} Lista de empleados.
 */
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM tbl_staff');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /:id
 * @description Obtiene un empleado por su ID.
 * @param {number} id - ID del empleado.
 * @returns {Object} Empleado encontrado o error si no existe.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM tbl_staff WHERE staffid = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /
 * @description Crea un nuevo empleado.
 * @body {string} username - Nombre de usuario.
 * @body {string} password - Contraseña.
 * @body {string} status - Estado del empleado.
 * @body {string} role - Rol del empleado.
 * @returns {Object} Empleado creado.
 */
router.post('/', async (req, res) => {
  const { username, password, status, role } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO tbl_staff (username, password, status, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, password, status, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PUT /:id
 * @description Actualiza un empleado existente por su ID.
 * @param {number} id - ID del empleado.
 * @body {string} username - Nuevo nombre de usuario.
 * @body {string} password - Nueva contraseña.
 * @body {string} status - Nuevo estado.
 * @body {string} role - Nuevo rol.
 * @returns {Object} Empleado actualizado o error si no existe.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, status, role } = req.body;
  try {
    const result = await client.query(
      'UPDATE tbl_staff SET username = $1, password = $2, status = $3, role = $4 WHERE staffid = $5 RETURNING *',
      [username, password, status, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /:id
 * @description Elimina un empleado por su ID.
 * @param {number} id - ID del empleado.
 * @returns {Object} Mensaje de confirmación o error si no existe.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM tbl_staff WHERE staffid = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


