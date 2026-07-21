# Decantr 3.9 Qualification Packet

This directory is an intentionally incomplete release-qualification packet. It does not establish that Decantr 3.9 meets any frozen quantitative gate.

- `qualification-packet.schema.json` defines the active packet and evidence shapes.
- `qualification-packet.json` is the active, currently incomplete packet.
- `missing-evidence.json` is the machine-readable blocking-evidence inventory and must match the audit's derived missing IDs.
- `release-waiver.json` authorizes stable 3.9.4 publication by the sole human maintainer while leaving the exact four human finding requirements missing and every qualification/adoption claim false.
- `HUMAN-REVIEW.md` defines the two-person blind review and adjudication workflow.
- `review/` contains blank, fail-closed human-review and replay workbooks. Blank slots are workflow inputs, never evidence.
- `compatibility-manifest.json` freezes compatibility, the complete adoption write boundary, and the complete measurement protocol.
- `machineReplay` retains every non-human quantitative gate; unit-test success alone cannot replace its raw samples and cross-surface evidence.
- `route-source-labels.json` and `finding-labels.json` preserve the rejected 84/24/200 draft as `legacy-unqualified`. Their rows cannot count toward a gate.

Validate packet structure without making a qualification claim:

    node scripts/audit-3-9-qualification-baseline.mjs --lint-only

Generate the non-human route and machine evidence from final 3.9 packages:

    pnpm qualification:3-9:route
    pnpm qualification:3-9:machine

The route command installs the exact six packed packages and replays every frozen corpus ID once, in order: 84 unique cases with no omissions and exactly 24 genuine competing forbidden sources. The machine command installs the same six tarballs, creates 270 isolated target states, checks the adoption write boundary, and probes CLI, MCP, CI, content, and all Studio modes. Both commands write SHA-256-addressed artifacts whose behavior bindings include the tarball set; a partial run leaves the packet unchanged.

Prepare and validate the human finding lane:

    node scripts/prepare-3-9-human-review.mjs --help
    pnpm qualification:3-9:human:lint

The kit requires exactly two distinct real people, 200 independent judgments, signed adjudication, and public 3.8.3 plus final packed 3.9.4 replays. Its canonical signing-payload commands bind reviewer identity, corpus bytes, every decision/rationale, reviewer-workbook hashes, and final resolutions. Follow the staged commands; do not import the quarantined legacy labels, represent an agent as a reviewer, or hand-edit generated packet fragments. After all signed workbooks and replays are complete, `pnpm qualification:3-9:human` must pass before assembly and packet integration.

Run the release qualification gate:

    node scripts/audit-3-9-qualification-baseline.mjs

The default command must exit nonzero with `INCOMPLETE` until the machine-readable missing-evidence list is empty. `--json` emits the same state on stdout even when the qualification claim gate exits nonzero.

Run the separate publication gate with `pnpm audit:3-9-release-gate`. It accepts the incomplete packet only when route, machine, adoption/Studio, package, and provenance evidence is complete and the missing-evidence list exactly matches the version-bound sole-maintainer waiver. A pass in this mode means publishable but unqualified; it does not authorize human precision, recall, release-qualification, or adoption-proven language.

Complete replay claims are content-addressed, not prose attestations. The audit resolves each artifact path inside the repository, requires the digest in its filename, verifies its SHA-256 and successful exit code, checks exact package and tarball identity, recomputes the package-plus-behavior binding, and requires the retained artifact's cases, targets, metrics, command, environment, and timestamp to match the packet. Executable-oracle source evidence receives the same path and hash checks.

Human review and adjudication payloads are signature-verified against the current workbooks and packet fragment, and external source snapshots are resolved against the exact GitHub commit tree. Placeholder commits, identity-only attestations, unsigned decisions, stale workbook hashes, broken adjudication linkage, and unresolvable blob claims fail qualification even when their field shapes are valid.
