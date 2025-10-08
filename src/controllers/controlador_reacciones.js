import{pool} from '../db.js'

export const getReacciones = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM reacciones') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getReacciones_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM reacciones WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'reaccion no encontrado '})

    }
    res.json(rows)
}

export const crearReacciones = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO reacciones (usuario_id, publicacion_id, comentario_id, tipo, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
        [ data.usuario_id, data.publicacion_id, data.comentario_id, data.tipo, data.created_at])
    res.status(201).json({
        message:'reaccion agregada exitosamente',
        reaccion:rows[0]})
    
}

export const eliminarReacciones = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM reacciones WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'reaccion no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarReacciones = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE reacciones SET usuario_id=$2, publicacion_id=$3, comentario_id=$4, tipo=$5, created=$6 WHERE id=$1  RETURNING *',
         [id, data.usuario_id, data.publicacion_id, data.comentario_id, data.tipo, data.created_at])
       
    return res.json({
        message:'reaccion  actualizada',
        reaccion:rows[0]})
    

}