import { describe, expect, it } from 'vitest';
import es from '../src/i18n/locales/es.json';
import en from '../src/i18n/locales/en.json';

/** Las claves que ofrece cada pestaña del modal, en el mismo orden que `OpenDataModal.jsx`. */
const PROMPTS_BY_TAB = {
  attend: ['tribe', 'types', 'speaker', 'volunteer'],
  organizers: ['synergies'],
  found: ['umbrella', 'gaps'],
  build: ['onboarding'],
};

const PROMPT_KEYS = Object.values(PROMPTS_BY_TAB).flat();

/** Los prompts que terminan recomendando comunidades concretas a una persona. */
const RECOMMENDING_KEYS = ['tribe', 'types', 'speaker', 'volunteer', 'synergies', 'umbrella'];

/** Las mismas variables que interpola `usePrompts`, más el bloque de reglas compartido. */
const KNOWN_VARIABLES = [
  'dataUrl',
  'indexUrl',
  'schemaUrl',
  'tagsUrl',
  'audienceUrl',
  'tagsEnUrl',
  'audienceEnUrl',
  'rules',
];

/**
 * Los prompts del modal "Datos abiertos + IA" son producto, no copy de relleno:
 *
 * - si alguien los reescribe y vuelve a meter un `[describe aquí tu perfil]`, la persona
 *   tiene que rellenar el hueco a mano y el prompt deja de servir para lo que se hizo;
 * - si se cae el bloque de reglas, el modelo se inventa lo que el dataset no dice, que es
 *   justo lo que esta capa existe para evitar.
 */
const LOCALES = [
  { name: 'es', data: es, asksFirst: /pregúnta(me|le|lo)/i },
  { name: 'en', data: en, asksFirst: /ask me|ask what you need|ask you/i },
];

describe.each(LOCALES)('prompts de openData ($name)', ({ data, asksFirst }) => {
  const prompts = data.openData.prompts;

  it('tiene un prompt por cada clave que pintan las pestañas', () => {
    const keys = Object.keys(prompts).filter((key) => key !== 'rules');

    expect(keys.sort()).toEqual([...PROMPT_KEYS].sort());
  });

  it.each(PROMPT_KEYS)('"%s" pide los datos a la persona en vez de dejar un hueco', (key) => {
    const { text } = prompts[key];

    // Un `[...]` de más de cinco caracteres es un hueco que alguien tiene que rellenar.
    expect(text.match(/\[[^\]]{6,}\]/g)).toBeNull();
    expect(text).toMatch(asksFirst);
  });

  it.each(PROMPT_KEYS)('"%s" solo usa variables que el modal sabe interpolar', (key) => {
    const used = [...prompts[key].text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]);

    used.forEach((variable) => expect(KNOWN_VARIABLES).toContain(variable));
  });

  it.each(PROMPT_KEYS)('"%s" incluye el bloque de reglas compartido', (key) => {
    expect(prompts[key].text).toContain('{{rules}}');
  });

  it('el bloque de reglas recuerda las trampas del dataset', () => {
    const { rules } = prompts;

    expect(rules).toContain('archivedUrls');
    expect(rules).toContain('matchesAllTags');
    expect(rules).toContain('geographicScope');
    expect(rules).toContain('humanValidated');
    expect(rules).toContain('{{tagsEnUrl}}');
  });

  /**
   * Dos cosas que el dataset no mide y que los prompts prometían: `lastReviewed` es la
   * fecha de la última revisión de la ficha, no de la última actividad, y la cobertura de
   * `tags` / `targetAudience` / `geographicScope` es parcial. Sin estos dos avisos el
   * modelo descarta comunidades en silencio y presenta fichas muertas como vivas.
   */
  it('el bloque de reglas desmiente lastReviewed como señal de actividad', () => {
    const { rules } = prompts;

    expect(rules).toContain('lastReviewed');
    // Desde #478 `urls` es una lista de pares, así que la señal se nombra por su kind y no
    // como "urls.ote". Lo que el prompt no puede dejar de hacer es apuntar al feed.
    expect(rules).toContain('"ote"');
  });

  /**
   * `urls` dejó de ser un objeto por plataforma (#478). Si el prompt no lo dice, el modelo
   * busca `urls.telegram`, no lo encuentra y concluye que la comunidad no tiene Telegram.
   */
  /**
   * El directorio lee el feed, no responde de él. Decir que el feed "evidencia actividad"
   * hacía que un modelo leyese "tiene feed, luego está viva", que es una conclusión sobre lo
   * que publique cada comunidad y no sobre lo que el dataset sabe.
   */
  it('el bloque de reglas no deja deducir actividad de que exista el feed', () => {
    const { rules } = prompts;

    expect(rules).toMatch(/no dice qué hay dentro|says nothing about what is in it/);
    expect(rules).toMatch(/fechas del feed|dates in the feed/);
  });

  it('el bloque de reglas explica que urls es una lista de pares', () => {
    const { rules } = prompts;

    expect(rules).toMatch(/LISTA de canales|LIST of channels/);
    expect(rules).toContain('"kind"');
    expect(rules).toContain('"label"');
  });

  it('el bloque de reglas avisa de que un campo vacío no es un dato', () => {
    expect(prompts.rules).toMatch(/nadie lo ha rellenado|nobody has filled it in/i);
  });

  it.each(['volunteer', 'synergies', 'speaker'])(
    '"%s" usa la disponibilidad declarada sin inferirla cuando falta',
    (key) => {
      expect(prompts[key].text).toContain('openTo');
      expect(prompts[key].text).toMatch(/sin información|unknown|dato falta|If missing/i);
    }
  );

  it('no deduce de openTo que una organización acoja grupos nuevos', () => {
    expect(prompts.umbrella.text).toMatch(/el dataset no dice|the dataset does not say/i);
  });

  it.each(RECOMMENDING_KEYS)('"%s" pide el enlace o el canal de contacto', (key) => {
    expect(prompts[key].text).toMatch(/enlace|canal|link|channel/i);
  });
});

describe.each(LOCALES)('pestañas de openData ($name)', ({ data }) => {
  it('tiene una etiqueta por pestaña', () => {
    expect(Object.keys(data.openData.tabs).sort()).toEqual(
      Object.keys(PROMPTS_BY_TAB).sort()
    );
  });

  it('ya no arrastra el bloque de la pestaña "chatbot"', () => {
    expect(data.openData.chat).toBeUndefined();
  });

  it('cada pestaña con contenido propio trae su texto de entrada', () => {
    expect(data.openData.attend.lead).toBeTruthy();
    expect(data.openData.found.lead).toBeTruthy();
    expect(data.openData.found.helpTitle).toBeTruthy();
    expect(data.openData.organizers.promptsTitle).toBeTruthy();
    expect(data.openData.build.filesTitle).toBeTruthy();
  });
});
