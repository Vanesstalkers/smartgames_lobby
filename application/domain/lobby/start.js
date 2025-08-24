async () => {
  if (application.worker.id === 'W1') {
    db.redis.handlers.afterStart(async () => {
      await db.redis.flushDb(); // тут список игроков online и список загруженных игр
    });

    db.mongo.handlers.afterStart(async () => {
      const lobby = new domain.lobby.class();
      const code = 'main';
      await lobby.load({ fromDB: { query: { code } } }).catch(async (err) => {
        if (err !== 'not_found') throw err; // любая ошибка, кроме ожидаемой "not_found";
        await lobby.create({ code });
      });
      db.redis.handlers.afterStart(async () => {
        await db.redis.set('lobbyData', { channelName: lobby.channelName() }, { json: true });
      });

      return;

      try {
        const { Midjourney } = npm.midjourney;
        const client = new Midjourney(config.midjourney);
        await client.init();
        lobby.midjourneyClient(client);
      } catch (err) {
        console.log(err);
      }

      return; // отключил до отладки

      const TelegramBot = npm['node-telegram-bot-api'];
      const bot = new TelegramBot(config.telegram.botToken, { polling: true });
      await bot
        .setMyCommands([
          {
            command: '/games',
            description: 'Список игр',
          },
          {
            command: '/watch',
            description: 'Отслеживать новый игры',
          },
        ])
        .then(() => {
          console.log('TelegramBot started.');
        })
        .catch((err) => {
          console.error('!!! TelegramAPI setMyCommands error');
          throw err?.message;
        });
      bot.onText(/\/watch(@|\s|\b)(?!\w)/, async (msg, match) => {
        const {
          from: { id, username, is_bot },
        } = msg;

        if (is_bot) return;
        await lobby.startWatching({ telegramId: id, telegramUsername: username });
      });
      lobby.telegramBot(bot);
    });
  }
};
