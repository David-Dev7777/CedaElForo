import{pool} from '../config.js'

export const getModeraciones = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM moderaciones') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getModeraciones_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM moderaciones WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'Moderacion no encontrado '})

    }
    res.json(rows)
}

export const crearModeraciones = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO moderaciones (administrador_id, tipo_accion, publicacion_id, comentario_id, usuario_afectado_id, razon, fecha_moderacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
        [ data.administrador_id, data.tipo_accion, data.publicacion_id, data.comentario_id, data.usuario_afectado_id, data.razon, data.fecha_moderacion])
    res.status(201).json({
        message:'Moderacion agregada exitosamente',
        Moderaciones:rows[0]})
    
}

export const eliminarModeraciones = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM moderaciones WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'categoria no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarModeraciones = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE moderaciones SET administrador_id=$2, tipo_accion=$3, publicacion_id=$4, comentario_id=$5, usuario_afectado_id=$6, razon=$7, fecha_moderacion=$8 WHERE id=$1  RETURNING *',
         [id ,data.administrador_id, data.tipo_accion, data.publicacion_id, data.comentario_id, data.usuario_afectado_id, data.razon, data.fecha_moderacion])
       
    return res.json({
        message:'Moderacion actualizada',
        Moderaciones:rows[0]})
    

}