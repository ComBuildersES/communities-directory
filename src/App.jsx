import { useEffect, useState } from "react";
import { useCommunityActions } from "./stores/community.store";
import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { CommunityContribution } from "./components/CommunityContribution/CommunityContribution.jsx";
import { Footer } from "./components/Footer.jsx";
import { Heading } from "./components/Heading.jsx";
import Map from "./components/Map/Map.jsx";
import { TagSearch } from "./components/TagSearch/TagSearch.jsx";
import { ResultsBar } from "./components/ResultsBar.jsx";
import { FilterPanel } from "./components/FilterPanel.jsx";
import {
  buildContributionPath,
  parseContributionRoute,
  resolveCommunityFromIdentifier,
} from "./lib/communitySubmission";
import {
  useAllCommunities,
  useAudience,
  useIsLoading,
  useTags,
} from "./stores/community.store.js";

function App () {
  const [view, setView] = useState("list");
  const [route, setRoute] = useState(() => parseContributionRoute());
  const { fetchCommunities } = useCommunityActions();
  const communities = useAllCommunities();
  const allTags = useTags();
  const allAudience = useAudience();
  const isLoading = useIsLoading();

  useEffect(() => {
    fetchCommunities(); // Only fetch once on initial load
  }, [fetchCommunities]);

  useEffect(() => {
    const handlePopState = () => setRoute(parseContributionRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const toggleView = () => {
    setView((prev) => (prev === "map" ? "list" : "map"));
  };

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setRoute(parseContributionRoute());
  };

  const closeContributionForm = () => {
    navigateTo(buildContributionPath({ mode: "directory" }));
  };

  const communityToEdit = route.mode === "edit"
    ? resolveCommunityFromIdentifier(communities, route.identifier)
    : null;
  const showContributionView = route.mode !== "directory";

  return (
    <>
      <Heading
        view={view}
        toggleView={toggleView}
        isContributionView={showContributionView}
        closeContributionForm={closeContributionForm}
      />
      {!showContributionView && <TagSearch />}
      {!showContributionView && <ResultsBar view={view} />}
      {!showContributionView && <FilterPanel />}
      <div className="main">
        {showContributionView && !isLoading && (
          <CommunityContribution
            communities={communities}
            allTags={allTags}
            allAudience={allAudience}
            existingCommunity={communityToEdit}
          />
        )}
        {showContributionView && isLoading && <p className="contribution-loading">Cargando formulario...</p>}
        {showContributionView && route.mode === "edit" && !isLoading && !communityToEdit && (
          <section className="contribution-shell">
            <article className="message is-warning contribution-message">
              <div className="message-body">
                No he encontrado la comunidad que intentabas editar. Puedes volver al directorio o abrir el formulario vacío para crear una nueva.
              </div>
            </article>
          </section>
        )}
        {!showContributionView && view === "list" && <CommunitiesList />}
        {!showContributionView && view === "map" && <Map />}
      </div>
      <Footer />
    </>
  );
}

export default App;
