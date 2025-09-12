
//lost in refreshing server.  personal thoughts from Dennis:
// In production, best to be kept in a database probably, keeping local map to reduce db calls
// probably store each in a schema with expiresAt setting or something?  Will try to implement if I have time

export const loggedOutTokens = new Map();
export const loggedOutRefresh = new Map();

//clean up short term terokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of loggedOutTokens.entries()) {
    if (now > timestamp) {
      loggedOutTokens.delete(token);
    }
  }
}, 5 * 60 * 1000); 

//clean up long term tokens every day
setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of loggedOutRefresh.entries()) {
    if (now > timestamp) {
      loggedOutRefresh.delete(token);
    }
  }
}, 60 * 24 * 60 * 1000); 
