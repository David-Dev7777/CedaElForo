import{pool} from '../db.js'

export const getLeyes1 = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM leyes') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getLey = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM leyes WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'ley no encontrado '})

    }
    res.json(rows)
}

export const crearLey = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO leyes (id, id_externo, titulo, contenido, categoria_id, numero_ley, fecha_publicacion, fecha_actualizacion, url_oficial, tags, metadata, activa, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *', 
        [data.id, data.id_externo, data.titulo, data.contenido, data.categoria_id, data.numero_ley, data.fecha_publicacion, data.fecha_actualizacion, data.url_oficial, data.tags, data.metadata, data.activa, data.created_at])
    res.status(201).json({
        message:'ley creada exitosamente',
        usuario:rows[0]})
    
}

export const eliminarley = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM leyes WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'ley no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarLey = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE leyes SET id_externo=$2, titulo=$3, contenido=$4, categoria_id=$5, numero_ley=$6, fecha_publicacion=$7, fecha_actualizacion=$8, url_oficial=$9, tags=$10, metadata=$11, activa=$12, created_at=$13 WHERE id=$1  RETURNING *',
         [ id, data.id_externo, data.titulo, data.contenido, data.categoria_id, data.numero_ley, data.fecha_publicacion, data.fecha_actualizacion, data.url_oficial, data.tags, data.metadata, data.activa, data.created_at])
       
    return res.json({
        message:'ley actualizada',
        usuario:rows[0]})
    

}