/// <reference path="../pb_data/types.d.ts" />

// After-hours deep dives: each attendee picks the ones they'd stay for (users.deep_dives, set on their own record from
// the dashboard). Organizers read the totals in the deep_dive_tally view. The values are the ids in
// pb_pages/_private/ideas.js.

const IDS = ['mcp', 'agent', 'hooks', 'pages', 'pitr', 'multi', 'desktop', 'extensions']

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new SelectField({ name: 'deep_dives', maxSelect: IDS.length, values: IDS }))
    app.save(users)

    const tally = new Collection({
      type: 'view',
      name: 'deep_dive_tally',
      listRule: '@request.auth.organizer = true',
      viewRule: '@request.auth.organizer = true',
      viewQuery:
        "SELECT j.value AS id, COUNT(*) AS votes FROM users u, json_each(CASE WHEN json_valid(u.deep_dives) THEN u.deep_dives ELSE '[]' END) j GROUP BY j.value",
    })
    app.save(tally)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('deep_dive_tally'))
    } catch (_) {}
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('deep_dives')
    app.save(users)
  }
)
