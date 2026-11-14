/// <reference path="../pb_data/types.d.ts" />

// The agenda is built from accepted talk proposals.
// - headline: the speaker's one-line title ("creator of PocketOne"), set by the speaker.
// - sort: agenda order, set by the PocketCon team in the admin (speakers can't set it).

migrate(
  (app) => {
    const proposals = app.findCollectionByNameOrId('talk_proposals')
    proposals.fields.add(new TextField({ name: 'headline', max: 120 }))
    proposals.fields.add(new NumberField({ name: 'sort', onlyInt: true }))
    proposals.createRule =
      '@request.auth.id != "" && @request.body.user = @request.auth.id' +
      ' && @request.body.status:isset = false && @request.body.sort:isset = false'
    proposals.updateRule =
      'user = @request.auth.id && @request.body.user:isset = false' +
      ' && @request.body.status:isset = false && @request.body.sort:isset = false' +
      ' && status != "accepted" && status != "declined"'
    app.save(proposals)
  },
  (app) => {
    const proposals = app.findCollectionByNameOrId('talk_proposals')
    proposals.fields.removeByName('headline')
    proposals.fields.removeByName('sort')
    proposals.createRule =
      '@request.auth.id != "" && @request.body.user = @request.auth.id && @request.body.status:isset = false'
    proposals.updateRule =
      'user = @request.auth.id && @request.body.user:isset = false && @request.body.status:isset = false' +
      ' && status != "accepted" && status != "declined"'
    app.save(proposals)
  }
)
