
import {
  useIsLoading,
} from "../../stores/community.store.js";

import "./AddCommunityCTA.css";

export function AddCommunityCTA () {
  const isLoading = useIsLoading();

  if (isLoading) return <></>;

  return (
    <div className="add-community-cta">
      <h1 className="title">¿Hechas en falta alguna comunidad?</h1>
      <p className="subtitle is-5">Si conoces alguna que aún no aparece, puedes añadirla fácilmente. ¡Este directorio lo construimos entre todos!</p>
      <a className="button is-primary" href="https://github.com/ComBuildersES/communities-directory/issues/new?template=community_entry.yml" target="_blank">Añadir al directorio</a>
    </div>
  );
}
