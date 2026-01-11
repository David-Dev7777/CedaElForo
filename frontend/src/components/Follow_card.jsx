import { useState } from "react";

export function Follow_card({ userName, name }) {
  const [isFollowing, setIsFollowing] = useState(false);// el useState devuelve un array con dos valores
  //const isFollowing = estado[0];// valor
  //const setIsFollowing = estado[1];// funcion para actualizar el valor

  const handleClick = () => {// funcion que se ejecuta al hacer click
    setIsFollowing(!isFollowing);
  }

  const texto = isFollowing ? 'Siguiendo' : 'Seguir';
  const clase = isFollowing ? 'follow-card-button is-following' : 'follow-card-button';
  // selector de clase
  const imgAvatar = `https://unavatar.io/${userName}`;

  return (
  
    <article  className='follow-card'>
      <header className='follow-card-header'>
        <img className='follow-card-img' src={imgAvatar} alt={name} />
        <div className='follow-card-info'>
          <strong>{name}</strong>
        </div>
        <span className='follow-card-usuario'>@{userName}</span>
      </header>

      <aside>
        <button className={clase} onClick={handleClick}>
          {texto}
        </button>
      </aside>
    </article>
  );
}