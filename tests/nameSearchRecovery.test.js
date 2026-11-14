import { describe, expect, it } from 'vitest';
import { buildInverseIndex } from '../src/data/invertedindex.js';
import { searchFaceted } from '../src/data/searchFaceted.js';
import { getNameSearchRecovery } from '../src/lib/nameSearchRecovery.js';

const data = [
  { id: 1, name: 'WebMadrid', status: 'active', tags: ['javascript'] },
  { id: 2, name: 'Asociación de Webmasters de Granada', status: 'inactive', tags: ['php'] },
  { id: 3, name: 'Asociación de Webmasters de Málaga', status: 'inactive', tags: [] },
  { id: 4, name: 'Webmasters Sevilla', status: 'inactive', tags: ['php'], hidden: true },
  { id: 5, name: 'GDG Alicante', status: 'active', tags: ['php'] },
];
const index = buildInverseIndex(data);

describe('recuperación de búsquedas por nombre', () => {
  it('explica las inactivas ocultas sin incluir fichas ocultas ni modificar los filtros', () => {
    const filters = { status: ['active'], nameQuery: ['webma'] };
    const recovery = getNameSearchRecovery(data, index, filters);
    expect(recovery.inactiveCount).toBe(2);
    expect(recovery.inactiveFilters).toEqual({ ...filters, status: ['active', 'inactive'] });
    expect(filters.status).toEqual(['active']);
    expect(recovery.alternatives).toEqual([]);
  });

  it('cuenta el destino real del botón respetando las demás facetas', () => {
    const filters = { status: ['active'], nameQuery: ['webma'], tags: ['php'] };
    const recovery = getNameSearchRecovery(data, index, filters);
    expect(recovery.inactiveCount).toBe(1);
    const destination = searchFaceted(data.filter(community => !community.hidden), index, recovery.inactiveFilters);
    expect(destination.map(community => community.id)).toEqual([2]);
    expect(destination).toHaveLength(recovery.inactiveCount);
    expect(recovery.inactiveFilters.tags).toEqual(['php']);
  });

  it('no ofrece inactivas si no hay filtro de estado o ya se incluyen', () => {
    for (const filters of [{ nameQuery: ['webma'] }, { nameQuery: ['webma'], status: ['active', 'inactive'] }]) {
      expect(getNameSearchRecovery(data, index, filters).inactiveCount).toBe(0);
    }
  });

  it('ofrece nombres parecidos con estado explícito sin corregir la consulta', () => {
    const filters = { status: ['active'], nameQuery: ['webam'] };
    const recovery = getNameSearchRecovery(data, index, filters);
    expect(recovery.inactiveCount).toBe(0);
    expect(recovery.alternatives.map(({ community, excludedByStatus }) => [community.id, excludedByStatus])).toEqual([[1, false], [2, true], [3, true]]);
    expect(searchFaceted(data, index, filters)).toEqual([]);
    expect(filters.nameQuery).toEqual(['webam']);
  });

  it('las alternativas respetan las facetas distintas del estado y requieren todas las palabras', () => {
    const filters = { status: ['active'], nameQuery: ['webam'], tags: ['php'] };
    expect(getNameSearchRecovery(data, index, filters).alternatives.map(({ community }) => community.id)).toEqual([2]);
    expect(getNameSearchRecovery(data, index, { nameQuery: ['gdg inexistente'] }).alternatives).toEqual([]);
  });

  it('no sustituye por aproximadas un nombre completo excluido por otra faceta', () => {
    const filters = { status: ['active'], nameQuery: ['webma'], tags: ['ruby'] };
    expect(getNameSearchRecovery(data, index, filters)).toEqual({ inactiveCount: 0, inactiveFilters: null, alternatives: [] });
    expect(getNameSearchRecovery(data, index)).toEqual({ inactiveCount: 0, inactiveFilters: null, alternatives: [] });
  });
});
