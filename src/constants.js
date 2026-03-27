// export const URL =
//   "https://opensheet.elk.sh/18Rf0-3sREFosw__tQYaUmtzJNL3M-PLsm-HIqENf2Yw/Comunidades";
// export const URL = "data/communities.json";
export const URL = `${import.meta.env.BASE_URL}data/communities.json`;

export const TAG_TYPES = {
  default: "is-white",
  "tech-meetup": "is-warning",
  "conference": "is-link",
  "collaborative-group": "is-info",
  "umbrella-org": "is-success",
  "mutual-aid": "is-info is-light",
  "hacklab": "is-danger",
  "Escuela de formación": "is-link is-light",
  Podcast: "is-danger is-light",
  Fundación: "is-success is-light",
  Medio: "is-warning is-light",
};

export const TAG_EVENTS = {
  unknown: "is-white",
  "in-person": "is-warning",
  online: "is-link",
  hybrid: "is-info",
};

export const bajaString = "BAJA";
