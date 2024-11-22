export const normalizar = (valor) => valor?.toString().trim.toLowerCase();

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
