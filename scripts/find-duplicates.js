// Fuente de verdad: data/communities/ (el bundle de public/data/ es un artefacto generado).
import { readCommunities } from './lib/communities-store.js';

let communities;
try {
  communities = readCommunities();
} catch (error) {
  console.error("❌ Error al leer las comunidades:", error.message);
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
