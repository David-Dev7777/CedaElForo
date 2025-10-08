import{pool} from '../db.js'

export const getUsuarios = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM usuarios') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getUsuario_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM usuarios WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'usuario no encontrado '})

    }
    res.json(rows)
}

export const crearUsuario = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO usuarios ( email, password_hash, nombre, apellido, tipo_usuario, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
        [data.email, data.password_hash, data.nombre, data.apellido, data.tipo_usuario, data.activo])
    res.status(201).json({
        message:'usuario creado exitosamente',
        usuario:rows[0]})
    
}

export const eliminarUsuario = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM usuarios WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'usuario no encontrado'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarUsuario = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE usuarios SET email=$2, password_hash=$3, nombre=$4, apellido=$5, tipo_usuario=$6, activo=$7 WHERE id=$1  RETURNING *',
         [id, data.email, data.password_hash, data.nombre, data.apellido, data.tipo_usuario, data.activo]
    ) 
       
    return res.json({
        message:'usuario actualizado',
        usuario:rows[0]})
    

}