import { useEffect, useMemo, useRef, useState } from "react";
import { useCommunityActions } from "./stores/community.store";
import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { CommunityContribution } from "./components/CommunityContribution/CommunityContribution.jsx";
import { CommunityModal } from "./components/CommunityModal/CommunityModal.jsx";
import { Footer } from "./components/Footer.jsx";
import { Heading } from "./components/Heading.jsx";
import { InstallPromptBar } from "./components/InstallPromptBar.jsx";
import Map from "./components/Map/Map.jsx";
import { TagSearch } from "./components/TagSearch/TagSearch.jsx";
import { ResultsBar } from "./components/ResultsBar.jsx";
import { FilterPanel } from "./components/FilterPanel.jsx";
import {
  buildContributionPath,
  parseContributionRoute,
  parseSelectedCommunityIdentifier,
  resolveCommunityFromIdentifier,
  buildDirectoryStatePath,
} from "./lib/communitySubmission";
import {
  useAllCommunities,
  useAudience,
  useFilters,
  useIsLoading,
  useTags,
  useCBMembersMap,
} from "./stores/community.store.js";

function App () {
  const [view, setView] = useState("list");
  const [route, setRoute] = useState(() => parseContributionRoute());
  const [selectedCommunityIdentifier, setSelectedCommunityIdentifier] = useState(() => parseSelectedCommunityIdentifier());
  const [contributionState, setContributionState] = useState({
    isDirty: false,
    issueOpened: false,
  });
  const [draftActions, setDraftActions] = useState({
    saveDraft: null,
    clearDraft: null,
  });
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const { fetchCommunities } = useCommunityActions();
  const communities = useAllCommunities();
  const allTags = useTags();
  const allAudience = useAudience();
  const filters = useFilters();
  const isLoading = useIsLoading();
  const cbMembersMap = useCBMembersMap();
  const routeRef = useRef(route);
  const contributionStateRef = useRef(contributionState);

  const tagsMap = useMemo(
    () => Object.fromEntries(allTags.map((tag) => [tag.id, tag.label])),
    [allTags]
  );

  const audienceMap = useMemo(
    () => Object.fromEntries(allAudience.map((audience) => [audience.id, audience.label])),
    [allAudience]
  );

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    contributionStateRef.current = contributionState;
  }, [contributionState]);

  useEffect(() => {
    fetchCommunities(); // Only fetch once on initial load
  }, [fetchCommunities]);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = parseContributionRoute();
      const currentRoute = routeRef.current;
      const isLeavingContribution = currentRoute.mode !== "directory" && (
        nextRoute.mode !== currentRoute.mode ||
        nextRoute.identifier !== currentRoute.identifier
      );
      const shouldBlockNavigation = isLeavingContribution &&
        contributionStateRef.current.isDirty &&
        !contributionStateRef.current.issueOpened;

      if (shouldBlockNavigation) {
        window.history.pushState({}, "", buildContributionPath({
          mode: currentRoute.mode,
          identifier: currentRoute.identifier,
        }));
        setPendingNavigation({
          path: buildContributionPath({
            mode: nextRoute.mode,
            identifier: nextRoute.identifier,
          }),
        });
        return;
      }

      setRoute(nextRoute);
      setSelectedCommunityIdentifier(parseSelectedCommunityIdentifier());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const toggleView = () => {
    setView((prev) => (prev === "map" ? "list" : "map"));
  };

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setRoute(parseContributionRoute());
    setSelectedCommunityIdentifier(parseSelectedCommunityIdentifier());
  };

  const navigateWithGuard = (path, options = {}) => {
    const shouldBlockNavigation = route.mode !== "directory" &&
      contributionState.isDirty &&
      !contributionState.issueOpened;

    if (shouldBlockNavigation) {
      setPendingNavigation({ path, options });
      return;
    }

    if (route.mode !== "directory") {
      draftActions.clearDraft?.();
    }

    if (options.resetView) {
      setView("list");
    }

    navigateTo(path);
  };

  const closeContributionForm = () => {
    navigateWithGuard(buildContributionPath({ mode: "directory" }));
  };

  const goToHome = () => {
    navigateWithGuard(buildContributionPath({ mode: "directory" }), { resetView: true });
  };

  const continuePendingNavigation = ({ saveDraft } = {}) => {
    if (!pendingNavigation?.path) return;

    if (saveDraft) {
      draftActions.saveDraft?.();
    } else {
      draftActions.clearDraft?.();
    }

    const targetPath = pendingNavigation.path;
    const targetOptions = pendingNavigation.options ?? {};
    setPendingNavigation(null);
    if (targetOptions.resetView) {
      setView("list");
    }
    navigateTo(targetPath);
  };

  const communityToEdit = route.mode === "edit"
    ? resolveCommunityFromIdentifier(communities, route.identifier)
    : null;
  const selectedCommunity = route.mode === "directory"
    ? resolveCommunityFromIdentifier(communities, selectedCommunityIdentifier)
    : null;
  const showContributionView = route.mode !== "directory";

  const openCommunityModal = (communityId) => {
    const path = buildDirectoryStatePath({ filters, communityIdentifier: communityId });
    window.history.pushState({}, "", path);
    setSelectedCommunityIdentifier(String(communityId));
  };

  const closeCommunityModal = () => {
    const path = buildDirectoryStatePath({ filters });
    window.history.pushState({}, "", path);
    setSelectedCommunityIdentifier(null);
  };

  useEffect(() => {
    if (showContributionView) return;

    setContributionState({
      isDirty: false,
      issueOpened: false,
    });
    setDraftActions({
      saveDraft: null,
      clearDraft: null,
    });
    setPendingNavigation(null);
  }, [showContributionView]);

  return (
    <>
      {!showContributionView && <InstallPromptBar />}
      <Heading
        view={view}
        toggleView={toggleView}
        isContributionView={showContributionView}
        closeContributionForm={closeContributionForm}
        goToHome={goToHome}
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
            proposalDraft={route.proposalDraft}
            onDirtyChange={(isDirty) => setContributionState((current) => ({ ...current, isDirty }))}
            onIssueOpenedChange={(issueOpened) => setContributionState((current) => ({ ...current, issueOpened }))}
            onDraftActionsChange={setDraftActions}
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
        {!showContributionView && view === "list" && <CommunitiesList onOpenCommunity={openCommunityModal} />}
        {!showContributionView && view === "map" && <Map showListView={() => setView("list")} />}
      </div>
      {pendingNavigation && (
        <div className="navigation-guard-overlay">
          <div className="navigation-guard-modal" role="dialog" aria-modal="true" aria-label="Cambios sin guardar">
            <h3>Hay cambios sin guardar</h3>
            <p>
              Si sales ahora perderás lo que has escrito en el formulario. Puedes seguir editando,
              guardar un borrador local en este navegador o salir sin guardarlo.
            </p>
            <div className="navigation-guard-actions">
              <button type="button" className="button is-light" onClick={() => setPendingNavigation(null)}>
                Seguir editando
              </button>
              <button
                type="button"
                className="button is-warning is-light"
                onClick={() => continuePendingNavigation({ saveDraft: true })}
              >
                Guardar borrador y salir
              </button>
              <button
                type="button"
                className="button is-danger"
                onClick={() => continuePendingNavigation({ saveDraft: false })}
              >
                Salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
      {!showContributionView && selectedCommunity && (
        <CommunityModal
          community={selectedCommunity}
          tagsMap={tagsMap}
          audienceMap={audienceMap}
          cbHandles={cbMembersMap.get(selectedCommunity.id) || []}
          onClose={closeCommunityModal}
        />
      )}
      <Footer />
    </>
  );
}

export default App;
