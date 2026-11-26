# own-install

A package deployed on its own, as an mrepo, and its tests run in it.

A package carries what it needs to come up: its list, the packages it
runs with and itself last, and its runtime config. Deployed as the
target, it is an mrepo of its own; there its resources are reached and
its validation tests run, by a request, where it runs: what the
platform does to check an install's health (`base-docs-package`, "The
rules"). Here the runtime package itself: an mrepo with a runtime, its
info and its help, no other protocol.

## Steps

The script, [steps.haicc](steps.haicc): each line as typed after `haicc`, what it answers under it; run with `howto/run`, shown here at info extraction.

## Notes

- **Any package with a list** is deployed the same way: `boot/deploy
  <position> <org>/<package>`.
- **Its validation tests**, the `validate-in-situ` set: its own (here
  its types) and the two generic ones, its info and its mrepo side as
  the running mrepo holds them. They write nothing.
- **One test alone**: `runtime/run . packages/<org>/<package>/test/<name>`.
- **Torn down**, nothing of it is left.
