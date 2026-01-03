<template>
  <lobby :class="hideLobbyContent ? 'hide-lobby-content' : ''">
    <template #auth-form>
      <auth-form v-if="!state.currentUser" v-bind="{ customLobbyEnter }">
        <template #default="{ createDemoUser }">
          <button
            class="link"
            style="color: white"
            v-on:click="createDemoUser({ tutorial: { tutorial: 'lobby-tutorial-sales', step: 'teambuilding' } })"
          >
            Меня интересуют корпоративные игры
          </button>
        </template>
      </auth-form>
    </template>

    <template #custom-layout>
      <iframe v-if="iframeScr" :src="iframeScr" id="gameIframe" allowfullscreen />
      <div v-if="iframeScr" class="iframe-bg" />
      <font-awesome-icon
        v-if="iframeScr"
        class="iframe-close-btn"
        :icon="['fas', 'circle-xmark']"
        @click="closeIframe"
      />
    </template>

    <template v-if="!hideLobbyContent" #menu-item-game>
      <games class="menu-item-content" :deckMap="lobby.gameServers">
        <template #new-game-controls="{}">
          <div class="game-types">
            <div
              v-for="[code, game] in gameDeckList"
              :key="code"
              :class="['select-btn', `game-${code}`, 'wait-for-select', game.active === false ? 'disabled' : '']"
              @click="showGameLobbyIframe({ gameType: code, createNewGame: true })"
            >
              <div class="title"><font-awesome-icon :icon="game.icon" /> {{ game.title }}</div>
            </div>
          </div>
        </template>
      </games>
    </template>
  </lobby>
</template>

<script>
import lobby from '~/lib/lobby/front/Lobby.vue';
import authForm from '~/lib/lobby/front/components/AuthForm.vue';
import games from '~/lib/lobby/front/components/games.vue';

