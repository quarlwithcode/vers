/**
 * 🏷️ vers — Project file management
 * Reads/writes version from package.json
 */

import fs from 'fs';
import path from 'path';

export interface ProjectFile {
  path: string;
  version: string;
  name?: string;
}

/**
 * Find and read the nearest package.json
 */
export function findProject(dir = '.'): ProjectFile | null {
  let current = path.resolve(dir);

  while (true) {
    const pkgPath = path.join(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return {
          path: pkgPath,
          version: pkg.version || '0.0.0',
          name: pkg.name,
        };
      } catch {
        return null;
      }
    }

    const parent = path.dirname(current);
    if (parent === current) break; // Hit root
    current = parent;
  }

  return null;
}

/**
 * Update version in package.json
 */
export function updateVersion(pkgPath: string, newVersion: string): void {
  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw);
  const oldVersion = pkg.version;
  pkg.version = newVersion;

  // Preserve formatting: detect indent
  const indent = raw.match(/^(\s+)"/) ? raw.match(/^(\s+)"/m)![1] : '  ';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + '\n');
}

/**
 * Read changelog and optionally prepend a new entry
 */
export function updateChangelog(dir: string, version: string, message?: string): boolean {
  const changelogPath = path.join(dir, 'CHANGELOG.md');

  if (!fs.existsSync(changelogPath)) return false;

  if (message) {
    const content = fs.readFileSync(changelogPath, 'utf-8');
    const date = new Date().toISOString().split('T')[0];
    const entry = `\n## [${version}] — ${date}\n\n${message}\n`;

    // Insert after the first heading line
    const lines = content.split('\n');
    const insertIdx = lines.findIndex((l, i) => i > 0 && l.startsWith('## '));
    if (insertIdx > 0) {
      lines.splice(insertIdx, 0, entry);
    } else {
      lines.push(entry);
    }

    fs.writeFileSync(changelogPath, lines.join('\n'));
  }

  return true;
}
