/// <reference path="../pb_data/types.d.ts" />

// Organizers: PocketCon team members who review talks, sponsorship inquiries and offers without being superusers.
// A user is an organizer when `organizer` is true on their users record. Only a superuser sets it (in the admin):
// users can't set it on sign-up or on their own record.
//
// Organizers can, on top of what every user can:
// - talk_proposals: see every proposal; create one for any speaker; edit any, including status (accept, waitlist,
//   decline) and sort (agenda order), even after it's accepted or declined.
// - sponsor_inquiries: see every inquiry and set its status.
// - offers: see every offer (active or not), add and edit them.
// - users: see every account (to find a speaker when adding a talk for them).

const ORG = '@request.auth.organizer = true'
const GUARD = '@request.body.organizer:isset = false'

// A rule as a plain string, or null when it's locked (superusers only).
const norm = (rule) => (rule === null || rule === undefined ? null : String(rule).trim())
// orRule widens a rule to organizers; a locked rule becomes organizers only; an open rule ('') stays open.
const orRule = (rule) => {
  const r = norm(rule)
  return r === null ? ORG : r === '' ? '' : `(${r}) || ${ORG}`
}
// guardRule keeps users from setting `organizer`, whatever the rule is today (a locked rule stays locked).
const guardRule = (rule) => {
  const r = norm(rule)
  return r === null ? null : r === '' ? GUARD : `(${r}) && ${GUARD}`
}

const RULES = ['listRule', 'viewRule', 'createRule', 'updateRule']

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new BoolField({ name: 'organizer' }))
    users.createRule = guardRule(users.createRule)
    users.updateRule = guardRule(users.updateRule)
    users.listRule = orRule(users.listRule)
    users.viewRule = orRule(users.viewRule)
    app.save(users)

    for (const name of ['talk_proposals', 'sponsor_inquiries', 'offers']) {
      const c = app.findCollectionByNameOrId(name)
      for (const r of RULES) c[r] = orRule(c[r])
      app.save(c)
    }
  },
  (app) => {
    const strip = (raw) => {
      const rule = norm(raw)
      if (rule === ORG) return null
      if (rule === null) return null
      for (const tail of [` || ${ORG}`, ` && ${GUARD}`]) {
        if (rule.endsWith(tail)) return rule.slice(1, -(tail.length + 1)) // drop "(" ... ")" + tail
      }
      return rule === GUARD ? '' : rule
    }
    const users = app.findCollectionByNameOrId('users')
    for (const r of RULES) users[r] = strip(users[r])
    users.fields.removeByName('organizer')
    app.save(users)
    for (const name of ['talk_proposals', 'sponsor_inquiries', 'offers']) {
      const c = app.findCollectionByNameOrId(name)
      for (const r of RULES) c[r] = strip(c[r])
      app.save(c)
    }
  }
)
