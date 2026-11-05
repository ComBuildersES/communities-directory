import { execFileSync } from 'node:child_process';

import {
  BUNDLE_PATH,
  DELETED_PATH,
  DELETED_SOURCE_DIR,
  SOURCE_DIR,
} from './communities-store.js';

/**
 * Lee el listado de comunidades tal como estaba en un ref de git.
 *
 * Varios scripts comparan el estado actual contra una baseline (`--baseline-ref`, el commit
 * padre, `origin/master`…). Desde que la fuente de verdad es un fichero por comunidad, esa
 * baseline hay que reconstruirla desde `data/communities/` en el ref.
 *
 * Se mantiene el fallback a `public/data/communities.json` para refs anteriores a la
 * migración: el historial sigue teniendo el bundle commiteado y `generate-changelog`
 * recorre commits antiguos.
 */

function git(args, { encoding = 'utf-8' } = {}) {
  return execFileSync('git', args, {
    encoding,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function listSourceBlobs(ref, dir) {
  let output;
  try {
    output = git(['ls-tree', '-r', ref, '--', dir]);
  } catch {
    return [];
  }

  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      // "<mode> <type> <oid>\t<path>"
      const [meta, filePath] = line.split('\t');
      const [, type, oid] = meta.split(/\s+/);
      return { type, oid, filePath };
    })
    .filter((entry) => entry.type === 'blob' && entry.filePath.endsWith('.json'));
}

/**
 * Recupera varios blobs en una sola invocación de `git cat-file --batch`: con 600+ ficheros,
 * un `git show` por fichero multiplicaría el tiempo de los checks por dos órdenes de magnitud.
 */
function readBlobs(oids) {
  if (oids.length === 0) return [];

  const stdout = execFileSync('git', ['cat-file', '--batch'], {
    input: `${oids.join('\n')}\n`,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const contents = [];
  let offset = 0;

  while (offset < stdout.length) {
    const headerEnd = stdout.indexOf('\n', offset);
    if (headerEnd === -1) break;

    const header = stdout.slice(offset, headerEnd).toString('utf-8');
    const parts = header.split(' ');

    // "<oid> missing" cuando el objeto no existe en el ref.
    if (parts.length < 3) {
      offset = headerEnd + 1;
      continue;
    }

    const size = Number(parts[2]);
    const start = headerEnd + 1;
    contents.push(stdout.slice(start, start + size).toString('utf-8'));
    offset = start + size + 1; // +1: salto de línea final tras el contenido
  }

  return contents;
}

function readRecordsAtRef(ref, { sourceDir, bundlePath }) {
  const blobs = listSourceBlobs(ref, sourceDir);

  if (blobs.length > 0) {
    const records = [];

    for (const raw of readBlobs(blobs.map((blob) => blob.oid))) {
      try {
        records.push(JSON.parse(raw));
      } catch {
        // Un fichero corrupto en la baseline no debe tumbar la comparación.
      }
    }

    return records;
  }

  // Ref anterior a la migración: el bundle era la fuente de verdad.
  try {
    return JSON.parse(git(['show', `${ref}:${bundlePath}`]));
  } catch {
    return null;
  }
}

/** Comunidades activas en `ref`, o `null` si el ref no tiene datos legibles. */
export function readCommunitiesAtRef(ref) {
  return readRecordsAtRef(ref, { sourceDir: SOURCE_DIR, bundlePath: BUNDLE_PATH });
}

/** Comunidades dadas de baja en `ref`, o `null` si el ref no tiene datos legibles. */
export function readDeletedCommunitiesAtRef(ref) {
  return readRecordsAtRef(ref, { sourceDir: DELETED_SOURCE_DIR, bundlePath: DELETED_PATH });
}

/** Lee cualquier JSON versionado en un ref (p. ej. `deleted-communities.json`). */
export function readJsonAtRef(ref, filePath) {
  try {
    return JSON.parse(git(['show', `${ref}:${filePath}`]));
  } catch {
    return null;
  }
}
