import{pool} from '../config.js'

export const getPerfiles = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM perfiles_ciudadano') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getPerfil = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM perfiles_ciudadano WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'perfil no encontrado '})

    }
    res.json(rows)
}

export const crearPerfil = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO perfiles_ciudadano (id, usuario_id, dni, telefono, direccion, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
        [data.id, data.usuario_id, data.dni, data.telefono, data.direccion, data.fecha_nacimiento])
    res.status(201).json({
        message:'perfil creado exitosamente',
        usuario:rows[0]})
    
}

export const eliminarPerfil = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM perfiles_ciudadano WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'perfil no encontrado'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarPerfil = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE perfiles_ciudadano SET usuario_id=$2, dni=$3, telefono=$4, direccion=$5, fecha_nacimiento=$6 WHERE id=$1  RETURNING *',
         [id, data.usuario_id, data.dni, data.telefono, data.direccion, data.fecha_nacimiento])
       
    return res.json({
        message:'perfil actualizado',
        usuario:rows[0]})
    

}