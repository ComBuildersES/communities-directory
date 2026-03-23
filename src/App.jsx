import { useEffect, useState } from "react";
import { useCommunityActions } from "./stores/community.store";
import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { Footer } from "./components/Footer.jsx";
import { Heading } from "./components/Heading.jsx";
import Map from "./components/Map/Map.jsx";
import { TagSearch } from "./components/TagSearch/TagSearch.jsx";
import { ResultsBar } from "./components/ResultsBar.jsx";
import { FilterPanel } from "./components/FilterPanel.jsx";

function App () {
  const [view, setView] = useState("list");
  const { fetchCommunities } = useCommunityActions();

  useEffect(() => {
    fetchCommunities(); // Only fetch once on initial load
  }, [fetchCommunities]);

  const toggleView = () => {
    setView((prev) => (prev === "map" ? "list" : "map"));
  };

  return (
    <>
      <Heading view={view} toggleView={toggleView} />
      <TagSearch />
      <ResultsBar view={view} />
      <FilterPanel />
      <div className="main">
        {view === "list" && <CommunitiesList />}
        {view === "map" && <Map />}
      </div>
      <Footer />
    </>
  );
}

export default App;
