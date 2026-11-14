import { searchFaceted } from '../data/searchFaceted.js';
import { matchesCommunityName, scoreCommunity } from './fuzzyMatch.js';

/** Salidas explícitas de una búsqueda vacía; nunca modifica consulta ni filtros. */
export function getNameSearchRecovery(data, index, filters = {}) {
  const query = filters.nameQuery?.[0] ?? '';
  const empty = { inactiveCount: 0, inactiveFilters: null, alternatives: [] };
  if (!query) return empty;
  const visible = data.filter(community => community.hidden !== true);
  const statuses = filters.status ?? [];
  let inactiveFilters = null;
  let inactiveCount = 0;
  if (statuses.length > 0 && !statuses.includes('inactive')) {
    const expandedFilters = { ...filters, status: [...statuses, 'inactive'] };
    inactiveCount = searchFaceted(visible, index, expandedFilters).filter(community => community.status === 'inactive').length;
    if (inactiveCount > 0) inactiveFilters = expandedFilters;
  }

  // Un nombre exacto excluido por filtros no justifica sustituirlo por otro aproximado.
  if (visible.some(community => matchesCommunityName(query, community.name))) {
    return { inactiveCount, inactiveFilters, alternatives: [] };
  }
  const otherFilters = Object.fromEntries(Object.entries(filters).filter(([key]) => key !== 'nameQuery' && key !== 'status'));
  const alternatives = searchFaceted(visible, index, otherFilters)
    .map(community => ({ community, score: scoreCommunity(query, community.name),
      excludedByStatus: statuses.length > 0 && !statuses.includes(community.status) }))
    .filter(({ score }) => score !== null)
    .sort((left, right) => right.score - left.score
      || Number(left.excludedByStatus) - Number(right.excludedByStatus)
      || left.community.name.localeCompare(right.community.name, 'es', { sensitivity: 'base' }))
    .slice(0, 5);
  return { inactiveCount, inactiveFilters, alternatives };
}
