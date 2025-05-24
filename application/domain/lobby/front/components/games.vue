<template>
  <div :class="['games', bigConfig ? 'big-config' : '']">
    <div class="new-game-controls">
      <div class="breadcrumbs">
        <span :class="['select-btn', deckType ? 'active selected' : '']"
          @click="selectGameConfig(null), selectGameType(null), selectDeckType(null)">
          {{ deckMap[deckType]?.title || 'Выбор колоды:' }}
        </span>
        <span v-if="deckType" :class="['select-btn', gameType ? 'active selected' : '']"
          @click="selectGameConfig(null), selectGameType(null)">
          {{ gameTypeMap[gameType]?.title || 'Выбор типа игры:' }}
        </span>
        <span v-if="gameType" :class="['select-btn', gameConfig ? 'active selected' : '']"
          @click="selectGameConfig(null)">
          {{ gameConfigMap[gameConfig] ? gameConfigMap[gameConfig].title : 'Выбор режима:' }}
        </span>
      </div>
      <div v-if="!deckType" class="game-types">
        <div v-for="[code, game] in gameDeckList" :key="code"
          :class="['select-btn', 'wait-for-select', game.active === false ? 'disabled' : '']"
          @click="selectDeckType(code)">
          <div class="title"><font-awesome-icon :icon="game.icon" /> {{ game.title }}</div>
        </div>
      </div>

      <div v-if="!gameType" :class="['game-block', `${deckType}-game`]">
        <div v-for="[code, game] in gameTypeList" :key="code"
          :class="['select-btn', 'wait-for-select', code, game.active === false ? 'disabled' : '']"
          :style="game.style || {}" @click="selectGameType(code)">
          <font-awesome-icon :icon="game.icon" /> {{ game.title }}
        </div>
      </div>

      <div v-if="!gameConfig" :class="['game-config-block', `${deckType}-game-config`]">
        <div v-for="[code, config] in gameConfigList" :key="code" :class="['select-btn', 'wait-for-select', code]"
          :style="config.style || {}" v-on:click="selectGameConfig(code)">
          {{ config.title }}
        </div>
      </div>

      <div v-if="gameConfig" class="game-start-block">
        <div v-if="teamsCount.val" class="player-count-config">
          <div>
            <span class="controls">
              <font-awesome-icon :icon="['fas', 'plus']" @click="updateTeamsCount(1)" />
              {{ teamsCount.val }}
              <font-awesome-icon :icon="['fas', 'minus']" @click="updateTeamsCount(-1)" />
            </span>
            <span class="label"> всего команд</span>
          </div>
        </div>
        <div>
          <span class="controls">
            <font-awesome-icon :icon="['fas', 'plus']" @click="updateGameTimer(15)" />
            {{ gameTimer }}
            <font-awesome-icon :icon="['fas', 'minus']" @click="updateGameTimer(-15)" />
          </span>
          <span class="label"> секунд на ход</span>
        </div>
        <button class="select-btn active" @click="addGame()">Начать игру</button>
      </div>
    </div>
    <hr />
    <div class="game-list-container">
      <perfect-scrollbar class="game-list">
        <div v-for="game in lobbyGameList" :key="game.id" class="game-item">
          <div v-if="game.joinedPlayers" :style="{ width: 'calc(100% - 200px)' }">
            <div class="game-config-info">
              <span>
                <font-awesome-icon :icon="deckMap[game.deckType].icon" :style="{ marginRight: '2px' }" />
                <font-awesome-icon :icon="deckMap[game.deckType].games[game.gameType].icon" />
                {{ deckMap[game.deckType].games[game.gameType].items[game.gameConfig].title }}
              </span>
              <span style="margin-left: 10px">
                <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{ game.gameTimer / 1000 }} сек
              </span>
            </div>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <button :class="['show-teams', showTeamsOpen ? 'open' : '']" v-on:click="showTeam(game.id)" />
              <span v-if="game.waitForPlayer && game.teams" :style="{ marginRight: '8px' }" class="teams-btn">Команд: {{
                game.teams.length }}</span>
              <span v-if="game.waitForPlayer && game.joinedPlayers">Игроков: {{ game.joinedPlayers }}</span>
              <span v-if="!game.waitForPlayer || game.round"> Идет {{ game.round }} раунд </span>
            </div>
          </div>
          <div :style="{ flexShrink: 0, alignSelf: 'flex-start' }">
            <button v-if="game.waitForPlayer || game.teams?.length > 0" class="lobby-btn join-btn"
              v-on:click="joinGame({ gameId: game.id, deckType: game.deckType })">
              Присоединиться
            </button>
            <span v-if="game.joinedPlayers && (!game.waitForPlayer || game.round)" :style="{
              color: '#f4e205',
              display: 'block',
              margin: '4px'
            }">
              <button class="lobby-btn join-btn viewer"
                v-on:click="joinGame({ gameId: game.id, deckType: game.deckType, viewerMode: true })">
                <font-awesome-icon :icon="['fas', 'eye']" />
                Посмотреть
              </button>
            </span>
          </div>
          <div v-if="showTeams[game.id]" :style="{ width: '100%', fontSize: '12px' }">
            <div v-for="team in game.teams" :key="team.id" :style="{ display: 'flex', marginBottom: '6px'  }">
              <button class="lobby-btn join-btn small-btn" :style="{
                border: 'none',
                marginRight: '8px',
                marginLeft: '24px',
                marginTop: '4px',
                marginBottom: '2px',
                padding: '2px 6px',
                height: '20px',
              }" v-on:click="joinGame({ gameId: game.id, deckType: game.deckType, teamId: team.id })">
                Присоединиться
              </button>
              <span :style="{paddingTop: '6px'}">{{ team.title }}</span>
            </div>
          </div>
        </div>
      </perfect-scrollbar>
    </div>
  </div>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

