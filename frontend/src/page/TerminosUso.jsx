function TerminosUso() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          Términos de Uso
        </h1>

        <p className="mb-4 text-sm text-gray-500 text-center">
          Última actualización: {new Date().toLocaleDateString()}
        </p>

        <p className="mb-6">
          El uso de la plataforma <strong>Ceda el Foro</strong> implica la aceptación de
          los siguientes Términos de Servicio. Si no estás de acuerdo con
          ellos, te recomendamos no utilizar el sistema.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Naturaleza del servicio
        </h2>

        <p className="mb-4">
          Ceda el Foro es un <strong>software web de carácter 
          educativo e informativo</strong>, orientado a facilitar el
          acceso a normativa de tránsito chilena y a promover la 
          educación vial mediante la participación de la comunidad.
        </p>

        <p className="b-6">
          La información publicada <strong>NO constituye asesoría legal 
          profesional y NO reemplaza</strong> a los canales oficiales ni 
          a un abogado calificado.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Uso adecuado de la plataforma
        </h2>

        <p className="mb-2">
          El usuario se compromete a:
        </p>

        <ul className="list-disc list-inside mb-4">
          <li>Utilizar la plataforma de forma respetuosa y responsable</li>
          <li>No publicar contenido falso, ofensivo, ilegal o engañoso</li>
          <li>No suplantar identidades ni vulnerar derechos de terceros</li>
        </ul>

        <p className="b-6">
          El incumplimiento de estas normas podrá derivar en la 
          suspensión o eliminación de la cuenta.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Contenido generado por usuarios
        </h2>

        <p className="mb-2">
          Los usuarios pueden publicar preguntas, comentarios o 
          experiencias personales.
        </p>

        <p className="mb-2">
          Este contenido:
        </p>

        <ul className="list-disc list-inside mb-4">
          <li>Es responsabilidad exclusiva del usuario que lo publica</li>
          <li>Puede ser moderado, editado o eliminado por el equipo de Ceda el Foro</li>
          <li>No representa necesariamente la opinión del proyecto ni de sus administradores</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Fuentes de información legal
        </h2>

        <p className="mb-2">
          La plataforma puede integrar información proveniente de fuentes
          oficiales, como la Biblioteca del Congreso Nacional de Chile
          (BCN), con fines <strong>informativos y educativos.</strong>
        </p>


        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Limitación de responsabilidad
        </h2>

        <p className="mb-2">
          Ceda el Foro no se hace responsable por:
        </p>

        <ul className="list-disc list-inside mb-4">
          <li>Interpretaciones incorrectas de la información publicada</li>
          <li>Decisiones tomadas por los usuarios en base al contenido del sitio</li>
          <li>Daños derivados del uso o imposibilidad de uso de la plataforma</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          6. Disponibilidad del servicio
        </h2>

        <p className="mb-2">
          El sistema puede experimentar interrupciones temporales por
          mantenimiento, actualizaciones o fallos técnicos, sin que ello
          genere responsabilidad para el proyecto.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          7. Modificaciones del servicio
        </h2>

        <p className="mb-2">
          Ceda el Foro se reserva el derecho de modificar estos Términos
          de Servicio en cualquier momento.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          8. Aceptación de los términos
        </h2>

        <p className="mb-2">
          El uso de la plataforma <strong>Ceda el Foro</strong> implica 
          la aceptación expresa de estos Términos y Condiciones de
          Servicio.
        </p>

      </div>
    </>
  );
}

export default TerminosUso;
