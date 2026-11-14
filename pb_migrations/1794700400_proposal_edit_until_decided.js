/// <reference path="../pb_data/types.d.ts" />

// Speakers can edit their own talk proposals until the team accepts or declines them.

migrate(
  (app) => {
    const proposals = app.findCollectionByNameOrId('talk_proposals')
    proposals.updateRule =
      'user = @request.auth.id && @request.body.user:isset = false && @request.body.status:isset = false' +
      ' && status != "accepted" && status != "declined"'
    app.save(proposals)
  },
  (app) => {
    const proposals = app.findCollectionByNameOrId('talk_proposals')
    proposals.updateRule =
      'user = @request.auth.id && @request.body.user:isset = false && @request.body.status:isset = false'
    app.save(proposals)
  }
)
