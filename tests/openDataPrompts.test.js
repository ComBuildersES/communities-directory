import { describe, expect, it } from 'vitest';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';

const PROMPT_KEYS = ['tribe', 'speaker', 'volunteer', 'synergies', 'gaps'];

/**
 * Los prompts del modal "Datos abiertos + IA" son producto, no copy de relleno: si alguien
 * los reescribe y vuelve a meter un `[describe aquí tu perfil]`, la persona tiene que
 * rellenar el hueco a mano y el prompt deja de servir para lo que se hizo.
 */
const LOCALES = [
  { name: 'es', data: es, asksFirst: /pregúnta(me|lo)/i },
  { name: 'en', data: en, asksFirst: /ask me|ask what you need|ask you/i },
];

describe.each(LOCALES)('prompts de openData ($name)', ({ data, asksFirst }) => {
  const prompts = data.openData.chat.prompts;

  it('tiene los cinco prompts', () => {
    expect(Object.keys(prompts).sort()).toEqual([...PROMPT_KEYS].sort());
  });

  it.each(PROMPT_KEYS)('"%s" pide los datos a la persona en vez de dejar un hueco', (key) => {
    const { text } = prompts[key];

    // Un `[...]` de más de cinco caracteres es un hueco que alguien tiene que rellenar.
    expect(text.match(/\[[^\]]{6,}\]/g)).toBeNull();
    expect(text).toMatch(asksFirst);
  });

  it.each(PROMPT_KEYS)('"%s" solo usa variables que el modal sabe interpolar', (key) => {
    const used = [...prompts[key].text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]);
    const known = ['dataUrl', 'indexUrl', 'tagsUrl', 'audienceUrl', 'tagsEnUrl', 'audienceEnUrl'];

    used.forEach((variable) => expect(known).toContain(variable));
  });

  it('menciona los catálogos en los dos idiomas', () => {
    PROMPT_KEYS.forEach((key) => {
      expect(prompts[key].text).toContain('{{tagsEnUrl}}');
    });
  });

  it('recuerda las trampas del dataset donde se recomiendan comunidades', () => {
    ['tribe', 'speaker', 'volunteer', 'synergies'].forEach((key) => {
      const { text } = prompts[key];
      expect(text).toContain('archivedUrls');
      expect(text).toContain('matchesAllTags');
      expect(text).toContain('geographicScope');
    });
  });
});
