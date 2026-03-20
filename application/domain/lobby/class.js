(class SmartGamesLobby extends lib.lobby.Class() {
  gameServers = {};
  gameServerChannels = {};
  // rankingSortFunc = {
  //   'release.richestPlayers': (a, b) => ((a.money || -1) > (b.money || -1) ? -1 : 1),
  //   'release.topPlayers': (a, b) => ((a.games || -1) > (b.games || -1) ? -1 : 1),
  //   // 'release.topFreelancers': null,
  //   'release.bestQuality': (a, b) => ((a.crutch || -1) / (a.games || -1) < (b.crutch || -1) / (b.games || -1) ? -1 : 1),
  //   'release.bestT2M': (a, b) => ((a.avrTime || -1) < (b.avrTime || -1) ? -1 : 1),
  //   'car.richestPlayers': (a, b) => ((a.money || -1) > (b.money || -1) ? -1 : 1),
  //   'car.topPlayers': (a, b) => ((a.games || -1) > (b.games || -1) ? -1 : 1),
  //   'bank.richestPlayers': (a, b) => ((a.money || -1) > (b.money || -1) ? -1 : 1),
  //   'bank.topPlayers': (a, b) => ((a.games || -1) > (b.games || -1) ? -1 : 1),
  // };

  #telegramBot;
  #midjourneyClient;

  constructor(data, config = {}) {
    super(data, { ...config, chatEnabled: false });
  }

  updateRankings() {
    // do nothing
  }

  async processData(data, broadcasterChannelName) {
    const lobbyMap = data.lobby;
    const serviceCode = this.gameServerChannels?.[broadcasterChannelName]?.code;

    if (lobbyMap) {
      for (const [id, lobby] of Object.entries(lobbyMap)) {
        if (lobby.games) {
          this.set({ games: lobby.games });
          this.checkGameStatuses();
        }
        if (lobby.rankings && serviceCode) {
          // Игровой сервис присылает плоский rankings (без appCode),
          // в портале храним с уровнем сервиса: rankings[serviceCode] = ...
          this.set({ rankings: { [serviceCode]: lobby.rankings } });
        }
        if (lobby.rankingsUsersTop) this.set({ rankingsUsersTop: lobby.rankingsUsersTop });
      }
    }

    delete data.lobby;
    await super.processData(data, broadcasterChannelName);
  }

  telegramBot(bot) {
    if (!bot) return this.#telegramBot;
    this.#telegramBot = bot;
  }
  midjourneyClient(client) {
    if (!client) return this.#midjourneyClient;
    this.#midjourneyClient = client;
  }

  async gameServerConnected({ code, channelName, ...serverData }) {
    const gameServers = { [code]: serverData };
    const gameServerChannels = { [channelName]: { code } };
    this.set({ gameServers, gameServerChannels }, { removeEmptyObject: true });

    await this.saveChanges();
    // Помимо списка игр (games) нужно получать ещё и рассчитанные top-рейтинги (rankings)
    await this.subscribe(channelName, { rule: 'fields', fields: ['games', 'rankings', 'rankingsUsersTop'] });
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
