import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.render('principal')
})

router.get('/fiscalizacion', (req, res) => {
    res.render('fiscalizacion')
})

router.get('/leyes', (req, res) => {
    res.render('leyes')
})

router.get('/perfil_usuario', (req, res) => {
    res.render('perfil_usuario')
})

router.get('/configuracion_sistema', (req, res) => {
    res.render('configuracion_sistema')
})


export default router