# Workspace review and adoption guide

Reviewed on 2026-09-05. ControlLoom is a local workspace for engineering and
security teams that want to review controls and evidence through Git.

## Market references and product boundaries

The [NIST OSCAL model](https://pages.nist.gov/OSCAL/) separates catalogs,
implementation and assessment artifacts. ControlLoom currently uses its own
YAML model and spreadsheet imports. OSCAL interoperability is a future feature,
not an implied capability of a Git-native storage format.

The practical product direction is to make the next evidence review easy:
show what lacks mappings, what needs review, and which source references support
a reviewer-assigned status. A mapping count is not a compliance score.

## New workspace overview

The home screen displays three disjoint groups across the complete catalog:

- **Without mappings:** no mapping references the control.
- **Need review:** mappings exist, but at least one lacks a nonblank source
  location or is not marked `verified`.
- **Marked verified:** every mapping has a source reference and a `verified`
  status. The overview does not fetch, hash or validate source contents.

The first five controls needing attention link directly to their detail pages.
Mappings referencing missing controls are reported separately. Duplicate
control identifiers cannot inflate summary totals. Empty and disconnected
workspaces show their actual state instead of a fabricated score.

## Dependency security

The lockfile includes patched `fast-uri`, `qs` and `nanoid` versions for the
open dependency advisories identified in this review. Version-range overrides
cover vulnerable transitive resolutions. `pnpm audit` reports no known
vulnerabilities for this lockfile at review time; this is a dated registry check.

## Startup and navigation reliability

The distributed CLI keeps npm packages external to its ESM bundle, allowing
Node to load CommonJS dependencies correctly. CI starts the built executable
in a temporary workspace, requests its UI and proves an untrusted write is
rejected. The built UI keeps the selected server port for WebSockets. The workspace no longer waits indefinitely for a camelCase schema when snake_case metadata is supplied. Incoming schemas are
normalized before detail components read them. The browser smoke test follows
an overview link and reloads the control page to prevent regression.

## Local access model

The API binds to `localhost`. HTTP requests and WebSocket upgrades validate
the local Host and browser Origin before access to workspace data. The accepted
UI origins are HTTP loopback addresses (`localhost`, `127.0.0.1`, `[::1]`) on the
API port or the documented Vite development port `5173`. Open the application
using the printed localhost URL. Other development ports are intentionally
rejected. WebSocket messages are limited to 1 MiB.

Local CLI clients may omit Origin. A cross-site browser request without Origin
is rejected when Fetch Metadata identifies it as cross-site. Host validation
also prevents an arbitrary DNS hostname from being accepted as the local API.

This is a local trust boundary, not multi-user authentication. Processes and
other applications on the same machine remain trusted. Shared hosting requires
an authenticated architecture and a separate threat review. CORS alone is not
an access-control mechanism, as the
[Express documentation](https://expressjs.com/en/resources/middleware/cors/)
explains.

## Verification and troubleshooting

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run lint
pnpm test
pnpm run build
pnpm exec playwright install chromium
CONTROLLOOM_BROWSER_TEST=1 node --test tests/built-cli.test.mjs
```

Access tests exercise a real local HTTP server and WebSocket upgrade, including
rejected origins, misleading hostnames and allowed local UI requests. Summary
tests cover empty catalogs, partial verification, blank source references,
duplicate IDs and orphaned mappings.

If access returns 403, use the printed localhost URL and the documented Vite
port. A rejected WebSocket upgrade returns 401 through the `ws` library.
If a large edit exceeds the message limit, split the edit into smaller control
or mapping updates. Do not expose the unauthenticated API to a LAN to work
around an origin error.

## Prioritized next milestones

| Priority | Work | Acceptance criterion |
| --- | --- | --- |
| P1 | Confine and atomically persist evidence files | Reject path traversal, symlink escape and filename collisions across every import/write route; simulate interrupted writes without data loss. |
| P1 | Detect stale evidence | Compare stored hashes with local source bytes; distinguish missing, changed, unreadable and unchanged evidence. |
| P1 | Strengthen import feedback | Preview duplicate IDs and invalid mappings before writes, with actionable per-row errors and no partial import. |
| P2 | OSCAL interoperability | Round-trip a documented subset against pinned NIST schemas and show unsupported fields explicitly. |
| P2 | Accessibility and large catalogs | Keyboard-only import/review/export journey, small-screen layouts and measured large-catalog rendering. |

## Rollback

No YAML format or dependency changes are required. Revert the change commit to
restore the prior screen and access behavior. That also removes the local
access protection, so keep any reverted service stopped when it is not needed.
