// Public view of accepted talk proposals: the agenda and the talk pages.
// Reads with the app directly (proposals are owner-only in the API) and returns only public fields.

const KINDS = { talk: 'Presentation', lightning: 'Lightning talk', demo: 'Live demo' }

function toPublic(r) {
  return {
    id: r.id,
    kind: KINDS[r.getString('format')] || 'Presentation',
    title: r.getString('title'),
    speaker: r.getString('name'),
    headline: r.getString('headline'),
    abstract: r.getString('abstract'),
    bio: r.getString('bio'),
    links: r
      .getString('links')
      .split(/[\s,]+/)
      .filter((l) => /^https?:\/\/\S+$/i.test(l)),
  }
}

function accepted(app) {
  return app.findRecordsByFilter('talk_proposals', 'status = "accepted"', 'sort,created', 100, 0).map(toPublic)
}

// One accepted talk by id, or null (unknown, or not accepted).
function find(app, id) {
  try {
    const r = app.findRecordById('talk_proposals', id)
    return r.getString('status') === 'accepted' ? toPublic(r) : null
  } catch (_) {
    return null
  }
}

module.exports = { accepted, find }
