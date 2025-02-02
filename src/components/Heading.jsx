import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store";

export function Heading() {
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();

  // const isButtonVisible = window.innerWidth > 678 ? "is-active" : "is-hidden";

  // clase para ocultar cuanto lo necesite is-hidden-desktop

  return (
    <div className="heading">
      <h2 className="title is-3">Lista de comunidades</h2>
      {/* Botón para desplegar el sidebar */}
      <button className={`button is-primary  mb-2 `} onClick={toggleSidebar}>
        {isVisible ? "Cerrar" : "Abrir"}
      </button>
    </div>
  );
}
