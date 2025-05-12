import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { Footer } from "./components/Footer.jsx";
import { Heading } from "./components/Heading.jsx";
import Map from "./components/Map/Map.jsx";
import Sidebar from "./components/SideBar.jsx";

function App() {
  return (
    <>
      <Heading />
      <div className="main">
        {/* <CommunitiesList />
        <Sidebar /> */}
        <Map></Map>
      </div>

      <Footer />
    </>
  );
}

export default App;
