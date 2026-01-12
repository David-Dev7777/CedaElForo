function PoliticaPrivacidad() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          Política de Privacidad
        </h1>

        <p className="mb-4 text-sm text-gray-500 text-center">
          Última actualización: {new Date().toLocaleDateString()}
        </p>

        <p className="mb-6">
          En <strong>Ceda el Foro</strong>, valoramos y respetamos la privacidad de
          nuestros usuarios. Esta Política de Privacidad describe cómo
          recopilamos, utilizamos y protegemos los datos personales
          proporcionados a través de nuestra plataforma web.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Información que recopilamos
        </h2>

        <p className="mb-2">
          La plataforma puede recopilar los siguientes datos personales:
        </p>

        <ul className="list-disc list-inside mb-4">
          <li>Nombre o alias de usuario</li>
          <li>Correo electrónico</li>
          <li>Contraseña (almacenada de forma cifrada)</li>
          <li>Contenido publicado por el usuario (preguntas, comentarios o experiencias)</li>
        </ul>

        <p className="mb-6">
          No se recopilan datos sensibles adicionales ni información innecesaria
          para el funcionamiento del sistema.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Uso de la información
        </h2>

        <p className="mb-2">
          Los datos recopilados se utilizan exclusivamente para:
        </p>

        <ul className="list-disc list-inside mb-4">
          <li>Permitir el acceso y uso de la plataforma</li>
          <li>Gestionar cuentas de usuario y autenticación</li>
          <li>Moderar y administrar el contenido publicado</li>
          <li>Mejorar la experiencia de uso y el funcionamiento del sistema</li>
        </ul>

        <p className="mb-6 font-semibold">
          La información no será vendida, cedida ni compartida con terceros,
          salvo obligación legal.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Protección de los datos
        </h2>

        <p className="mb-2">
          Ceda el Foro implementa medidas técnicas y organizativas razonables para
          proteger los datos personales, tales como:
        </p>

        <ul className="list-disc list-inside mb-6">
          <li>Cifrado de contraseñas</li>
          <li>Uso de conexiones seguras (HTTPS)</li>
          <li>Control de accesos y permisos</li>
          <li>Buenas prácticas de desarrollo seguro</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Cumplimiento legal
        </h2>

        <p className="mb-6">
          El tratamiento de los datos personales se realiza conforme a la{" "}
          <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong>,
          vigente en la República de Chile.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Derechos del usuario
        </h2>

        <p className="mb-2">
          El usuario puede solicitar:
        </p>

        <ul className="list-disc list-inside mb-6">
          <li>Acceso a sus datos personales</li>
          <li>Modificación o eliminación de su cuenta</li>
          <li>Eliminación de contenido propio</li>
        </ul>

        <p className="mb-6">
          Estas solicitudes pueden realizarse a través de los medios de contacto
          definidos en la plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          6. Cambios a esta política
        </h2>

        <p>
          Ceda el Foro se reserva el derecho de modificar esta Política de
          Privacidad cuando sea necesario. Cualquier cambio será informado
          oportunamente dentro de la plataforma.
        </p>
      </div>
    </>
  );
}

export default PoliticaPrivacidad;
