import{pool} from '../db.js'


export const getConfig = async(req, res) => {
    const {rows} = await pool.query('SELECT * FROM configuraciones') // constante de tipo await para obtener todos los usuarios
   
    res.json(rows);
}

 export const getConfig_id = async(req, res) => {
    const {id} = req.params //const para extraer el id
    const {rows} = await pool.query(`SELECT * FROM configuraciones WHERE id = ${id}`) // {rows} solo extraemos las filas

     if(rows.length === 0){
        return res.status(404).json({message: 'configuracion no encontrado '})

    }
    res.json(rows)
}

export const crearConfig = async(req,res) =>{
    const data = req.body
    const {rows} = await pool.query('INSERT INTO configuraciones (clave, valor, tipo, descripcion, editable) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
        [data.clave, data.valor, data.tipo, data.descripcion, data.editable])
    res.status(201).json({
        message:'configuracion creada exitosamente',
        usuario:rows[0]})
    
}

export const eliminarConfig = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM configuraciones WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'configuracion no encontrada'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarConfig = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body
    const {rows} = await pool.query('UPDATE configuraciones SET clave=$2, valor=$3, tipo=$4, descripcion=$5, editable=$6, created_at=$7, updated_at=$8 WHERE id=$1  RETURNING *',
         [id, data.clave, data.valor, data.tipo, data.descripcion, data.editable, data.created_at, data.updated_at])
       
    return res.json({
        message:'configuracion actualizada',
        usuario:rows[0]})
    

}