import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CommunitiesList } from "./components/CommunitiesList.jsx";
import { CommunityContribution } from "./components/CommunityContribution/CommunityContribution.jsx";
import { Footer } from "./components/Footer.jsx";
import { Heading } from "./components/Heading.jsx";
import { InstallPromptBar } from "./components/InstallPromptBar.jsx";
import Map from "./components/Map/Map.jsx";
import { TagSearch } from "./components/TagSearch/TagSearch.jsx";
import { ResultsBar } from "./components/ResultsBar.jsx";
import { FilterPanel } from "./components/FilterPanel.jsx";
import { ParentFilterBanner } from "./components/ParentFilterBanner.jsx";
import {
  buildContributionPath,
  parseContributionRoute,
  parseSelectedCommunityIdentifier,
  parseMapState,
  resolveCommunityFromIdentifier,
  buildDirectoryStatePath,
} from "./lib/communitySubmission";
import {
  useAllCommunities,
  useAudience,
  useCommunityActions,
  useFreshnessError,
  useFilters,
  useHasFreshData,
  useIsLoading,
  useIsRefreshingFreshData,
  useTags,
  useCBMembersMap,
  useChildrenByParentId,
} from "./stores/community.store.js";

const CommunityModal = lazy(() =>
  import("./components/CommunityModal/CommunityModal.jsx").then((m) => ({ default: m.CommunityModal }))
);

function dismissActiveInput() {
  if (typeof document === "undefined") return;

  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) return;

  if (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  ) {
    activeElement.blur();
  }
}

