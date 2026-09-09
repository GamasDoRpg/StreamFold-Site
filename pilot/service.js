/* Frontend integration boundary. No authentication, files, credentials or access
 * decisions are implemented here. Replace with Supabase Auth + server-enforced
 * authorization later. Never place service-role keys or private URLs in this repo.
 */
(() => {
  'use strict';
  class PilotUnavailableError extends Error {
    constructor(message) { super(message); this.name = 'PilotUnavailableError'; this.code = 'PILOT_NOT_CONNECTED'; }
  }
  const unavailable = message => async () => { throw new PilotUnavailableError(message); };
  window.PilotService = Object.freeze({
    mode: 'frontend-only',
    signIn: unavailable('Sign-in is not active yet. No credentials were sent. You can explore the portal preview below.'),
    resetPassword: unavailable('Password reset is not active yet. No email was sent. Contact StreamFold for access.'),
    changePassword: unavailable('Account changes are not active yet. Your password has not been changed.'),
    getDownload: unavailable('Downloads become available after your pilot access is activated.')
  });
})();
