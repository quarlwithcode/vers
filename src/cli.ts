#!/usr/bin/env node

/**
 * 🏷️ vers — Opinionated version management
 *
 * Commands:
 *   vers              Show current version + stage
 *   vers next         Show what's next (all bump options)
 *   vers bump patch   Bump patch
 *   vers bump minor   Bump minor
 *   vers bump major   Bump major
 *   vers graduate     Advance to next stage
 *   vers set <ver>    Set version directly
 *   vers stage        Show stage explanation
 */

import { Command } from 'commander';
import { parse, format, stage, stageLabel, stageRange, bump, nextOptions, BumpType } from './version.js';
import { findProject, updateVersion, updateChangelog } from './project.js';

const VERSION = '0.1.0';
const program = new Command();

program
  .name('vers')
  .description('🏷️ Opinionated version management')
  .version(VERSION)
  .option('--json', 'JSON output')
  .option('-d, --dir <path>', 'Project directory');

// ─── Default: show current ────────────────────────────────

program
  .command('now', { isDefault: true })
  .description('Show current version and stage')
  .action(() => {
    const project = findProject(program.opts().dir);
    if (!project) { console.error('  No package.json found'); process.exit(1); }

    const v = parse(project.version);
    const s = stage(v);

    if (program.opts().json) {
      console.log(JSON.stringify({ version: format(v), stage: s, label: stageLabel(s), range: stageRange(s), name: project.name }));
      return;
    }

    console.log(`\n  🏷️  ${project.name || 'unknown'}`);
    console.log(`  Version: ${format(v)}`);
    console.log(`  Stage:   ${stageLabel(s)} (${stageRange(s)})`);
    console.log('');
  });

// ─── Next: show bump options ──────────────────────────────

program
  .command('next')
  .description('Show all possible version bumps')
  .action(() => {
    const project = findProject(program.opts().dir);
    if (!project) { console.error('  No package.json found'); process.exit(1); }

    const v = parse(project.version);
    const options = nextOptions(v);

    if (program.opts().json) {
      console.log(JSON.stringify({ current: format(v), options }));
      return;
    }

    console.log(`\n  Current: ${format(v)} (${stageLabel(stage(v))})\n`);
    console.log(`  ${'Command'.padEnd(22)} ${'Version'.padEnd(12)} Description`);
    console.log(`  ${'─'.repeat(60)}`);
    for (const opt of options) {
      const cmd = opt.type === 'graduate' ? 'vers graduate' : `vers bump ${opt.type}`;
      console.log(`  ${cmd.padEnd(22)} ${opt.version.padEnd(12)} ${opt.description}`);
    }
    console.log('');
  });

// ─── Bump ─────────────────────────────────────────────────

program
  .command('bump <type>')
  .description('Bump version (patch, minor, major)')
  .option('-m, --message <text>', 'Changelog entry')
  .option('--no-git', 'Skip git tag')
  .action((type: string, opts) => {
    if (!['patch', 'minor', 'major'].includes(type)) {
      console.error(`  Invalid bump type: ${type}. Use: patch, minor, major`);
      process.exit(1);
    }

    const project = findProject(program.opts().dir);
    if (!project) { console.error('  No package.json found'); process.exit(1); }

    const v = parse(project.version);
    const next = bump(v, type as BumpType);
    const nextStr = format(next);

    updateVersion(project.path, nextStr);

    const dir = project.path.replace('/package.json', '');
    if (opts.message) {
      updateChangelog(dir, nextStr, opts.message);
    }

    if (program.opts().json) {
      console.log(JSON.stringify({ from: format(v), to: nextStr, type, stage: stage(next) }));
      return;
    }

    const fromStage = stage(v);
    const toStage = stage(next);
    console.log(`\n  ${format(v)} → ${nextStr}`);
    if (fromStage !== toStage) {
      console.log(`  🎓 Stage: ${stageLabel(fromStage)} → ${stageLabel(toStage)}`);
    }
    console.log('');
  });

// ─── Graduate ─────────────────────────────────────────────

program
  .command('graduate')
  .description('Advance to the next stage boundary')
  .option('-m, --message <text>', 'Changelog entry')
  .action((opts) => {
    const project = findProject(program.opts().dir);
    if (!project) { console.error('  No package.json found'); process.exit(1); }

    const v = parse(project.version);
    const next = bump(v, 'graduate');
    const nextStr = format(next);

    updateVersion(project.path, nextStr);

    const dir = project.path.replace('/package.json', '');
    if (opts.message) {
      updateChangelog(dir, nextStr, opts.message);
    }

    if (program.opts().json) {
      console.log(JSON.stringify({ from: format(v), to: nextStr, fromStage: stage(v), toStage: stage(next) }));
      return;
    }

    console.log(`\n  🎓 ${format(v)} → ${nextStr}`);
    console.log(`     ${stageLabel(stage(v))} → ${stageLabel(stage(next))}`);
    console.log('');
  });

// ─── Set ──────────────────────────────────────────────────

program
  .command('set <version>')
  .description('Set version directly')
  .action((version: string) => {
    const project = findProject(program.opts().dir);
    if (!project) { console.error('  No package.json found'); process.exit(1); }

    // Validate
    const v = parse(version);
    updateVersion(project.path, format(v));

    if (program.opts().json) {
      console.log(JSON.stringify({ version: format(v), stage: stage(v) }));
      return;
    }

    console.log(`  Set: ${format(v)} (${stageLabel(stage(v))})`);
  });

// ─── Stage: explain the convention ────────────────────────

program
  .command('stages')
  .description('Show the versioning convention')
  .action(() => {
    if (program.opts().json) {
      console.log(JSON.stringify({
        stages: [
          { range: '0.1.x', stage: 'poc', label: 'POC (proof of concept)' },
          { range: '0.2.x–0.4.x', stage: 'alpha', label: 'Prototype / Alpha' },
          { range: '0.5.x–0.9.x', stage: 'beta', label: 'Beta' },
          { range: '≥ 1.0.0', stage: 'stable', label: 'Stable' },
        ],
      }));
      return;
    }

    console.log(`
  🏷️ Versioning Convention

  Pre-release:
    0.1.x           POC — core idea works
    0.2.x – 0.4.x   Prototype / Alpha — functional but rough, API may change
    0.5.x – 0.9.x   Beta — feature-complete-ish, stabilizing
    1.0.0            First stable release — public API committed

  After 1.0.0 (semver):
    PATCH  1.0.0 → 1.0.1   Bug fixes, no API changes
    MINOR  1.0.0 → 1.1.0   New features, backwards-compatible
    MAJOR  1.0.0 → 2.0.0   Breaking changes

  Pre-release tags:
    1.0.0-alpha.1, 1.0.0-beta.3, 1.0.0-rc.1
`);
  });

program.parse();
