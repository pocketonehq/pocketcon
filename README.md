# PocketCon 2027

The site for **PocketCon 2027**, a free livestream about PocketBase. Saturday, February 6, 2027, on [Discord](https://discord.gg/XkAetnQEuc).

Live at **https://pocketcon.dev** (also https://pocketcon.pockethost.io).

Built with [PocketPages](https://pocketpages.dev) and hosted on [PocketHost](https://pockethost.io).

## Develop

The site is a [PocketPages v1](https://pocketpages.dev) app (`pb_pages/`) served by the PocketOne binary, which has PocketPages built in. No npm install.

```bash
pocketone superuser upsert admin@example.com password --dir=pb_data
pocketone serve --dev --dir=pb_data --migrationsDir=pb_migrations --publicDir=pb_public --hooksDir=pb_hooks
```

Pages are in `pb_pages` (`+layout.ejs` is the shared header and footer; `_private/event.js` holds the date and links; `_private/splash.svg` is generated from `design/tshirt-v2.html` by `design/splash.py`; the link-preview card `pb_public/og.png` is rendered from `design/og.html` by `design/render.sh`). Static files (CSS, `app.js`, favicon, calendar file) are in `pb_public`. Registration (email, Google, GitHub), talk proposals and attendee offers use the PocketBase JS SDK against the site's own API; the collections and their access rules are in `pb_migrations/`. Proposals are only visible to their owner (and organizers); offers only to signed-in users.

### Talks we'd love to see and after-hours votes

`pb_pages/_private/ideas.js` lists topics shown on `/speak` ("Talks we'd love to see") and on the home page ("After hours"). Attendees pick the after-hours deep dives they'd stay for on their dashboard; the picks are `users.deep_dives`, and organizers read the totals in the `deep_dive_tally` view. Changing a topic id needs a migration (the ids are the field's values).

### Organizers

Organizers run the conference without being superusers: they see every talk proposal, sponsorship inquiry and offer, accept or decline talks, set the agenda order, add talks for speakers, and manage offers. Their screen is `/review` (talk status and agenda order, sponsorship status, after-hours vote totals), linked from the dashboard; the dashboard itself shows only their own records, like everyone's. To make someone an organizer, a superuser opens their record in **users** in the admin dashboard (`/_/`) and turns on `organizer`. Users can't set it themselves, on sign-up or later (`pb_migrations/1794700600_organizers.js`).

### Sign-in setup (`/setup`)

`/setup` turns on GitHub and Google sign-in for the `users` collection. Only superusers can use it (it reuses the admin dashboard's session, so sign in at `/_/` first). To test the GitHub flow without github.com, run the mock and point a dev server at it (the overrides only work with `--dev`):

```bash
python3 dev/mock-github.py 8139
```

```bash
OAUTHSETUP_GITHUB_WEB=http://127.0.0.1:8139 OAUTHSETUP_GITHUB_API=http://127.0.0.1:8139 pocketone serve --dev --dir=pb_data --migrationsDir=pb_migrations --publicDir=pb_public
```

### MCP tools (`pb_hooks/mcp.pb.js`)

On a PocketOne server with MCP (`/mcp`), `pb_hooks/mcp.pb.js` adds PocketCon tools for agents: `pocketcon_list_talks`, `pocketcon_propose_talk`, `pocketcon_edit_talk`, `pocketcon_set_talk_status`, sponsor inquiries and offers. Each wraps one REST endpoint and runs as whoever signed in, so the collection rules decide: speakers propose and edit their own talks until they're accepted; organizers see everything, accept talks and set the agenda order. Where the server has no MCP endpoint the file does nothing.

```bash
claude mcp add --transport http pocketcon http://127.0.0.1:8090/mcp
```

`pb_hooks/scopes.pb.js` registers token scopes (`pocketcon:talks_read`, `pocketcon:talks_write`, and read/write for sponsors and offers). When an agent connects, the consent page offers **Full access** or **Only these**; a connection limited to `pocketcon:talks_read` sees only the tools that read talks, and anything else is refused. The collection rules don't change. Where the server has no API tokens the file does nothing.

## Deploy

Pushes to `main` deploy with `pocketone deploy` (see `.github/workflows/deploy.yml`) to the remote in `.pocketbase/remotes.json`, https://pocketcon.dev. The workflow needs a `POCKETHOST_TOKEN` secret, passed to `pocketone` as `P1_TOKEN`: a PocketHost API token from the dashboard (`pbt_...`, scope `instances` or `instances=<pocketcon's id>`; an older `ph_pat_...` works too), or a pocketcon.dev superuser API token with the `deploy` scope.

By hand, with [PocketOne](https://pocketone.dev) installed:

```bash
pocketone login
pocketone deploy
```

Migrations take effect when the app restarts: `pocketone deploy --restart`, or `pocketone restart` later.

## License

MIT
