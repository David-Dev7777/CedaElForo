import { Router } from 'express'

import{getUsuario, getUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario} from '../controllers/controlador_usuarios.js'
import{ getLeyes1, getLey, crearLey, actualizarLey, eliminarley } from '../controllers/controlador_leyes.js'
import{getPerfil, getPerfiles, crearPerfil, eliminarPerfil, actualizarPerfil} from '../controllers/controlador_perfiles.js'
import{getConfig, getConfig_id, crearConfig, eliminarConfig, actualizarConfig} from '../controllers/controlador_configuraciones.js'

const router = Router()

router.get('/', (req, res) => {
    res.render('principal')
})

router.get('/usuarios', getUsuarios )

//buscar un usuario
router.get('/usuario/:id', getUsuario)

// eliminar un usario
router.delete('/usuario/:id', eliminarUsuario)

//crear usuario
router.post('/usuario',crearUsuario)

//actualizar usuario
router.put('/usuario/:id',actualizarUsuario)

router.get('/fiscalizacion', (req, res) => {
    res.render('fiscalizacion')
})



router.get('/leyes', getLeyes1)
router.get('/leyes/:id', getLey)
router.post('/leyes', crearLey)
router.put('/leyes/:id', actualizarLey)
router.delete('/leyes/:id', eliminarley)

router.get('/perfil_usuario', getPerfiles)
router.get('/perfil_usuario/:id', getPerfil)
router.post('/perfil_usuario', crearPerfil)
router.put('/perfil_usuario/:id', actualizarPerfil)
router.delete('/perfil_usuario/:id', eliminarPerfil)

router.get('/configuraciones', getConfig)
router.get('/configuraciones/:id', getConfig_id)
router.post('/configuraciones', crearConfig)
router.put('/configuraciones/:id', actualizarConfig)
router.delete('/configuraciones/:id', eliminarConfig)


export default router