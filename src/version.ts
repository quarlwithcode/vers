/**
 * 🏷️ vers — Version Logic
 *
 * Pre-release convention:
 *   0.1.x       POC (proof of concept)
 *   0.2.x–0.4.x Prototype / alpha
 *   0.5.x–0.9.x Beta
 *   1.0.0        First stable release
 *
 * After 1.0.0: standard semver (MAJOR.MINOR.PATCH)
 */

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null; // e.g., "alpha.1", "beta.3", "rc.1"
  raw: string;
}

export type Stage = 'poc' | 'alpha' | 'beta' | 'stable';
export type BumpType = 'patch' | 'minor' | 'major' | 'graduate';

export function parse(version: string): ParsedVersion {
  const clean = version.replace(/^v/, '');
  const [core, prerelease] = clean.split('-', 2);
  const parts = core.split('.').map(Number);

  if (parts.length < 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version: ${version}`);
  }

  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
    prerelease: prerelease || null,
    raw: clean,
  };
}

export function format(v: ParsedVersion): string {
  const core = `${v.major}.${v.minor}.${v.patch}`;
  return v.prerelease ? `${core}-${v.prerelease}` : core;
}

export function stage(v: ParsedVersion): Stage {
  if (v.major >= 1) return 'stable';
  if (v.minor >= 5) return 'beta';
  if (v.minor >= 2) return 'alpha';
  return 'poc';
}

export function stageLabel(s: Stage): string {
  switch (s) {
    case 'poc': return 'POC (proof of concept)';
    case 'alpha': return 'Prototype / Alpha';
    case 'beta': return 'Beta';
    case 'stable': return 'Stable';
  }
}

export function stageRange(s: Stage): string {
  switch (s) {
    case 'poc': return '0.1.x';
    case 'alpha': return '0.2.x–0.4.x';
    case 'beta': return '0.5.x–0.9.x';
    case 'stable': return '≥ 1.0.0';
  }
}

/**
 * Bump a version.
 *
 * - patch: 0.1.0 → 0.1.1
 * - minor: 0.1.3 → 0.2.0
 * - major: 0.9.5 → 1.0.0 (or 1.2.3 → 2.0.0)
 * - graduate: advance to the next stage boundary
 *     poc → alpha (0.1.x → 0.2.0)
 *     alpha → beta (0.4.x → 0.5.0)
 *     beta → stable (0.9.x → 1.0.0)
 *     stable → next major (1.x.x → 2.0.0)
 */
export function bump(v: ParsedVersion, type: BumpType): ParsedVersion {
  const next = { ...v, prerelease: null };

  switch (type) {
    case 'patch':
      next.patch = v.patch + 1;
      break;

    case 'minor':
      next.minor = v.minor + 1;
      next.patch = 0;
      break;

    case 'major':
      next.major = v.major + 1;
      next.minor = 0;
      next.patch = 0;
      break;

    case 'graduate': {
      const current = stage(v);
      switch (current) {
        case 'poc':
          next.minor = 2;
          next.patch = 0;
          break;
        case 'alpha':
          next.minor = 5;
          next.patch = 0;
          break;
        case 'beta':
          next.major = 1;
          next.minor = 0;
          next.patch = 0;
          break;
        case 'stable':
          next.major = v.major + 1;
          next.minor = 0;
          next.patch = 0;
          break;
      }
      break;
    }
  }

  next.raw = format(next);
  return next;
}

/**
 * What's next? Show the possible bumps from current version.
 */
export function nextOptions(v: ParsedVersion): Array<{ type: BumpType; version: string; description: string }> {
  const s = stage(v);
  const options: Array<{ type: BumpType; version: string; description: string }> = [];

  // Patch is always available
  const patched = bump(v, 'patch');
  options.push({
    type: 'patch',
    version: format(patched),
    description: s === 'stable' ? 'Bug fix' : `${stageLabel(s)} iteration`,
  });

  // Minor
  const minored = bump(v, 'minor');
  const minorStage = stage(minored);
  if (minorStage !== s) {
    options.push({
      type: 'minor',
      version: format(minored),
      description: `Graduates to ${stageLabel(minorStage)}`,
    });
  } else {
    options.push({
      type: 'minor',
      version: format(minored),
      description: s === 'stable' ? 'New feature (backwards-compatible)' : `${stageLabel(s)} feature add`,
    });
  }

  // Graduate (if not already at the boundary)
  const graduated = bump(v, 'graduate');
  if (format(graduated) !== format(minored)) {
    const nextStage = stage(graduated);
    options.push({
      type: 'graduate',
      version: format(graduated),
      description: `Graduate to ${stageLabel(nextStage)}`,
    });
  }

  // Major (only show for stable)
  if (s === 'stable') {
    const majored = bump(v, 'major');
    options.push({
      type: 'major',
      version: format(majored),
      description: 'Breaking changes',
    });
  }

  return options;
}
