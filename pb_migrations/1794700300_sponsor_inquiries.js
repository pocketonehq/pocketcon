/// <reference path="../pb_data/types.d.ts" />

// Sponsorship inquiries from signed-in users. Only visible to their owner (and superusers); status is set by the
// PocketCon team in the admin (empty = received).

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const inquiries = new Collection({
      type: 'base',
      name: 'sponsor_inquiries',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id && @request.body.status:isset = false',
      updateRule: null,
      deleteRule: null,
      fields: [
        { type: 'relation', name: 'user', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true },
        { type: 'text', name: 'company', required: true, max: 120 },
        { type: 'url', name: 'website', required: true },
        { type: 'text', name: 'name', required: true, max: 120 },
        { type: 'email', name: 'email', required: true },
        { type: 'text', name: 'offer', max: 1000 },
        { type: 'text', name: 'message', max: 2000 },
        { type: 'select', name: 'status', maxSelect: 1, values: ['talking', 'confirmed', 'declined'] },
        { type: 'autodate', name: 'created', onCreate: true },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
    })
    app.save(inquiries)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('sponsor_inquiries'))
    } catch (_) {}
  }
)
