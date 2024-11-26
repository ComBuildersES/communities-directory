import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { Heading } from "./components/Heading.jsx";
import Sidebar from "./components/SideBar.jsx";

function App() {
  return (
    <>
      <div className="main">
        <Heading />
        <CommunitiesList />
      </div>

      <Sidebar />
    </>
  );
}

export default App;
