import fs from 'fs';
import fetch from 'node-fetch';

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

// 🔹 Verifica una URL individual
async function checkUrlStatus(community) {
  const url = community.communityUrl?.trim();
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: 'GET', // Cambiamos de HEAD a GET para obtener más respuestas válidas
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    });
    
    switch (response.status){
      case 200:
        console.log(`✅ [${response.status}] ${community.name}`);
        break;
      case 403:
        console.log(`⚠️ [${response.status}] ${community.name}`);
        break;
      case 404:
        console.log(`⛔️ [${response.status}] ${community.name} (${url})`);
        break;
      default:
        console.log(`🔴 [${response.status}] ${community.name} (${url})`);
    }

    
  
  } catch (err) {
    console.log(`❌ [error] ${community.name} (${url}) → ${err.message}`);
  }
}

// 🔹 Procesa las URLs en paralelo controlada (con batches opcional)
async function verifyUrls(communities, concurrency = 5) {
  console.log(`🔍 Verificando ${communities.length} URLs...\n`);

  const queue = [...communities];
  const workers = [];

  for (let i = 0; i < concurrency; i++) {
    const worker = (async () => {
      while (queue.length > 0) {
        const community = queue.shift();
        await checkUrlStatus(community);
      }
    })();
    workers.push(worker);
  }

  await Promise.all(workers);
  console.log("\n✅ Verificación completa.");
}

// 🔹 Ejecutar
verifyUrls(communities);
