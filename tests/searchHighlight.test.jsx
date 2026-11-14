import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MatchHighlight } from '../src/components/TagSearch/MatchHighlight.jsx';
import { splitSearchMatches } from '../src/lib/searchHighlight.js';

const marked = (text, query) => splitSearchMatches(text, query).filter(part => part.matched).map(part => part.text);

describe('resaltado de sugerencias', () => {
  it('resalta cada palabra sin distinguir mayúsculas ni acentos y conserva el original', () => {
    expect(marked('GDG Almería', 'almeria gdg')).toEqual(['GDG', 'Almería']);
    expect(marked('GDG Almeri\u0301a', 'almeria')).toEqual(['Almeri\u0301a']);
    expect(marked('Café', 'cafe')).toEqual(['Café']);
    expect(marked('Cafe\u0301', 'cafe')).toEqual(['Cafe\u0301']);
  });

  it('en resultados parciales solo marca las partes que coinciden literalmente', () => {
    expect(marked('GDG Alicante', 'gdg almer')).toEqual(['GDG']);
    expect(marked('JavaScript Madrid', 'javscript')).toEqual([]);
    expect(marked('AlmeríaTech', 'gdg almer')).toEqual(['Almer']);
  });

  it('trata símbolos como texto y une coincidencias repetidas o solapadas', () => {
    expect(marked('C++ y C#', 'c++ c#')).toEqual(['C++', 'C#']);
    expect(marked('JavaScript Java', 'java javascript java')).toEqual(['JavaScript', 'Java']);
    expect(marked('Python · Python', 'python')).toEqual(['Python', 'Python']);
    expect(marked('Java Script', 'javascript')).toEqual([]);
    expect(splitSearchMatches('React', '').map(part => part.text).join('')).toBe('React');
  });

  it('escapa HTML y no introduce espacios entre los fragmentos del nombre', () => {
    const html = renderToStaticMarkup(<MatchHighlight text={'<script>GDG Almería</script>'} query="gdg almer" />);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('<mark class="tag-search-match">GDG</mark> <mark class="tag-search-match">Almer</mark>ía');
  });
});
