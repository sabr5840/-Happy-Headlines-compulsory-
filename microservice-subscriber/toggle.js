// toggle.js – in-memory runtime toggle
let enabled = (process.env.SUBSCRIBER_ENABLED !== 'false');

function isEnabled() { return enabled; }
function setEnabled(next) { enabled = !!next; }

module.exports = { isEnabled, setEnabled };
