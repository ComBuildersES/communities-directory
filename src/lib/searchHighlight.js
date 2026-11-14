import { normalize } from './fuzzyMatch.js';

/** Mantener posiciones del texto original aunque sus acentos ocupen varios caracteres. */
export function splitSearchMatches(text = '', query = '') {
  const tokens = [...new Set(normalize(query).split(' ').filter(Boolean))];
  if (!text || tokens.length === 0) return [{ text, matched: false }];

  let folded = '';
  let offset = 0;
  const positions = [];
  for (const character of text) {
    const value = character.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const end = offset + character.length;
    if (!value && positions.length) positions[positions.length - 1].end = end;
    for (let index = 0; index < value.length; index++) positions.push({ start: offset, end });
    folded += value;
    offset = end;
  }

  const ranges = [];
  for (const token of tokens) {
    let index = folded.indexOf(token);
    while (index !== -1) {
      ranges.push({ start: positions[index].start, end: positions[index + token.length - 1].end });
      index = folded.indexOf(token, index + 1);
    }
  }
  ranges.sort((left, right) => left.start - right.start);
  const merged = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
    else merged.push({ ...range });
  }

  const parts = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), matched: false });
    parts.push({ text: text.slice(start, end), matched: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), matched: false });
  return parts;
}
