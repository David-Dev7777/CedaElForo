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
    const { usuario_id, publicacion_id, comentario_id, tipo, created_at } = data

    try {
        // Buscar reacción existente del mismo usuario para la misma publicación/comentario
        const existingRes = await pool.query(
            `SELECT * FROM reacciones WHERE usuario_id = $1 AND publicacion_id = $2 AND ((comentario_id IS NULL AND $3 IS NULL) OR comentario_id = $3)`,
            [usuario_id, publicacion_id, comentario_id]
        )

        const existing = existingRes.rows[0]

        if (existing) {
            // Si la misma reacción ya existe -> toggle (eliminar)
            if (existing.tipo === tipo) {
                await pool.query('DELETE FROM reacciones WHERE id = $1', [existing.id])
                return res.json({ message: 'reacción eliminada', action: 'deleted', reaccion: existing })
            }

            // Si existe pero es distinto tipo -> actualizar tipo y created_at
            const { rows } = await pool.query(
                'UPDATE reacciones SET tipo = $1, created_at = $2 WHERE id = $3 RETURNING *',
                [tipo, created_at || new Date().toISOString(), existing.id]
            )
            return res.json({ message: 'reacción actualizada', action: 'updated', reaccion: rows[0] })
        }

        // No existe: crear nueva reacción
        const insertRes = await pool.query(
            'INSERT INTO reacciones (usuario_id, publicacion_id, comentario_id, tipo, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, publicacion_id, comentario_id, tipo, created_at || new Date().toISOString()]
        )
        return res.status(201).json({ message: 'reacción agregada exitosamente', action: 'created', reaccion: insertRes.rows[0] })
    } catch (err) {
        console.error('Error en crearReacciones:', err)
        return res.status(500).json({ message: 'Error interno al crear reacción' })
    }
    
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