(class SmartGamesLobby extends lib.lobby.Class() {
  gameServers = {};
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

  #telegramBot;
  #midjourneyClient;

  constructor(data, config = {}) {
    super(data, { ...config, chatEnabled: false });
  }

  async processData(data, broadcaster) {
    const lobbyMap = data.lobby;
    if (lobbyMap) {
      for (const [id, lobby] of Object.entries(lobbyMap)) {
        if (lobby.games) {
          this.set({ games: lobby.games });
          this.checkGameStatuses();
        }
      }
    }

    delete data.lobby;
    super.processData(data, broadcaster);
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

  async gameServerConnected({ code, channelName, ...serverData }) {
    this.set({ gameServers: { [code]: serverData } }, { removeEmptyObject: true });
    await this.saveChanges();
    await this.subscribe(channelName, { rule: 'fields', fields: ['games'] });
  }

  getGameConfig({ gameCode, gameType, gameConfig }) {
    const {
      [gameCode]: {
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
});
