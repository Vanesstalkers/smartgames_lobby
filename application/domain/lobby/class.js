(class SmartGamesLobby extends lib.lobby.class() {
  gameServers = {};

  #telegramBot;
  #midjourneyClient;

  constructor(data, config = {}) {
    super(data, { ...config, chatEnabled: false });
  }
  telegramBot(bot) {
    if (!bot) return this.#telegramBot;
    this.#telegramBot = bot;
  }
  midjourneyClient(client) {
    if (!client) return this.#midjourneyClient;
    this.#midjourneyClient = client;
  }

  fillRankings() {
    return {
      release: {
        title: 'Релиз',
        rankingMap: {
          richestPlayers: {
            title: 'Самые богатые',
            active: true,
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'money', title: 'Заработано денег' },
            ],
          },
          topPlayers: {
            title: 'Трудоголики',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'win', title: 'Закончено проектов' },
            ],
          },
          // topFreelancers: { title: 'Фрилансеры', headers: [] },
          // arevageCkeckSum: { title: 'Средний чек', headers: [] },
          bestQuality: {
            title: 'Лучшее качество',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'crutch', title: 'Костылей' },
              { code: 'penalty', title: 'Штрафов' },
            ],
          },
          bestT2M: {
            title: 'Лучший time2market',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'totalTime', title: 'Потрачено времени' },
              { code: 'avrTime', title: 'В среднем' },
              // { code: 'totalTime', title: 'Доход в час' },
            ],
          },
        },
      },
      car: {
        title: 'Автопродажи',
        rankingMap: {
          richestPlayers: {
            title: 'Самые богатые',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'money', title: 'Заработано денег' },
            ],
          },
          topPlayers: {
            title: 'Трудоголики',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'win', title: 'Закончено проектов' },
            ],
          },
        },
      },
      bank: {
        title: 'Банк-продаж',
        rankingMap: {
          richestPlayers: {
            title: 'Самые богатые',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'money', title: 'Заработано денег' },
            ],
          },
          topPlayers: {
            title: 'Трудоголики',
            headers: [
              { code: 'games', title: 'Написано проектов' },
              { code: 'win', title: 'Закончено проектов' },
            ],
          },
        },
      },
    };
  }

  async gameServerConnected({ code, ...serverData }) {
    this.set({ gameServers: { [code]: serverData } }, { removeEmptyObject: true });
    await this.saveChanges();
  }

  getGameConfig({ deckType, gameType, gameConfig }) {
    const {
      [deckType]: {
        games: {
          [gameType]: {
            items: {
              [gameConfig]: { teamsCount, playerCount },
            },
          },
        },
      },
    } = this.gameServers;
    return { teamsCount, playerCount };
  }

  rankingSortFunc = {
    'release.richestPlayers': (a, b) => ((a.money || -1) > (b.money || -1) ? -1 : 1),
    'release.topPlayers': (a, b) => ((a.games || -1) > (b.games || -1) ? -1 : 1),
    // 'release.topFreelancers': null,
    'release.bestQuality': (a, b) => ((a.crutch || -1) / (a.games || -1) < (b.crutch || -1) / (b.games || -1) ? -1 : 1),
    'release.bestT2M': (a, b) => ((a.avrTime || -1) < (b.avrTime || -1) ? -1 : 1),
    'car.richestPlayers': (a, b) => ((a.money || -1) > (b.money || -1) ? -1 : 1),
    'car.topPlayers': (a, b) => ((a.games || -1) > (b.games || -1) ? -1 : 1),
    'bank.richestPlayers': (a, b) => ((a.money || -1) > (b.money || -1) ? -1 : 1),
    'bank.topPlayers': (a, b) => ((a.games || -1) > (b.games || -1) ? -1 : 1),
  };

  checkRatings({ initiatorUserId = null, gameType = 'release' } = {}) {
    const game = this.rankings[gameType];
    const rankingList = Object.entries(game.rankingMap).map(([code, ranking]) => ({ ...ranking, code }));
    const rankingsUsersTop = [];
    for (const ranking of rankingList) {
      const users = Object.values(ranking.usersTop || []); // клонирование массива usersTop
      if (initiatorUserId && !users.includes(initiatorUserId)) users.push(initiatorUserId);
      const draftUsersTop = users.map((userId) => ({ ...(this.users[userId].rankings?.[gameType] || {}), userId }));

      const sortFunc = this.rankingSortFunc[`${gameType}.${ranking.code}`];
      const usersTop = sortFunc ?
        draftUsersTop
          .sort(sortFunc)
          .map(({ userId }) => userId)
          .splice(0, 5) : [];

      this.set({
        rankings: {
          [gameType]: { rankingMap: { [ranking.code]: { usersTop } } },
        },
      });

      rankingsUsersTop.push(...usersTop);
    }
    this.set({
      rankingsUsersTop: rankingsUsersTop.filter((val, idx, arr) => arr.indexOf(val) === idx),
    });
  }
});
