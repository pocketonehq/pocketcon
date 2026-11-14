// Offers moved to the attendee dashboard; keep old links working.
module.exports = {
  get(ctx) {
    return ctx.res.redirect('/dashboard#offers', { status: 301 })
  },
}
