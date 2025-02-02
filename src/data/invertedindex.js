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

      inverseIndex[clave][valor].add(registro.ID);
    });
  });

  return inverseIndex;
};

export const buildInverseIndex = (data) => {
  const inverseIndex = {};

  data.forEach((registro) => {
    Object.keys(registro).forEach((key) => {
      const value = registro[key]?.toString().trim().toLowerCase(); // Normalizamos los valores

      if (!inverseIndex[key]) {
        inverseIndex[key] = {};
      }

      if (!inverseIndex[key][value]) {
        inverseIndex[key][value] = new Set();
      }

      inverseIndex[key][value].add(registro.ID);
    });
  });
  /*   console.log(
    "Índice Inverso Generado:",
    JSON.stringify(inverseIndex, null, 2)
  );  */ // Debug
  return inverseIndex;
};
