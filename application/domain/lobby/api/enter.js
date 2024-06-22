async (context, { lobbyId }) => {
  const { sessionId } = context.session.state;
  const session = lib.store('session').get(sessionId);
  const user = session.user();

  const lobbyName = `lobby-${lobbyId}`;
  await session.subscribe(lobbyName, { rule: 'vue-store', userId: user.id() });

  session.onClose.push(async () => {
    if (session.lobbyId !== lobbyId) return; // уже вышел из лобби

    await session.unsubscribe(lobbyName);
    session.set({ lobbyId: null });
    await session.saveChanges();

    await user.leaveLobby({ sessionId, lobbyId });
  });
  await user.enterLobby({ sessionId, lobbyId });

  const { gameId, playerId, viewerId } = user;
  if (gameId) {
    let gameLoaded = await db.redis.hget('games', gameId, { json: true });
    if (!gameLoaded) return { status: 'ok' };

    const { deckType, gameType } = gameLoaded;
    const isAlive = await lib.store.broadcaster.publishAction(`game-${gameId}`, 'isAlive');
    if (isAlive) {
      session.set({ gameId, playerId, viewerId, lobbyId });
      await session.saveChanges();

      session.emit('joinGame', { deckType, gameType, gameId, restore: true });
    } else {
      // игра восстановится из БД
      for (const session of user.sessions()) {
        session.emit('joinGame', { deckType, gameType, gameId, restore: true, needLoadGame: true });
      }
    }
  } else {
    session.set({ lobbyId });
    await session.saveChanges();
  }

  return { status: 'ok' };
};
