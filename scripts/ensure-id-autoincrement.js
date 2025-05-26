import fs from 'fs';

// 🔹 Ruta al archivo JSON con los datos
const communitiesPath = './public/data/communities.json';

// 🔹 Leemos y parseamos el archivo JSON
let communities;
try {
  const rawData = fs.readFileSync(communitiesPath, "utf-8");
  communities = JSON.parse(rawData);
} catch (error) {
  console.error("❌ Error al leer o parsear el archivo JSON:", error.message);
  process.exit(1);
}

// 🔹 Reasignamos IDs autoincrementales desde 1
communities = communities.map((community, index) => ({
  ...community,
  id: index,
}));

// 🔹 Escribimos el archivo con los IDs corregidos
try {
  fs.writeFileSync(
    communitiesPath,
    JSON.stringify(communities, null, 2),
    "utf-8"
  );
  console.log(`✅ IDs corregidos y archivo guardado correctamente.`);
} catch (error) {
  console.error("❌ Error al guardar el archivo JSON:", error.message);
  process.exit(1);
}
