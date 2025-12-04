export const registro = (req, res) => {

    console.log('Datos recibidos:', req.body);
  const { userName, apellido, email, password } = req.body;

  const newUser = {
    userName,
    apellido,
    email,
    password,
  };

  res.status(201).json({
    message: 'Usuario registrado',
    user: newUser,
  });
};