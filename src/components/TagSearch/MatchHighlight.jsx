/* eslint-disable react/prop-types */
import { splitSearchMatches } from '../../lib/searchHighlight.js';

export function MatchHighlight({ text, query }) {
  return <span>{splitSearchMatches(text, query).map((part, index) => part.matched
    ? <mark key={index} className="tag-search-match">{part.text}</mark>
    : part.text)}</span>;
}
