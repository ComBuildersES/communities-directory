import fs from "fs";

const communitiesPath = "./public/data/communities.json";

let communities;

try {
  const rawData = fs.readFileSync(communitiesPath, "utf-8");
  communities = JSON.parse(rawData);
} catch (error) {
  console.error("Error al leer o parsear communities.json:", error.message);
  process.exit(1);
}

const duplicateIds = new Map();

for (const community of communities) {
  const { id, name } = community;

  if (!Number.isInteger(id)) {
    console.error(`ID invalido en la comunidad "${name || "Sin nombre"}": ${id}`);
    process.exit(1);
  }

  if (!duplicateIds.has(id)) {
    duplicateIds.set(id, []);
  }

  duplicateIds.get(id).push(name || "Sin nombre");
}

const repeatedIds = [...duplicateIds.entries()].filter(([, names]) => names.length > 1);

if (repeatedIds.length > 0) {
  console.error("Se han encontrado IDs duplicados en communities.json:");

  repeatedIds.forEach(([id, names]) => {
    console.error(`- ID ${id}: ${names.join(", ")}`);
  });

  process.exit(1);
}

console.log(`Datos validados correctamente. ${communities.length} comunidades revisadas.`);
