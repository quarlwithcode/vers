# 🏷️ vers

Opinionated version management. Know where you are, bump with confidence.

## The Convention

```
0.1.x           POC — core idea works
0.2.x – 0.4.x   Prototype / Alpha — functional but rough
0.5.x – 0.9.x   Beta — feature-complete, stabilizing
1.0.0            Stable — public API committed
```

After 1.0.0: standard semver (MAJOR.MINOR.PATCH).

## Install

```bash
npm install -g vers
```

## Usage

```bash
# Where am I?
vers
#   🏷️  my-project
#   Version: 0.5.2
#   Stage:   Beta (0.5.x–0.9.x)

# What's next?
vers next
#   vers bump patch    0.5.3   Beta iteration
#   vers bump minor    0.6.0   Beta feature add
#   vers graduate      1.0.0   Graduate to Stable

# Bump it
vers bump patch              # 0.5.2 → 0.5.3
vers bump minor              # 0.5.2 → 0.6.0
vers bump major              # 0.5.2 → 1.0.0

# Graduate to next stage
vers graduate                # 0.1.x → 0.2.0 (POC → Alpha)
                             # 0.3.x → 0.5.0 (Alpha → Beta)
                             # 0.7.x → 1.0.0 (Beta → Stable)

# Set directly
vers set 0.5.0

# Show the convention
vers stages

# With changelog
vers bump minor -m "### Added\n- New feature"
```

## Library

```typescript
import { parse, stage, bump, format } from 'vers';

const v = parse('0.5.2');
console.log(stage(v));        // 'beta'

const next = bump(v, 'graduate');
console.log(format(next));    // '1.0.0'
```

## Why

Because every time you bump a version, you shouldn't have to think about what the number means. `vers` encodes the convention so you can focus on building.

## License

MIT
