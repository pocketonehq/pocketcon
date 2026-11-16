/// <reference path="../pb_data/types.d.ts" />

// PocketCon's MCP tools (PocketOne ext/mcp). Each wraps a REST endpoint and runs as whoever signed in to /mcp, so the
// collections' API rules decide what each caller gets: one tool per action, for speakers and organizers alike.
// Skipped where the server has no MCP endpoint ($mcp undefined).

if (typeof $mcp !== 'undefined') {
  const talkFields = {
    title: { type: 'string', description: 'Talk title (3–140 characters).' },
    format: { type: 'string', enum: ['talk', 'lightning', 'demo'], description: 'talk, lightning (5 min) or demo.' },
    abstract: { type: 'string', description: 'What the talk is about (20–2000 characters).' },
    headline: { type: 'string', description: 'Speaker one-liner shown on the agenda, e.g. "creator of PocketOne".' },
    bio: { type: 'string', description: 'About the speaker.' },
    links: { type: 'string', description: 'URLs, one per line.' },
    name: { type: 'string', description: 'Speaker name (default: the account name).' },
    email: { type: 'string', description: 'Speaker email (default: the account email).' },
  }

  $mcp.addEndpoint({
    name: 'pocketcon_list_talks',
    title: 'List talks',
    description:
      'List talk proposals, newest first. Speakers see their own; organizers (the PocketCon team) see all. Status "" means submitted.',
    method: 'GET',
    path: '/api/collections/talk_proposals/records',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['', 'reviewing', 'accepted', 'waitlisted', 'declined'] },
        userEmail: { type: 'string', description: "Only this speaker's talks (organizers)." },
      },
      additionalProperties: false,
    },
    request: ({ args, request }) => {
      const filters = []
      if (args.status !== undefined) filters.push(`status = ${JSON.stringify(args.status)}`)
      if (args.userEmail) filters.push(`user.email = ${JSON.stringify(args.userEmail)}`)
      return {
        ...request,
        query: { sort: 'sort,-created', perPage: 100, filter: filters.join(' && '), expand: 'user', fields: '*,expand.user.email' },
      }
    },
    response: ({ status, json, body }) => {
      if (status !== 200) throw new Error(body)
      return {
        talks: json.items.map((t) => ({
          id: t.id,
          title: t.title,
          format: t.format,
          status: t.status || 'submitted',
          sort: t.sort,
          speaker: t.name,
          headline: t.headline,
          account: t.expand?.user?.email,
          created: t.created,
        })),
      }
    },
  })

  $mcp.addEndpoint({
    name: 'pocketcon_propose_talk',
    title: 'Propose a talk',
    description:
      "Propose a talk for PocketCon 2027. It's yours by default; organizers can pass user (a users record id, find it with pb_list_records on users) to add a talk for someone else.",
    method: 'POST',
    path: '/api/collections/talk_proposals/records',
    inputSchema: {
      type: 'object',
      required: ['title', 'format', 'abstract'],
      properties: { ...talkFields, user: { type: 'string', description: 'Team only: the speaker account id.' } },
      additionalProperties: false,
    },
    request: ({ args, auth, request }) => {
      const body = { ...args }
      if (!body.user) body.user = auth?.id
      if (!body.name && !args.user) body.name = auth?.getString('name') || ''
      if (!body.email && !args.user) body.email = auth?.email() || ''
      return { ...request, body }
    },
  })

  $mcp.addEndpoint({
    name: 'pocketcon_edit_talk',
    title: 'Edit a talk',
    description:
      "Change a talk proposal's fields. Speakers can edit their own until it's accepted or declined; organizers can edit any.",
    method: 'PATCH',
    path: '/api/collections/talk_proposals/records/{id}',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string', description: 'Talk id (from pocketcon_list_talks).' }, ...talkFields },
      additionalProperties: false,
    },
  })

  $mcp.addEndpoint({
    name: 'pocketcon_set_talk_status',
    title: 'Set talk status',
    description:
      'Organizers: accept, waitlist or decline a talk, and set its agenda order (sort, ascending; accepted talks appear on the agenda and get a public page at /talks/ID).',
    method: 'PATCH',
    path: '/api/collections/talk_proposals/records/{id}',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        status: { type: 'string', enum: ['', 'reviewing', 'accepted', 'waitlisted', 'declined'] },
        sort: { type: 'integer', description: 'Agenda position (e.g. 10, 20, 30).' },
      },
      additionalProperties: false,
    },
  })

  $mcp.addEndpoint({
    name: 'pocketcon_list_sponsor_inquiries',
    title: 'List sponsor inquiries',
    description: 'Sponsorship inquiries, newest first. Companies see their own; organizers see all.',
    method: 'GET',
    path: '/api/collections/sponsor_inquiries/records',
    request: ({ request }) => ({ ...request, query: { sort: '-created', perPage: 100 } }),
  })

  $mcp.addEndpoint({
    name: 'pocketcon_set_sponsor_status',
    title: 'Set sponsor status',
    description: 'Organizers: move a sponsorship inquiry to talking, confirmed or declined.',
    method: 'PATCH',
    path: '/api/collections/sponsor_inquiries/records/{id}',
    inputSchema: {
      type: 'object',
      required: ['id', 'status'],
      properties: { id: { type: 'string' }, status: { type: 'string', enum: ['', 'talking', 'confirmed', 'declined'] } },
      additionalProperties: false,
    },
  })

  $mcp.addEndpoint({
    name: 'pocketcon_list_offers',
    title: 'List offers',
    description: 'Attendee offers. Signed-in attendees see the active ones; organizers see all.',
    method: 'GET',
    path: '/api/collections/offers/records',
    request: ({ request }) => ({ ...request, query: { sort: 'sort,created', perPage: 100 } }),
  })

  const offerFields = {
    title: { type: 'string' },
    description: { type: 'string' },
    url: { type: 'string', description: 'Where the offer is redeemed.' },
    code: { type: 'string', description: 'Discount code.' },
    cta: { type: 'string', description: 'Button text, e.g. "Get the deal".' },
    sort: { type: 'integer' },
    active: { type: 'boolean', description: 'Shown to attendees.' },
  }

  $mcp.addEndpoint({
    name: 'pocketcon_add_offer',
    title: 'Add an offer',
    description: 'Organizers: add an attendee offer (a sponsor discount, merch, a PocketHost deal).',
    method: 'POST',
    path: '/api/collections/offers/records',
    inputSchema: { type: 'object', required: ['title', 'url'], properties: offerFields, additionalProperties: false },
  })

  $mcp.addEndpoint({
    name: 'pocketcon_edit_offer',
    title: 'Edit an offer',
    description: 'Organizers: change an offer, e.g. set its code or turn it on with active: true.',
    method: 'PATCH',
    path: '/api/collections/offers/records/{id}',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' }, ...offerFields },
      additionalProperties: false,
    },
  })

  $mcp.instructions(
    'PocketCon 2027 is a free online PocketBase conference on Saturday, February 6, 2027. pocketcon_* tools manage talk ' +
      'proposals (the agenda is the accepted talks, ordered by sort), sponsorship inquiries and attendee offers. Organizers (users with organizer = true, set by a superuser) run the ' +
      'conference: they see everything and accept talks; everyone else sees only their own records.'
  )
}
