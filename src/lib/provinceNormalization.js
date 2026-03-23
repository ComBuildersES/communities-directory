function normalizeText(value = "") {
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const PROVINCE_ALIAS_ENTRIES = [
  ["albacete", ["Albacete"]],
  ["alicante", ["Alicante", "Alacant", "Alicante/Alacant", "Benidorm"]],
  ["almeria", ["Almería", "Almeria"]],
  ["araba", ["Araba", "Álava", "Alava", "Araba/Álava", "Araba/Alava", "Vitoria-Gasteiz"]],
  ["asturias", ["Asturias", "Principado de Asturias", "Gijón", "Gijon", "Gijón, Asturias", "Gijón, Spain", "Oviedo", "Oviedo, Asturias", "Oviedo/Gijón (Asturias)"]],
  ["avila", ["Ávila", "Avila"]],
  ["a-coruna", ["A Coruña", "A Coruna", "Coruña", "Coruna", "Coruña, A", "Coruna, A", "La Coruña", "La Coruna", "Coruña, Galicia", "Coruña (Santiago de Compostela)", "Coruña (Ferrol)", "A Coruña, España"]],
  ["badajoz", ["Badajoz"]],
  ["balears", ["Balears", "Illes Balears", "Balears, Illes", "Islas Baleares", "Mallorca", "Menorca"]],
  ["barcelona", ["Barcelona"]],
  ["bizkaia", ["Bizkaia", "Vizcaya", "Bilbao"]],
  ["burgos", ["Burgos"]],
  ["caceres", ["Cáceres", "Caceres"]],
  ["cadiz", ["Cádiz", "Cadiz"]],
  ["cantabria", ["Cantabria", "Santander"]],
  ["castellon", ["Castellón", "Castellon", "Castelló", "Castellon/Castello", "Castellón/Castelló", "Castellón de la Plana"]],
  ["ciudad-real", ["Ciudad Real"]],
  ["cordoba", ["Córdoba", "Cordoba"]],
  ["cuenca", ["Cuenca"]],
  ["gipuzkoa", ["Gipuzkoa", "Guipúzcoa", "Guipuzcoa", "San Sebastián", "Donostia"]],
  ["girona", ["Girona", "Gerona"]],
  ["granada", ["Granada"]],
  ["guadalajara", ["Guadalajara"]],
  ["huelva", ["Huelva"]],
  ["huesca", ["Huesca"]],
  ["jaen", ["Jaén", "Jaen"]],
  ["la-rioja", ["La Rioja", "Rioja, La", "Rioja La", "Logroño", "Logrono", "Logroño, La Rioja", "Logroño La Rioja"]],
  ["las-palmas", ["Las Palmas", "Palmas, Las", "Las Palmas de Gran Canaria"]],
  ["leon", ["León", "Leon", "Ponferrada"]],
  ["lleida", ["Lleida", "Lérida", "Lerida"]],
  ["lugo", ["Lugo"]],
  ["madrid", ["Madrid", "Comunidad de Madrid"]],
  ["malaga", ["Málaga", "Malaga"]],
  ["murcia", ["Murcia", "Región de Murcia", "Region de Murcia"]],
  ["navarra", ["Navarra", "Navarre", "Comunidad Foral de Navarra", "Pamplona"]],
  ["ourense", ["Ourense", "Orense"]],
  ["palencia", ["Palencia"]],
  ["pontevedra", ["Pontevedra", "Vigo", "Vigo, Galicia"]],
  ["salamanca", ["Salamanca"]],
  ["santa-cruz-de-tenerife", ["Santa Cruz de Tenerife", "Tenerife"]],
  ["segovia", ["Segovia"]],
  ["sevilla", ["Sevilla"]],
  ["soria", ["Soria"]],
  ["tarragona", ["Tarragona"]],
  ["teruel", ["Teruel"]],
  ["toledo", ["Toledo"]],
  ["valencia", ["Valencia", "València", "Valencia/València"]],
  ["valladolid", ["Valladolid"]],
  ["zamora", ["Zamora"]],
  ["zaragoza", ["Zaragoza"]],
  ["ceuta", ["Ceuta"]],
  ["melilla", ["Melilla"]],
];

const NORMALIZED_ALIAS_TO_PROVINCE = new Map();

for (const [provinceId, aliases] of PROVINCE_ALIAS_ENTRIES) {
  NORMALIZED_ALIAS_TO_PROVINCE.set(normalizeText(provinceId), provinceId);

  for (const alias of aliases) {
    NORMALIZED_ALIAS_TO_PROVINCE.set(normalizeText(alias), provinceId);
  }
}

function pushCandidate(candidates, seenCandidates, value) {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue || seenCandidates.has(normalizedValue)) return;

  candidates.push({ raw: value, normalized: normalizedValue });
  seenCandidates.add(normalizedValue);
}

export function normalizeProvinceCandidate(value = "") {
  return NORMALIZED_ALIAS_TO_PROVINCE.get(normalizeText(value)) ?? null;
}

export function inferProvinceIdFromText(value = "") {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return null;

  if (NORMALIZED_ALIAS_TO_PROVINCE.has(normalizedValue)) {
    return NORMALIZED_ALIAS_TO_PROVINCE.get(normalizedValue);
  }

  for (const [alias, provinceId] of NORMALIZED_ALIAS_TO_PROVINCE.entries()) {
    if (alias && normalizedValue.includes(alias)) {
      return provinceId;
    }
  }

  return null;
}

export function extractProvinceCandidatesFromNominatim(result = {}) {
  const candidates = [];
  const seenCandidates = new Set();
  const address = result?.address ?? {};

  [
    address.province,
    address.county,
    address.state_district,
    address.state,
    address.region,
    address.city,
    address.town,
    address.municipality,
    result?.display_name,
  ].forEach((value) => pushCandidate(candidates, seenCandidates, value));

  return candidates.map((candidate) => candidate.raw);
}

export function inferProvinceIdFromNominatim(result = {}) {
  const candidates = extractProvinceCandidatesFromNominatim(result);

  for (const candidate of candidates) {
    const provinceId = inferProvinceIdFromText(candidate);
    if (provinceId) return provinceId;
  }

  return null;
}