export default {
  components: {
    PerfectScrollbar,
  },
  props: {
    showGameIframe: Function,
  },
  data() {
    return {
      gameConfigsLoaded: false,
      deckType: null,
      gameType: null,
      gameConfig: null,
      gameTimer: 60,
      teamsCount: { min: null, max: null, val: null },
      playerCount: { min: null, max: null, val: null },
      maxPlayersInGame: { min: null, max: null, val: null },
      showTeams: {},
      showTeamsOpen: false,
    };
  },
  watch: {},
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      const store = this.state.store || {};

      // не придумал другого способа как предустановить configs с учетом синхронной подгрузки userData
      this.prepareGameConfigs(store.user?.[this.state.currentUser]);

      return store;
    },
    userData() {
      const currentUserData = this.store.user?.[this.state.currentUser] || {};
      return { id: this.state.currentUser, ...currentUserData };
    },
    lobby() {
      return this.store.lobby?.[this.state.currentLobby] || {};
    },
    deckMap() {
      return this.lobby.gameServers || {};
    },
    gameDeckList() {
      const list = Object.entries(this.deckMap);
      return list.sort((a, b) => (!a.active && b.active ? 1 : -1));
    },
    gameTypeMap() {
      return this.deckMap[this.deckType]?.games || {};
    },
    gameTypeList() {
      return Object.entries(this.gameTypeMap);
    },
    gameConfigMap() {
      return this.gameTypeMap[this.gameType]?.items || {};
    },
    gameConfigList() {
      return Object.entries(this.gameConfigMap);
    },
    lobbyGameList() {
      const list = Object.entries(this.lobby.games || {})
        .map(([id, game]) => Object.assign({}, game, { id }))
        .map((game) => {
          let waitForPlayer = game.status === 'WAIT_FOR_PLAYERS';
          if (game.playerMap) {
            const players = Object.keys(game.playerMap).map((id) => game.store?.player[id] || {});
            const readyPlayers = players.filter((player) => player.ready);
            game.joinedPlayers = readyPlayers.length + ' из ' + players.length;
            if (readyPlayers.length < players.length) waitForPlayer = true;
          }
          if (game.gamesMap) {
            const players = Object.keys(game.playerMap).map((id) => game.store?.player[id] || {});
            game.joinedPlayers = players.length;
            game.teams = Object.entries(game.gamesMap).map(([id, playersMap]) => {
              const players = Object.values(playersMap).map((userId) => (this.lobby.users[userId]?.name || 'игрок без имени')).join(', ');
              return {
                id,
                title: game.store?.game[id]?.title + ' (' + (players.length ? players : '') + ')',
              }
            });
          }
          if (waitForPlayer) game.waitForPlayer = true;
          return game;
        })
        .reverse();

      const sortedList = [
        ...list.filter(({ waitForPlayer }) => waitForPlayer),
        ...list.filter(({ waitForPlayer }) => !waitForPlayer),
      ];
      return sortedList;
    },
    bigConfig() {
      return this.teamsCount.val > 0 ? true : false;
    },
  },
  methods: {
    prepareGameConfigs(userData = {}) {
      if (this.gameConfigsLoaded) return;
      const configs = userData.lobbyGameConfigs;
      if (!configs) return;

      const { deckType, gameType, gameConfig, gameTimer, teamsCount, playerCount, maxPlayersInGame } = configs.active;

      this.$set(this, 'deckType', deckType);
      this.$set(this, 'gameType', gameType);
      this.$set(this, 'gameConfig', gameConfig);

      if (gameTimer) this.$set(this, 'gameTimer', gameTimer);
      if (teamsCount) {
        const { min, max, val } = teamsCount;
        this.$set(this.teamsCount, 'min', min);
        this.$set(this.teamsCount, 'max', max);
        this.$set(this.teamsCount, 'val', val);
      }
      if (playerCount) {
        const { min, max, val } = playerCount;
        this.$set(this.playerCount, 'min', min);
        this.$set(this.playerCount, 'max', max);
        this.$set(this.playerCount, 'val', val);
      }
      if (maxPlayersInGame) {
        const { min, max, val } = maxPlayersInGame;
        this.$set(this.maxPlayersInGame, 'min', min);
        this.$set(this.maxPlayersInGame, 'max', max);
        this.$set(this.maxPlayersInGame, 'val', val);
      }

      this.gameConfigsLoaded = true;
    },
    selectDeckType(type) {
      if (type === null || this.deckMap[type]?.active !== false) {
        this.deckType = type;
      }
    },
    selectGameType(type) {
      if (type === null || this.gameTypeMap[type]?.active !== false) {
        this.gameType = type;
        if (this.gameConfigList.length === 1) this.selectGameConfig(this.gameConfigList[0][0]);
      }
    },
    selectGameConfig(type) {
      this.gameConfig = type;

      const { teamsCount, playerCount, maxPlayersInGame } = this.gameConfigMap[type] || {};

      this.$set(this, 'teamsCount', { min: null, max: null, val: null });
      if (teamsCount && teamsCount.toString().includes('-')) {
        const [min, max] = teamsCount
          .toString()
          .split('-')
          .map((num) => parseInt(num));
        this.$set(this, 'teamsCount', { min, max, val: max });
      }

      this.$set(this, 'playerCount', { min: null, max: null, val: null });
      if (playerCount && playerCount.toString().includes('-')) {
        const [min, max] = playerCount
          .toString()
          .split('-')
          .map((num) => parseInt(num));
        this.$set(this, 'playerCount', { min, max, val: max });
      }

      this.$set(this, 'maxPlayersInGame', { min: null, max: null, val: null });
      if (maxPlayersInGame && maxPlayersInGame.toString().includes('-')) {
        const [min, max] = maxPlayersInGame
          .toString()
          .split('-')
          .map((num) => parseInt(num));
        this.$set(this, 'maxPlayersInGame', { min, max, val: max });
      }
    },
    updateGameTimer(timeShift) {
      this.gameTimer += timeShift;
      if (this.gameTimer > 120) this.gameTimer = 120;
      if (this.gameTimer < 15) this.gameTimer = 15;
    },
    updateTeamsCount(countShift) {
      this.teamsCount.val += countShift;
      if (this.teamsCount.val > this.teamsCount.max) this.teamsCount.val = this.teamsCount.max;
      if (this.teamsCount.val < this.teamsCount.min) this.teamsCount.val = this.teamsCount.min;
    },
    updatePlayerCount(countShift) {
      this.playerCount.val += countShift;
      if (this.playerCount.val > this.playerCount.max) this.playerCount.val = this.playerCount.max;
      if (this.playerCount.val < this.playerCount.min) this.playerCount.val = this.playerCount.min;
    },
    updateMaxPlayersInGame(countShift) {
      this.maxPlayersInGame.val += countShift;
      if (this.maxPlayersInGame.val > this.maxPlayersInGame.max) this.maxPlayersInGame.val = this.maxPlayersInGame.max;
      if (this.maxPlayersInGame.val < this.maxPlayersInGame.min) this.maxPlayersInGame.val = this.maxPlayersInGame.min;
    },
    async addGame() {
      const { deckType, gameType, gameConfig, gameTimer, teamsCount, playerCount, maxPlayersInGame } = this;

      if (!deckType || !gameType || !gameConfig) prettyAlert({ message: 'game config not set' });

      await api.action
        .call({
          path: 'user.api.update',
          args: [
            {
              lobbyGameConfigs: {
                active: { deckType, gameType, gameConfig, gameTimer, teamsCount, playerCount, maxPlayersInGame },
              },
            },
          ],
        })
        .catch(prettyAlert);

      let { name: userName, login, gender, tgUsername } = this.userData;
      if (!userName) userName = login;

      window.iframeEvents.push({
        data: {
          args: [{ deckType, gameType, gameConfig, gameTimer, teamsCount, playerCount, maxPlayersInGame }],
        },
        event: ({ args }) => {
          const $iframe = document.querySelector('#gameIframe');
          $iframe.contentWindow.postMessage({ path: 'game.api.new', args }, '*');
        },
      });
      this.showGameIframe({ deckType });
    },
    async joinGame({ gameId, deckType, viewerMode, teamId }) {
      // игровой сервер мог отключиться
      const { isAlive } = await api.action.call({ path: 'lobby.api.checkGame', args: [{ gameId }] }).catch(prettyAlert);
      if (!isAlive) return;

      window.iframeEvents.push({
        data: {
          args: [{ gameId, viewerMode, teamId }],
        },
        event: ({ args }) => {
          const $iframe = document.querySelector('#gameIframe');
          $iframe.contentWindow.postMessage({ path: 'game.api.join', args }, '*');
        },
      });
      this.showGameIframe({ deckType });
    },
    showTeam(gameId) {
      this.$set(this.showTeams, gameId, !this.showTeams[gameId]);
      this.showTeamsOpen = !this.showTeamsOpen;
    },
  },
  async created() { },
  async mounted() { },
  async beforeDestroy() { },
};
</script>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css" />
<style lang="scss" scoped>
@import '@/mixins.scss';

