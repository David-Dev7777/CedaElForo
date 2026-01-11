import{pool} from '../config.js' 

export const getCategoriasLeyes = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM categorias_leyes') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getCategoriasLeyes_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM categorias_leyes WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'categoria no encontrado '})

    }
    res.json(rows)
}

export const crearCategoriasLeyes = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO categorias_leyes (nombre, descripcion, color, activa, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
        [ data.nombre, data.descripcion, data.color, data.activa, data.created_at])
    res.status(201).json({
        message:'categoria agregada exitosamente',
        categoria:rows[0]})
    
}

export const eliminarCategoriasLeyes = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM categorias_leyes WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'categoria no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarCategoriasLeyes = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE categorias_leyes SET nombre=$2, descripcion=$3, color=$4, activa=$5, created_at=$6 WHERE id=$1  RETURNING *',
         [id, data.nombre, data.descripcion, data.color, data.activa, data.created_at])
       
    return res.json({
        message:'categoria actualizada',
        categoria:rows[0]})
    

}