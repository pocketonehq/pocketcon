/// <reference path="../pb_data/types.d.ts" />

// PocketCon's token scopes (PocketOne ext/tokens). An agent connecting to /mcp can be limited to some of them on the
// consent page, and so can an API token: each scope opens one collection's records API for some methods. The
// collections' API rules still decide what each account sees and changes. Skipped where the server has no tokens.

if (typeof $tokens !== 'undefined') {
  const recs = (c) => [`/api/collections/${c}/records`]

  $tokens.registerScope({ name: 'pocketcon:talks_read', description: 'See talk proposals', paths: recs('talk_proposals'), methods: ['GET'] })
  $tokens.registerScope({
    name: 'pocketcon:talks_write',
    description: 'Propose and edit talks (the team: accept and order them)',
    paths: recs('talk_proposals'),
    methods: ['POST', 'PATCH'],
  })
  $tokens.registerScope({ name: 'pocketcon:sponsors_read', description: 'See sponsorship inquiries', paths: recs('sponsor_inquiries'), methods: ['GET'] })
  $tokens.registerScope({
    name: 'pocketcon:sponsors_write',
    description: 'Change sponsorship inquiries (the team)',
    paths: recs('sponsor_inquiries'),
    methods: ['PATCH'],
  })
  $tokens.registerScope({ name: 'pocketcon:offers_read', description: 'See attendee offers', paths: recs('offers'), methods: ['GET'] })
  $tokens.registerScope({
    name: 'pocketcon:offers_write',
    description: 'Add and change attendee offers (the team)',
    paths: recs('offers'),
    methods: ['POST', 'PATCH'],
  })
}