.games {
  overflow: hidden !important;

  .new-game-controls {
    @media only screen and (max-width: 360px) {
      font-size: 9px;
    }

    .breadcrumbs {
      text-align: center;
      padding: 10px 4px;

      .select-btn:not(.active) {
        border: none;
        cursor: default !important;

        &:hover {
          opacity: 1 !important;
        }
      }

      .select-btn.active {
        &:hover {
          background: transparent;
          color: white;

          &::after {
            color: white;
          }
        }
      }
    }

    .release-game {
      @include flex($wrap: wrap);
    }

    .game-types {
      @include flex();
      padding: 0px 10px;

      .select-btn {
        text-align: center;
        text-transform: uppercase;

        svg {
          width: 10px;
          margin-right: 4px;
        }

        .title {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }

    .game-block {
      display: flex;
      justify-content: space-around;
    }

    .game-config-block {
      @include flex();
      padding: 0px 10px;

      .select-btn {
        text-align: center;
      }
    }

    .game-start-block {
      @include flex($wrap: wrap);
      max-width: 80%;
      padding: 0px 10px;
      margin: auto;

      .select-btn {
        text-align: center;
        max-width: 100px;

        &:hover {
          background: transparent;
          color: white;
        }
      }

      .controls {
        color: #f4e205;
        font-size: 16px;

        svg {
          cursor: pointer;
          border-radius: 50%;
          padding: 0px 2px;
          color: black;
          background: #f4e205;
          border: 2px solid #f4e205;
          font-size: 10px;

          &:hover {
            background: transparent;
            color: #f4e205;
            font-size: 8px;
            padding: 1px 2.8px;
            // border-width: 3px;
          }
        }

        &.tutorial-active {
          box-shadow: none;

          >svg {
            box-shadow: 0 0 10px 10px #f4e205;
          }
        }
      }

      .label {
        margin: 0px 10px 0px 4px;
      }

      .player-count-config {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }

    .select-btn {
      width: 40%;
      text-align: left;
      border: 2px solid #f4e205;
      color: white;
      background-color: transparent;
      padding: 4px 10px;
      margin: 4px;
      border-radius: 4px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      cursor: pointer;

      &:hover {
        background: transparent;
        color: white;
      }

      @media only screen and (max-width: 360px) {
        padding: 4px 4px;
      }

      svg {
        width: 40px;

        @media only screen and (max-width: 360px) {
          width: 30px;
        }
      }

      &.active {
        background: #f4e205;
        color: black;

        svg {
          color: black !important;
        }
      }

      &.selected {
        &:after {
          content: 'X';
          color: black;
          padding: 0px 2px;
          font-weight: bold;
        }
      }

      &.disabled {
        border: 2px solid #ccc;
        background-color: #ccc;
        cursor: not-allowed;
      }

      &.wait-for-select:not(.disabled):hover {
        // opacity: 0.7;
        background-color: #f4e205;
        color: black;
      }

      &.tutorial-active {
        box-shadow: 0px 0px 20px 5px #f4e205;
      }
    }
  }

  hr {
    margin: 10px 30px;
    border-color: #f4e205;
  }

  .game-list-container {
    height: calc(100% - 100px);

    .game-list {
      height: 100%;
    }

    .show-teams {
      cursor: pointer;
      right: 10px;
      top: 10px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
      background-size: 14px;
      background-color: transparent;
      border: none;
      background-repeat: no-repeat;
      background-position: center;
      background-image: url(@/assets/arrow_down.png);

      &.open {
        background-image: url(@/assets/arrow_up.png);
      }

      &:hover {
        opacity: 0.7;
      }
    }
  }

  &.big-config {
    .game-list-container {
      height: calc(100% - 120px);
    }
  }
}

.game-item {
  @include flex($justify: space-between, $wrap: wrap);
  margin: 4px auto;
  min-height: 30px;
  max-width: 400px;
  text-align: left;

  .game-config-info {
    color: #f4e205;
    display: flex;
    justify-content: space-between;

    >svg {
      margin-left: 0px 4px;
    }
  }
}

.mobile-view .game-item {
  justify-content: center;

  >* {
    margin: 4px 10px;
  }
}

@media only screen and (max-width: 360px) {
  .join-btn {
    font-size: 9px;
    padding: 4px;
  }
}

.join-btn.viewer {
  background: transparent;
  color: #f4e205;

  >svg {
    color: #f4e205;
  }
}
</style>
