import { useNumberOfCommunities } from "../stores/community.store";
import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store";

export function Heading() {
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();

  const numberOFCommunities = useNumberOfCommunities(); // Estado para el numero de comunidades

  // const isButtonVisible = window.innerWidth > 678 ? "is-active" : "is-hidden";

  // clase para ocultar cuanto lo necesite is-hidden-desktop
  console.log("numero", numberOFCommunities);
  return (
    <div>
      <div>
        <h2 className="title is-3">Lista de comunidades</h2>
        {/* Botón para desplegar el sidebar */}
        <button className={`button is-primary  mb-2 `} onClick={toggleSidebar}>
          <i
            className={
              isVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-filter"
            }
          ></i>
          &nbsp;
          {isVisible ? "Ocultar filtros" : "Filtrar"}
        </button>
      </div>
      <div>Resultados: {numberOFCommunities} comunidades</div>
    </div>
  );
}
