import { query } from "./_generated/server";

export const checkAuthTables = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const accounts = await ctx.db.query("authAccounts").collect();
    const sessions = await ctx.db.query("authSessions").collect();
    return {
      usersCount: users.length,
      accountsCount: accounts.length,
      sessionsCount: sessions.length,
      users: users.map(u => ({ id: u._id, email: u.email })),
    };
  },
});
