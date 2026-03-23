export const normalizar = (valor) => valor?.toString().trim().toLowerCase();

export const makeInverseIndex = (data) => {
  const inverseIndex = {};

  data.forEach((registro) => {
    //Obtiene las claves del registro
    Object.keys(registro).forEach((clave) => {
      const valor = registro[clave]?.toString().trim().toLowerCase();

      // Si el valor de esa clave no existe en el indice la crea.

      if (!inverseIndex[clave]) {
        inverseIndex[clave] = {};
      }

      if (!inverseIndex[clave][valor]) {
        inverseIndex[clave][valor] = new Set();
      }

      inverseIndex[clave][valor].add(registro.id);
    });
  });

  return inverseIndex;
};

export const buildInverseIndex = (data) => {
  const inverseIndex = {};

  data.forEach((registro) => {
    Object.keys(registro).forEach((key) => {
      if (!inverseIndex[key]) {
        inverseIndex[key] = {};
      }

      const rawValue = registro[key];

      // Campos array (tags, targetAudience): indexar cada elemento por separado
      if (Array.isArray(rawValue)) {
        rawValue.forEach((item) => {
          const normalized = item?.toString().trim().toLowerCase();
          if (!normalized) return;
          if (!inverseIndex[key][normalized]) {
            inverseIndex[key][normalized] = new Set();
          }
          inverseIndex[key][normalized].add(registro.id);
        });
        return;
      }

      const value = rawValue?.toString().trim().toLowerCase();
      if (!inverseIndex[key][value]) {
        inverseIndex[key][value] = new Set();
      }
      inverseIndex[key][value].add(registro.id);
    });
  });

  return inverseIndex;
};
