// Works out what role (if any) a user has on a document.
// Returns 'owner', 'editor', 'viewer', or null if the user has no access.
function getRole(doc, userId) {
  const uid = String(userId);

  if (String(doc.owner) === uid) return 'owner';

  const share = doc.sharedWith.find((entry) => String(entry.user) === uid);
  return share ? share.role : null;
}

function canRead(role) {
  return role === 'owner' || role === 'editor' || role === 'viewer';
}

function canWrite(role) {
  return role === 'owner' || role === 'editor';
}

module.exports = { getRole, canRead, canWrite };
