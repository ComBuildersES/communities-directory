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

// 🔹 Función para normalizar textos
function normalize(str) {
  return (str || "").trim().toLowerCase().replace(/\/$/, "");
}

// 🔹 Función para encontrar duplicados
function findDuplicates(data) {
  const seenNames = new Map();
  const seenUrls = new Map();
  const duplicates = [];

  for (const community of data) {
    const nameKey = normalize(community.name);
    const urlKey = normalize(community.communityUrl);

    if (seenNames.has(nameKey)) {
      duplicates.push({
        reason: "Nombre duplicado",
        original: seenNames.get(nameKey),
        duplicate: community
      });
    } else {
      seenNames.set(nameKey, community);
    }

    if (urlKey && seenUrls.has(urlKey)) {
      duplicates.push({
        reason: "URL duplicada",
        original: seenUrls.get(urlKey),
        duplicate: community
      });
    } else if (urlKey) {
      seenUrls.set(urlKey, community);
    }
  }

  return duplicates;
}

// 🔹 Ejecutamos la búsqueda de duplicados
const duplicates = findDuplicates(communities);

if (duplicates.length === 0) {
  console.log("✅ No se encontraron duplicados.");
} else {
  console.log("⚠️ Duplicados encontrados:\n");
  for (const dup of duplicates) {
    console.log(`🔁 ${dup.reason}`);
    console.log(`   ➤ Original: ${dup.original.name} (ID: ${dup.original.id})`);
    console.log(`   ➤ Duplicado: ${dup.duplicate.name} (ID: ${dup.duplicate.id})\n`);
  }
}
