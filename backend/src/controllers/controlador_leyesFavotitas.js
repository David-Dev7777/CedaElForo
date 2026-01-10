import{pool} from '../config.js'

export const getLeyesFavoritas = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM leyes_favoritas') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getLeyesFavoritas_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM leyes_favoritas WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'lista de leyes favoritas no encontrado '})

    }
    res.json(rows)
}

export const crearLeyesFavoritas = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO leyes_favoritas (usuario_id, ley_id, created_at) VALUES ($1, $2, $3) RETURNING *', 
        [ data.usuario_id, data.ley_id, data.created_at])
    res.status(201).json({
        message:'ley agregada exitosamente',
        ley:rows[0]})
    
}

export const eliminarleyesFavoritas = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM leyes_favoritas WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'ley no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarLeyesFavoritas = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE leyes_favoritas SET usuario_id=$2, ley_id=$3, created_at=$4 WHERE id=$1  RETURNING *',
         [id, data.usuario_id, data.ley_id, data.created_at])
       
    return res.json({
        message:'ley favorita  actualizada',
        ley:rows[0]})
    

}