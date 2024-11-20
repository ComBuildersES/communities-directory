export const buildInvertedIndex = (data) => {
  // Índice vacío para almacenar los datos
  const invertedIndex = {};

  data.forEach((item, indexId) => {
    Object.entries(item).forEach(([key, value]) => {
      if (!value) return; // ignora valores vacios

      // Limpieza de espacios o caracteres especiales en el valor
      const sanitizedValue = value.toString().trim();
      // Inicializar la estructura de la faceta en el índice si no existe
      if (!invertedIndex[key]) invertedIndex[key] = {};

      // Inicializar el array para el valor específico de la faceta si no existe
      if (!invertedIndex[key][sanitizedValue])
        invertedIndex[key][sanitizedValue] = [];
      // Acumular el índice de la comunidad
      // Añadir la referencia (indexId numero indice del array data) de la comunidad en el array correspondiente
      invertedIndex[key][sanitizedValue].push(indexId);
    });
  });

  return invertedIndex;
};

export const makeInverseIndex = (data) => {
  const inverseIndex = {};

  data.forEach((registro) => {
    //Obtiene las claves del registro
    Object.keys(registro).forEach((clave) => {
      const valor = registro[clave].toString().trim();

      // Si el valor de esa clave no existe en el indice la crea.

      if (!inverseIndex[clave]) {
        inverseIndex[clave] = {};
      }

      if (!inverseIndex[clave][valor]) {
        inverseIndex[clave][valor] = new Set();
      }

      inverseIndex[clave][valor].add(registro.ID);
    });
  });

  return inverseIndex;
};
