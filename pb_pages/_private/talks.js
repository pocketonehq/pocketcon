// Public view of accepted talk proposals: the agenda and the talk pages.
// Reads with the app directly (proposals are owner-only in the API) and returns only public fields.

const KINDS = { talk: 'Presentation', lightning: 'Lightning talk', demo: 'Live demo' }

// The speaker's avatar from their users record, as a public file URL ('' when there's none).
// users.avatar isn't a protected file, so anonymous visitors can load it; the user id is the only thing it reveals.
function avatarUrl(app, userId) {
  if (!userId) return ''
  try {
    const u = app.findRecordById('users', userId)
    const file = u.getString('avatar')
    return file ? `/api/files/users/${u.id}/${encodeURIComponent(file)}?thumb=160x160` : ''
  } catch (_) {
    return ''
  }
}

// "Samuel Wyndham" -> "SW", for when there's no avatar.
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2)
  return letters.toUpperCase()
}

function toPublic(app, r) {
  return {
    id: r.id,
    kind: KINDS[r.getString('format')] || 'Presentation',
    title: r.getString('title'),
    speaker: r.getString('name'),
    avatar: avatarUrl(app, r.getString('user')),
    initials: initials(r.getString('name')),
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
  return app.findRecordsByFilter('talk_proposals', 'status = "accepted"', 'sort,created', 100, 0).map((r) => toPublic(app, r))
}

// One accepted talk by id, or null (unknown, or not accepted).
function find(app, id) {
  try {
    const r = app.findRecordById('talk_proposals', id)
    return r.getString('status') === 'accepted' ? toPublic(app, r) : null
  } catch (_) {
    return null
  }
}

module.exports = { accepted, find }
