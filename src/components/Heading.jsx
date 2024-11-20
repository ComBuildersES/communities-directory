export function Heading() {
  const isActive = true;

  // clase para ocultar cuanto lo necesite is-hidden-desktop
  const toggleSidebar = () => console.log("pulsado boton sidebar");

  return (
    <div className="heading">
      <h2 className="title is-3">Lista de comunidades</h2>
      {/* Botón para desplegar el sidebar */}
      <button className="button is-primary  mb-2" onClick={toggleSidebar}>
        {isActive ? "Cerrar Menu" : "Abrir Menu"}
      </button>
    </div>
  );
}
