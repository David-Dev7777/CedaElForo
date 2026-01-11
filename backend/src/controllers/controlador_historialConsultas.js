import{pool} from '../config.js'

export const getConsultaHistorial = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM historial_consultas') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getConsultaHistorial_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM historial_consultas WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'historial no encontrado '})

    }
    res.json(rows)
}

export const crearConsultaHistorial = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO historial_consultas (usuario_id, ley_id, fecha_consulta, terminos_busqueda) VALUES ($1, $2, $3, $4) RETURNING *', 
        [ data.usuario_id, data.ley_id, data.fecha_consulta, data.terminos_busqueda])
    res.status(201).json({
        message:'historial agregado exitosamente',
        historial:rows[0]})
    
}

export const eliminarConsultaHistorial = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM historial_consultas WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'historial no encontrado'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarConsultaHistorial = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE historial_consultas SET usuario_id=$2, ley_id=$3, fecha_consulta=$4, terminos_busqueda=$5 WHERE id=$1  RETURNING *',
         [id, data.usuario_id, data.ley_id, data.fecha_consulta, data.terminos_busqueda])
       
    return res.json({
        message:'historial actualizado',
        historial:rows[0]})
    

}