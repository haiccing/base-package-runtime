# test/deployed/

The package's own test of what it brings to an mrepo, deployed: an install of the test's own, floating.

A work folder in the temporary folder; the boot run from the sources;
this package deployed as a child by a request. What a deploy lays in
from the package's structure is checked where it landed, and its
runtime asked for real. Its runtimes stopped and the folder removed.

## What it checks

- **Deployed as a child**, by a request, as the `haicc` command would.
- **Its `avro` layer**, read in the child's repository: the three
  essential types at their URIs and no other, each the bytes of the
  package's `types/`; its config, `non-atomic`; no folder of it on
  disk.
- **Every mrepo this package is in**: the boot mrepo and the schema
  registry hold the same three.
- **A request through its runtime**: taken in, done; one with a field
  its type does not name refused at its inbox, by the type it holds.
- **Its validation tests**, run in it (`validate-in-situ`): passed.
- **Torn down**, nothing left running.

## Sources

`SOURCES`: the sources folder, with the boot component's bundle and the
packages' (after `tools/release.js`; the pre-release sets it). Skipped
without them.

## Not here

The runtime alone, with no boot and no other package: the `start` test.