export default {
  components: {
    lobby,
    authForm,
    games,
  },
  data() {
    return {
      iframeScr: '',
      hideLobbyContent: false,
    };
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      return this.state.store || {};
    },
    userData() {
      const currentUserData = this.store.user?.[this.state.currentUser] || {};
      return { id: this.state.currentUser, ...currentUserData };
    },
    lobby() {
      return this.store.lobby?.[this.state.currentLobby] || {};
    },
    defaultTutorialMenu() {
      return {
        text: 'Чем могу помочь?',
        bigControls: true,
        buttons: [
          {
            text: 'Открой мой профиль',
            action: async function () {
              this.menu = null;
              this.showProfile();
            },
          },
          {
            text: 'Активировать подсказки',
            action: async function () {
              await api.action
                .call({
                  path: 'helper.api.restoreLinks',
                  args: [{ inGame: false }],
                })
                .then(() => {
                  this.menu = null;
                  {
                    // перерисовываем helper-а, чтобы отобразились подсказки
                    this.resetFlag = true;
                    setTimeout(() => {
                      this.resetFlag = false;
                    }, 100);
                  }
                })
                .catch(prettyAlert);
            },
          },
          {
            text: 'Покажи доступные обучения',
            action: {
              text: `Выбери нужное обучение в списке, чтобы запустить его повторно:
              `,
              showList: [
                {
                  title: 'Стартовое приветствие',
                  action: { tutorial: 'lobby-tutorial-start' },
                },
                {
                  title: 'Игровая комната',
                  action: { tutorial: 'lobby-tutorial-menuGame' },
                },
                {
                  title: 'Корпоративные игры в тематике ИТ',
                  action: {
                    tutorial: 'lobby-tutorial-menuGameReleaseCorporate',
                  },
                },
                {
                  title: 'Корпоративные игры для автобизнеса',
                  action: { tutorial: 'lobby-tutorial-menuGameAutoPoker' },
                },
              ],
              buttons: [
                { text: 'Назад в меню', action: 'init' },
                { text: 'Спасибо', action: 'exit', exit: true },
              ],
            },
          },
          { text: 'Спасибо, ничего не нужно', action: 'exit', exit: true },
        ],
      };
    },
    gameDeckList() {
      const list = Object.entries(this.lobby.gameServers || {});
      return list.sort((a, b) => (a.disabled && !b.disabled ? 1 : -1));
    },
  },
  methods: {
    showGameLobbyIframe({ gameType }) {
      window.iframeEvents = window.iframeEvents || [];
      window.iframeEvents.push({
        data: {
          emit: { name: 'updateStore', data: { lobby: this.store.lobby } },
        },
        event: (postMessageData) => {
          const $iframe = document.querySelector('#gameIframe');
          $iframe.contentWindow.postMessage(postMessageData, '*');
        },
      });

      this.hideLobbyContent = true;
      this.state.hideFullscreeBtn = true;

      this.iframeScr =
        this.lobby.gameServers[gameType].url +
        '?' +
        Object.entries({
          iframe: true,
          lobbyOrigin: this.state.serverOrigin,
          userId: this.state.currentUser,
          lobbyId: this.state.currentLobby,
          token: this.state.currentToken,
          createNewGame: this.state.createNewGame,
        })
          .map((pair) => pair.map(encodeURIComponent).join('='))
          .join('&');
    },
    closeIframe() {
      this.hideLobbyContent = false;
      this.state.hideFullscreeBtn = false;
      this.iframeScr = '';
    },
    async customLobbyEnter({ lobbyId }) {
      await api.action
        .call({ path: 'lobby.api.enter', args: [{ lobbyId }] })
        .then(async (data) => {
          this.$set(this.$root.state, 'currentLobby', lobbyId);
          if (data.restoreGame) {
            this.showGameLobbyIframe({ gameType: data.restoreGame.deckType });
          }
        })
        .catch(prettyAlert);
    },

    // Кастомная функция addGame (опционально)
    // Если не определена, будет использована дефолтная из базового компонента
    async addGameHandler(data) {
      // Ваша кастомная реализация
      const { deckType, gameType, gameConfig, gameTimer } = data;
      const { teamsCount, playerCount, maxPlayersInGame, gameRoundLimit, difficulty } = data;

      if (!deckType || !gameType || !gameConfig) {
        prettyAlert({ message: 'game config not set' });
        return;
      }

      // Ваша кастомная логика здесь
      console.log('Custom addGame called');

      // Пример: вызов дефолтной логики после кастомной
      // Для этого можно вызвать базовый метод через $options или использовать другой подход

      // Или полностью переопределить:
      const args = [
        {
          lobbyGameConfigs: {
            active: {
              ...{ deckType, gameType, gameConfig, gameTimer },
              ...{ teamsCount, playerCount, maxPlayersInGame, gameRoundLimit, difficulty },
            },
          },
        },
      ];
      await api.action.call({ path: 'user.api.update', args }).catch(prettyAlert);

      let { name: userName, login, gender, tgUsername } = this.userData;
      if (!userName) userName = login;

      const eventData = {
        args: [
          {
            ...{ deckType, gameType, gameConfig, gameTimer },
            ...{ teamsCount, playerCount, maxPlayersInGame, gameRoundLimit, difficulty },
          },
        ],
      };
      window.iframeEvents.push({
        data: eventData,
        event: (data) => {
          const $iframe = document.querySelector('#gameIframe');
          // $iframe.contentWindow.postMessage(
          //   { emit: { name: "addGame", data } },
          //   "*",
          // );
        },
      });
      this.showGameLobbyIframe({ deckType });
    },
    customMenu() {
      const menuWrapper = tutorial.menuWrapper(this.userData);
      const menuButtonsMap = tutorial.menuButtonsMap(this.tutorialActions);

      const { cancel, tutorials, helperLinks } = menuButtonsMap;
      const fillTutorials = tutorials({
        showList: [
          {
            title: 'Стартовое приветствие',
            action: { tutorial: 'lobby-tutorial-start' },
          },
          {
            title: 'Игровая комната',
            action: { tutorial: 'lobby-tutorial-menuGame' },
          },
          {
            title: 'Корпоративные игры в тематике ИТ',
            action: { tutorial: 'lobby-tutorial-menuGameReleaseCorporate' },
          },
          {
            title: 'Корпоративные игры для автобизнеса',
            action: { tutorial: 'lobby-tutorial-menuGameAutoPoker' },
          },
        ],
      });

      const self = this;
      return menuWrapper({
        buttons: [
          cancel(),
          {
            text: 'Открой мой профиль',
            action: async function () {
              self.menu = null;
              self.showProfile();
            },
          },
          fillTutorials,
          helperLinks(),
        ],
      });
    },
  },
  async created() {
    this.state.emit.iframeAlive = async () => {
      const events = window.iframeEvents || [];
      for (const { event, data } of events) {
        event(data);
      }
      window.iframeEvents = [];
    };
    this.state.emit.iframeDead = async () => {
      const events = window.iframeEvents || [];
      console.log('iframeDead', { events });
      // for (const { event, data } of events) {
      //   event(data);
      // }
    };
    this.state.emit.hideGameIframe = () => {
      this.iframeScr = '';
    };
  },
};
</script>
<style lang="scss">
@import '@/mixins.scss';

#gameIframe {
  width: 80% !important;
  height: 80% !important;
  top: 10%;
  left: 10%;
}
.iframe-bg {
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 10001;
  width: 100%;
  height: 100%;
  background-image: url(@/assets/clear-black-back.png);
}
.iframe-close-btn {
  z-index: 99999;
  position: absolute;
  width: 40px;
  height: 40px;
  right: calc(10% - 10px);
  top: calc(10% - 10px);
  color: #f4e205;
  background-color: black;
  border-radius: 50%;
  box-shadow: inset 0px 0px 0px 4px #f4e205;
  cursor: pointer;

  &:hover {
    border: 4px solid #f4e205;
  }
}

#lobby {
  iframe {
    z-index: 99999;
    position: absolute;
    width: 100%;
    height: 100%;
    right: 0px;
    bottom: 0px;
  }

  &.game-restore-process-active > *:not(iframe) {
    display: none;
  }
}

.hide-lobby-content #lobby > *:not(iframe, .iframe-bg, .iframe-close-btn, #bg-img) {
  display: none;
}
</style>
