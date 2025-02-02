import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { Footer } from "./components/Footer.jsx";
import { Heading } from "./components/Heading.jsx";
import Sidebar from "./components/SideBar.jsx";

function App() {
  return (
    <>
      <Heading />
      <div className="main">
        <CommunitiesList />
        <Sidebar />
      </div>

      <Footer />
    </>
  );
}

export default App;
