/// <reference path="../pb_data/types.d.ts" />

// Talk proposals get a status the PocketCon team sets in the admin (empty = submitted, not reviewed yet).
// Speakers see it on their dashboard but can't set it.

migrate(
  (app) => {
    const proposals = app.findCollectionByNameOrId('talk_proposals')
    proposals.fields.add(
      new SelectField({ name: 'status', maxSelect: 1, values: ['reviewing', 'accepted', 'waitlisted', 'declined'] })
    )
    proposals.createRule =
      '@request.auth.id != "" && @request.body.user = @request.auth.id && @request.body.status:isset = false'
    proposals.updateRule =
      'user = @request.auth.id && @request.body.user:isset = false && @request.body.status:isset = false'
    app.save(proposals)
  },
  (app) => {
    const proposals = app.findCollectionByNameOrId('talk_proposals')
    proposals.fields.removeByName('status')
    proposals.createRule = '@request.auth.id != "" && @request.body.user = @request.auth.id'
    proposals.updateRule = 'user = @request.auth.id && @request.body.user:isset = false'
    app.save(proposals)
  }
)
