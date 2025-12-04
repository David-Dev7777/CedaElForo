import{pool} from '../db.js'

export const getComentarios = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM comentarios') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getComentarios_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM comentarios WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'comentario no encontrado '})

    }
    res.json(rows)
}

export const crearComentarios = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO comentarios (contenido, usuario_id, publicacion_id, comentario_padre_id, estado, fecha_comentario, fecha_actualizacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
        [ data.contenido, data.usuario_id, data.publicacion_id, data.comentario_padre_id, data.estado, data.fecha_comentario, data.fecha_actualizacion])
    res.status(201).json({
        message:'comentario agregado exitosamente',
        comentario:rows[0]})
    
}

export const eliminarComentarios = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM comentarios WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'comentario no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarComentarios = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE comentarios SET contenido=$2, usuario_id=$3, publicacion_id=$4, comentario_padre_id=$5, estado=$6, fecha_comentario=$7, fecha_actualizacion=$8 WHERE id=$1  RETURNING *',
         [id, data.contenido, data.usuario_id, data.publicacion_id, data.comentario_padre_id, data.estado, data.fecha_comentario, data.fecha_actualizacion])
       
    return res.json({
        message:'comentario actualizado',
        comentario:rows[0]})
    

}