import{pool} from '../db.js'

export const getPublicacionesForo = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM publicaciones_foro') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getPublicacionesForos_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM publicaciones_foro WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'publicacion no encontrado '})

    }
    res.json(rows)
}

export const crearPublicacionesForo = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO publicaciones_foro (titulo, contenido, usuario_id, categoria_id, estado, fecha_publicacion, fecha_actualizacion, vistas, es_anónima) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', 
        [ data.titulo, data.contenido, data.usuario_id, data.categoria_id, data.estado, data.fecha_publicacion, data.fecha_actualizacion, data.vistas, data.es_anónima])
    res.status(201).json({
        message:'publicacion agregado exitosamente',
        publicacione:rows[0]})
    
}

export const eliminarPublicacionesForo = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM publicaciones_foro WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'publicacione no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarPublicacionesForo = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE publicaciones_foro SET titulo=$2, contenido=$3, usuario_id=$4, categoria_id=$5, estado=$6, fecha_publicacion=$7, fecha_actualizacion=$8,  vistas=$9, es_anónima=$10 WHERE id=$1  RETURNING *',
         [id, data.titulo, data.contenido, data.usuario_id, data.categoria_id, data.estado, data.fecha_publicacion, data.fecha_actualizacion, data.vistas, data.es_anónima])
       
    return res.json({
        message:'publicacione actualizada',
        publicacion:rows[0]})
    

}