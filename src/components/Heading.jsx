// import { useNumberOfCommunities } from "../stores/community.store";
// import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store";

// export function Heading() {
//   const { toggleSidebar } = useSidebarActions();
//   const isVisible = useSideBarVisible();

//   const numberOFCommunities = useNumberOfCommunities(); // Estado para el numero de comunidades

//   // const isButtonVisible = window.innerWidth > 678 ? "is-active" : "is-hidden";

//   // clase para ocultar cuanto lo necesite is-hidden-desktop
//   // console.log("numero", numberOFCommunities);
//   return (
//     <div>
//       <div>
//         <h2 className="title is-3">Lista de comunidades</h2>
//         {/* Botón para desplegar el sidebar */}
//         <button className={`button is-primary  mb-2 `} onClick={toggleSidebar}>
//           <i
//             className={
//               isVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-filter"
//             }
//           ></i>
//           &nbsp;
//           {isVisible ? "Ocultar filtros" : "Filtrar"}
//         </button>
//       </div>
//       <div>Resultados: {numberOFCommunities} comunidades</div>
//     </div>
//   );
// }

import { useNumberOfCommunities, useNumberOFOnSiteCommunities } from "../stores/community.store";
import { useSidebarActions, useSideBarVisible } from "../stores/sidebar.store";
import { ViewToggleButton } from "./ViewToggleButton.jsx"; // 👈 Import the button

export function Heading ({ view, toggleView }) {
  const { toggleSidebar } = useSidebarActions();
  const isVisible = useSideBarVisible();

  const numberOFCommunities = useNumberOfCommunities();
  const numberOFOnSiteCommunities = useNumberOFOnSiteCommunities();
  return (
    <div>
      <div id="title" className="is-flex-tablet is-align-items-center sticky">
        <h2 className="title is-3 mr-4">Comunidades Tech</h2>

        {/* Botón para desplegar el sidebar */}
        <button className="button is-primary mr-2" onClick={toggleSidebar}>
          <i
            className={
              isVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-filter"
            }
          ></i>
          &nbsp;
          {isVisible ? "Ocultar filtros" : "Filtrar"}
        </button>

        {/* Botón para cambiar vista */}
        <ViewToggleButton view={view} toggleView={toggleView} />
        <div style={{ padding: '10px' }}>
          Mostrando:&nbsp;
          {view === "map" ? `${numberOFOnSiteCommunities} comunidades presenciales e híbridas` : `${numberOFCommunities} comunidades`} 
        </div>
      </div>
    </div>
  );
}