function App () {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "map" ? "map" : "list";
  });
  const [mapFocusTarget, setMapFocusTarget] = useState(null);
  const [route, setRoute] = useState(() => parseContributionRoute());
  const [selectedCommunityIdentifier, setSelectedCommunityIdentifier] = useState(() => parseSelectedCommunityIdentifier());
  const [mapState, setMapState] = useState(() => parseMapState());
  const [contributionState, setContributionState] = useState({
    isDirty: false,
    issueOpened: false,
  });
  const [draftActions, setDraftActions] = useState({
    saveDraft: null,
    clearDraft: null,
  });
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const { fetchCommunities } = useCommunityActions();
  const communities = useAllCommunities();
  const allTags = useTags();
  const allAudience = useAudience();
  const filters = useFilters();
  const isLoading = useIsLoading();
  const cbMembersMap = useCBMembersMap();
  const childrenByParentId = useChildrenByParentId();
  const hasFreshData = useHasFreshData();
  const isRefreshingFreshData = useIsRefreshingFreshData();
  const freshnessError = useFreshnessError();
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
    fetchCommunities({ locale: i18n.resolvedLanguage });
  }, [fetchCommunities, i18n.resolvedLanguage]);

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || "es";
  }, [i18n.resolvedLanguage]);

  useEffect(() => {
    const syncOnlineStatus = () => setIsOnline(navigator.onLine);
    const refreshFreshData = () => {
      if (routeRef.current.mode === "edit") return;
      if (!navigator.onLine) return;
      fetchCommunities({ preserveData: true, locale: i18n.resolvedLanguage });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshFreshData();
      }
    };

    window.addEventListener("online", syncOnlineStatus);
    window.addEventListener("online", refreshFreshData);
    window.addEventListener("offline", syncOnlineStatus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", syncOnlineStatus);
      window.removeEventListener("online", refreshFreshData);
      window.removeEventListener("offline", syncOnlineStatus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
      setView(new URLSearchParams(window.location.search).get("view") === "map" ? "map" : "list");
      setMapState(parseMapState());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const toggleView = () => {
    setMapFocusTarget(null);
    setView((prev) => (prev === "map" ? "list" : "map"));
  };

  const goToMapLocation = (latLon) => {
    closeCommunityModal();
    setMapFocusTarget(latLon);
    setView("map");
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

  const goToContribution = () => {
    navigateWithGuard(buildContributionPath({ mode: "new" }));
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
  const shouldBlockCommunityDetails = isOnline && (isRefreshingFreshData || !hasFreshData);
  const shouldBlockCommunityEdit = route.mode === "edit" && shouldBlockCommunityDetails;

  const openCommunityModal = (communityId) => {
    dismissActiveInput();
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

  useEffect(() => {
    if (!selectedCommunity) return;

    dismissActiveInput();
  }, [selectedCommunity]);

  useEffect(() => {
    if (showContributionView) return;
    if (communities.length === 0) return;
    const path = buildDirectoryStatePath({
      filters,
      communityIdentifier: selectedCommunityIdentifier,
    });
    const extraParams = [];
    if (view === "map") {
      extraParams.push("view=map");
      if (mapState?.lat != null && mapState?.lon != null && mapState?.zoom != null) {
        const lat = Number(mapState.lat).toFixed(2);
        const lon = Number(mapState.lon).toFixed(2);
        const zoom = Math.round(mapState.zoom);
        extraParams.push(`m=${lat},${lon},${zoom}`);
      }
    }
    const sep = path.includes("?") ? "&" : "?";
    const fullPath = extraParams.length > 0 ? `${path}${sep}${extraParams.join("&")}` : path;
    window.history.replaceState({}, "", fullPath);
  }, [filters, view, selectedCommunityIdentifier, showContributionView, communities, mapState]);

  return (
    <>
      {!showContributionView && <InstallPromptBar />}
      <Heading
        isContributionView={showContributionView}
        closeContributionForm={closeContributionForm}
        goToHome={goToHome}
        goToContribution={goToContribution}
      />
      {!showContributionView && <TagSearch />}
      {!showContributionView && <ResultsBar view={view} toggleView={toggleView} />}
      {!showContributionView && <FilterPanel />}
      {!showContributionView && <ParentFilterBanner />}
      {!showContributionView && shouldBlockCommunityDetails && communities.length > 0 && (
        <section className="contribution-shell">
          <article className="message is-info contribution-message">
            <div className="message-body">
              {isRefreshingFreshData
                ? t("app.checkingFreshData")
                : freshnessError}
            </div>
          </article>
        </section>
      )}
      <div className="main">
        {showContributionView && !isLoading && !shouldBlockCommunityEdit && (
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
        {showContributionView && (isLoading || shouldBlockCommunityEdit) && (
          <p className="contribution-loading">
            {shouldBlockCommunityEdit
              ? t("app.syncingBeforeEdit")
              : t("app.loadingForm")}
          </p>
        )}
        {showContributionView && route.mode === "edit" && !isLoading && !shouldBlockCommunityEdit && !communityToEdit && (
          <section className="contribution-shell">
            <article className="message is-warning contribution-message">
              <div className="message-body">
                {t("app.communityNotFound")}
              </div>
            </article>
          </section>
        )}
        {!showContributionView && view === "list" && <CommunitiesList onOpenCommunity={openCommunityModal} />}
        {!showContributionView && view === "map" && <Map showListView={() => setView("list")} onOpenCommunity={openCommunityModal} initialFocus={mapFocusTarget} initialMapState={mapState} onMapStateChange={setMapState} />}
      </div>
      {pendingNavigation && (
        <div className="navigation-guard-overlay">
          <div className="navigation-guard-modal" role="dialog" aria-modal="true" aria-label={t("app.unsavedChanges")}>
            <h3>{t("app.unsavedChanges")}</h3>
            <p>{t("app.unsavedChangesBody")}</p>
            <div className="navigation-guard-actions">
              <button type="button" className="button is-light" onClick={() => setPendingNavigation(null)}>
                {t("app.keepEditing")}
              </button>
              <button
                type="button"
                className="button is-warning is-light"
                onClick={() => continuePendingNavigation({ saveDraft: true })}
              >
                {t("app.saveDraftAndExit")}
              </button>
              <button
                type="button"
                className="button is-danger"
                onClick={() => continuePendingNavigation({ saveDraft: false })}
              >
                {t("app.exitWithoutSaving")}
              </button>
            </div>
          </div>
        </div>
      )}
      {!showContributionView && selectedCommunity && !shouldBlockCommunityDetails && (
        <Suspense fallback={null}>
          <CommunityModal
            community={selectedCommunity}
            tagsMap={tagsMap}
            audienceMap={audienceMap}
            cbHandles={cbMembersMap.get(selectedCommunity.id) || []}
            childCount={childrenByParentId.get(selectedCommunity.id) ?? 0}
            onClose={closeCommunityModal}
            onGoToMap={goToMapLocation}
          />
        </Suspense>
      )}
      <Footer />
    </>
  );
}

export default App;
