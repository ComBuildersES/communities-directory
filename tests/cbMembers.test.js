import { describe, expect, it } from "vitest";
import {
  buildCbMemberIndex,
  filterMemberSuggestions,
  memberHandlesForCommunity,
  parseMemberQuery,
} from "../src/lib/cbMembers.js";
import {
  buildDirectoryStatePath,
  parseDirectoryFilters,
} from "../src/lib/communitySubmission.js";
import { buildInverseIndex } from "../src/data/invertedindex.js";
import { searchFaceted } from "../src/data/searchFaceted.js";

const MEMBERS = [
  { github: "hhkaos", communityId: 1 },
  { github: "hhkaos", communityId: 2 },
  { github: "HHKaos", communityId: 3 },
  { github: "mtnieto", communityId: 2 },
  { github: "ghost", communityId: 99 }, // comunidad que no está en el dataset
];

const COMMUNITIES = [
  { id: 1, name: "Uno", status: "active" },
  { id: 2, name: "Dos", status: "active" },
  { id: 3, name: "Tres", status: "inactive" },
];

describe("parseMemberQuery", () => {
  it("trata '@' solo como mención sin término: hay que poder ver la lista sin saber handles", () => {
    expect(parseMemberQuery("@")).toEqual({ isMemberQuery: true, term: "" });
  });

  it("normaliza el handle a minúsculas", () => {
    expect(parseMemberQuery("@HHKaos")).toEqual({ isMemberQuery: true, term: "hhkaos" });
  });

  it("no considera mención una búsqueda normal", () => {
    expect(parseMemberQuery("javascript").isMemberQuery).toBe(false);
  });
});

describe("buildCbMemberIndex", () => {
  const { cbMemberIds, cbMembersMap, cbMemberHandles } = buildCbMemberIndex(MEMBERS, COMMUNITIES);

  it("agrupa los handles por comunidad", () => {
    expect(cbMembersMap.get(2)).toEqual(["hhkaos", "mtnieto"]);
    expect(cbMemberIds.has(1)).toBe(true);
  });

  it("cuenta el mismo handle escrito con distinta caja una sola vez", () => {
    const hhkaos = cbMemberHandles.find((m) => m.handle === "hhkaos");
    expect(hhkaos.count).toBe(3);
  });

  it("ignora asignaciones a comunidades que no están en el dataset", () => {
    expect(cbMemberHandles.some((m) => m.handle === "ghost")).toBe(false);
  });

  it("ordena por número de comunidades", () => {
    expect(cbMemberHandles[0].handle).toBe("hhkaos");
  });
});

describe("filterMemberSuggestions", () => {
  const { cbMemberHandles } = buildCbMemberIndex(MEMBERS, COMMUNITIES);

  it("sin término devuelve a todo el mundo", () => {
    expect(filterMemberSuggestions("", cbMemberHandles, [])).toHaveLength(2);
  });

  it("excluye a quien ya está filtrado", () => {
    const result = filterMemberSuggestions("", cbMemberHandles, ["HHKaos"]);
    expect(result.map((m) => m.handle)).toEqual(["mtnieto"]);
  });

  it("filtra por subcadena", () => {
    expect(filterMemberSuggestions("nie", cbMemberHandles, []).map((m) => m.handle)).toEqual(["mtnieto"]);
  });
});

describe("filtro cbMembers de punta a punta", () => {
  const { cbMembersMap } = buildCbMemberIndex(MEMBERS, COMMUNITIES);
  const data = COMMUNITIES.map((c) => ({
    ...c,
    cbMembers: memberHandlesForCommunity(cbMembersMap, c.id),
  }));
  const index = buildInverseIndex(data);

  it("devuelve las comunidades de esa persona", () => {
    const result = searchFaceted(data, index, { cbMembers: ["hhkaos"] });
    expect(result.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it("se cruza con los demás filtros", () => {
    const result = searchFaceted(data, index, { cbMembers: ["hhkaos"], status: ["active"] });
    expect(result.map((c) => c.id)).toEqual([1, 2]);
  });

  it("el handle filtra sin importar la caja con la que se escribió", () => {
    const result = searchFaceted(data, index, { cbMembers: ["HHKaos"] });
    expect(result.map((c) => c.id)).toEqual([1, 2, 3]);
  });
});

describe("cbMembers en la URL", () => {
  it("se serializa con la clave corta cb", () => {
    const path = buildDirectoryStatePath({
      pathname: "/es/",
      filters: { status: ["active"], cbMembers: ["hhkaos"] },
    });

    expect(path).toBe("/es/?cb=hhkaos");
  });

  it("se recupera al abrir el enlace compartido", () => {
    expect(parseDirectoryFilters("?cb=hhkaos")).toEqual({ cbMembers: ["hhkaos"] });
  });
});
