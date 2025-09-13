import express from 'express'
import { obtenerGatos, obtenerGatoPorId, crearGato, actualizarGato, eliminarGato, marcarComoAdoptado } from '../controllers/gato.controller.js';
import {esAdmin, protectRoute} from '../middlewares/user.middleware.js'
const router = express.Router();
router.get('/', protectRoute, obtenerGatos)
router.get('/:id', protectRoute, obtenerGatoPorId);
router.post('/crear-gato', protectRoute, esAdmin, crearGato);
router.put('/:id/modificar-gato', protectRoute, esAdmin, actualizarGato);
router.delete('/:id/eliminar-gato', protectRoute, esAdmin, eliminarGato);
router.put('/:id/adoptar-gato', protectRoute, esAdmin, marcarComoAdoptado);
export default router;