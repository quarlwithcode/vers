import { describe, it, expect } from 'vitest';
import { parse, format, stage, bump, nextOptions } from '../src/version.js';

describe('parse', () => {
  it('parses basic version', () => {
    const v = parse('0.1.0');
    expect(v.major).toBe(0);
    expect(v.minor).toBe(1);
    expect(v.patch).toBe(0);
    expect(v.prerelease).toBeNull();
  });

  it('parses with v prefix', () => {
    const v = parse('v1.2.3');
    expect(v.major).toBe(1);
    expect(v.minor).toBe(2);
    expect(v.patch).toBe(3);
  });

  it('parses pre-release', () => {
    const v = parse('1.0.0-alpha.1');
    expect(v.prerelease).toBe('alpha.1');
  });

  it('throws on invalid', () => {
    expect(() => parse('not-a-version')).toThrow();
    expect(() => parse('1.2')).toThrow();
  });
});

describe('stage', () => {
  it('0.1.x = poc', () => expect(stage(parse('0.1.0'))).toBe('poc'));
  it('0.1.5 = poc', () => expect(stage(parse('0.1.5'))).toBe('poc'));
  it('0.2.0 = alpha', () => expect(stage(parse('0.2.0'))).toBe('alpha'));
  it('0.4.9 = alpha', () => expect(stage(parse('0.4.9'))).toBe('alpha'));
  it('0.5.0 = beta', () => expect(stage(parse('0.5.0'))).toBe('beta'));
  it('0.9.9 = beta', () => expect(stage(parse('0.9.9'))).toBe('beta'));
  it('1.0.0 = stable', () => expect(stage(parse('1.0.0'))).toBe('stable'));
  it('2.3.1 = stable', () => expect(stage(parse('2.3.1'))).toBe('stable'));
});

describe('bump', () => {
  it('patch: 0.1.0 → 0.1.1', () => {
    expect(format(bump(parse('0.1.0'), 'patch'))).toBe('0.1.1');
  });

  it('minor: 0.1.3 → 0.2.0', () => {
    expect(format(bump(parse('0.1.3'), 'minor'))).toBe('0.2.0');
  });

  it('major: 0.9.5 → 1.0.0', () => {
    expect(format(bump(parse('0.9.5'), 'major'))).toBe('1.0.0');
  });

  it('major: 1.2.3 → 2.0.0', () => {
    expect(format(bump(parse('1.2.3'), 'major'))).toBe('2.0.0');
  });

  it('patch: 1.0.0 → 1.0.1', () => {
    expect(format(bump(parse('1.0.0'), 'patch'))).toBe('1.0.1');
  });
});

describe('graduate', () => {
  it('poc → alpha: 0.1.x → 0.2.0', () => {
    expect(format(bump(parse('0.1.5'), 'graduate'))).toBe('0.2.0');
  });

  it('alpha → beta: 0.3.2 → 0.5.0', () => {
    expect(format(bump(parse('0.3.2'), 'graduate'))).toBe('0.5.0');
  });

  it('beta → stable: 0.7.3 → 1.0.0', () => {
    expect(format(bump(parse('0.7.3'), 'graduate'))).toBe('1.0.0');
  });

  it('stable → next major: 1.4.2 → 2.0.0', () => {
    expect(format(bump(parse('1.4.2'), 'graduate'))).toBe('2.0.0');
  });
});

describe('nextOptions', () => {
  it('shows options for poc', () => {
    const opts = nextOptions(parse('0.1.0'));
    expect(opts.length).toBeGreaterThanOrEqual(2);
    expect(opts.some(o => o.type === 'patch')).toBe(true);
    expect(opts.some(o => o.type === 'minor')).toBe(true);
  });

  it('shows major option only for stable', () => {
    const pocOpts = nextOptions(parse('0.1.0'));
    expect(pocOpts.some(o => o.type === 'major')).toBe(false);

    const stableOpts = nextOptions(parse('1.0.0'));
    expect(stableOpts.some(o => o.type === 'major')).toBe(true);
  });
});
