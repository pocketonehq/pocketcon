// Talks we'd love to see. Anyone can claim one by proposing it at /speak; a claimed topic moves to the main program.
// Topics nobody claims become optional after-hours deep dives, hosted by Ben and picked by attendee votes
// (the users.deep_dives field; organizers read the tally in the deep_dive_tally view).
// Changing an id needs a migration: the ids are the values of users.deep_dives.
module.exports = {
  ideas: [
    { id: 'mcp', title: 'Give your app an /mcp endpoint', blurb: 'Agents call your API as your users, with your rules.' },
    { id: 'agent', title: 'Agents inside your app', blurb: 'A built-in model on the CPU, or any API: answers locked to a JSON schema.' },
    { id: 'hooks', title: 'Modern hooks', blurb: 'async/await, import and TypeScript in pb_hooks.' },
    { id: 'pages', title: 'PocketPages in TSX and TypeScript', blurb: 'Server-rendered pages next to your data, where everything can await.' },
    { id: 'pitr', title: 'Point-in-time restore', blurb: 'Roll a database back to any moment with Litestream.' },
    { id: 'multi', title: 'Hundreds of apps on one box', blurb: 'Isolates and multi-instance hosting.' },
    { id: 'desktop', title: 'Desktop apps from a PocketBase app', blurb: 'One app folder, native builds for every platform.' },
    { id: 'extensions', title: 'Write an extension', blurb: 'Contracts, and sharing what you build.' },
  ],
}
