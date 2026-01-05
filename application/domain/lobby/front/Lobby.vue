<template>
  <lobby ref="lobbyComponent" :class="hideLobbyContent ? 'hide-lobby-content' : ''" :customMenu="customMenu">
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

    <template v-if="!hideLobbyContent" #menu-item-info="{ pinned, pinMenuItem }">
      <div :class="['menu-item', pinned ? 'pinned' : '', 'info', !state.isMobile && pinned === null ? 'preview' : '']">
        <label v-on:click="pinMenuItem('info')">
          УСЛУГИ СТУДИИ
          <font-awesome-icon :icon="['fas', 'circle-xmark']" size="2xs" />
        </label>

        <perfect-scrollbar class="menu-item-content">
          <ul>
            <li>
              <label v-on:click.stop="showInfo('teambuilding')">Корпоративные тимбилдинги</label>
              <div>В том числе в онлайн формате</div>
            </li>
            <li>
              <label v-on:click.stop="showInfo('delivery')">Продажа настольных игр</label>
              <div>В любом количестве с доставкой до офиса</div>
            </li>
            <li>
              <label v-on:click.stop="showInfo('games')">Разработка игр на заказ</label>
              <div>Настольные обучающие игры для любой сферы бизнеса</div>
            </li>
            <li>
              <label v-on:click.stop="showInfo('it')">Создание онлайн-версий игр</label>
              <div>Собственная команда программистов</div>
            </li>
            <li>
              <label v-on:click.stop="showInfo('contacts')">Связаться с нами</label>
              <div>Контактная информация</div>
            </li>
          </ul>
        </perfect-scrollbar>
      </div>
    </template>
  </lobby>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar';

import lobby from '~/lib/lobby/front/Lobby.vue';
import authForm from '~/lib/lobby/front/components/AuthForm.vue';
import games from '~/lib/lobby/front/components/games.vue';
import tutorial from '~/lib/helper/front/helper.vue';

export default {
  components: {
    lobby,
    authForm,
    games,
    tutorial,
    PerfectScrollbar,
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
    gameDeckList() {
      const list = Object.entries(this.lobby.gameServers || {});
      return list.sort((a, b) => (a.disabled && !b.disabled ? 1 : -1));
    },
  },
  methods: {
    updateLobbyState(state) {
      if (this.$refs.lobbyComponent) {
        this.$refs.lobbyComponent.lobbyState = state;
      }
    },
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
          this.updateLobbyState('');
          this.$set(this.$root.state, 'currentLobby', lobbyId);

          if (data.restoreGame) {
            this.updateLobbyState('restoring-game');
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

      return menuWrapper({
        buttons: [
          cancel(),
          {
            text: 'Открой мой профиль',
            action: async ({ helper }) => {
              helper.menu = null;
              this.$refs.lobbyComponent.showProfile();
            },
          },
          fillTutorials,
          helperLinks(),
        ],
      });
    },
    showInfo(name) {
      api.action
        .call({
          path: 'helper.api.action',
          args: [{ tutorial: 'lobby-tutorial-sales', step: name }],
        })
        .catch(prettyAlert);
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

  .menu-item.info {
    top: 100px;
    left: calc(50% + 400px);

    $info_textshadow: rgb(42, 22, 23);

    > label {
      font-size: 2.5em;
      letter-spacing: 6px;
      color: white;
      background-image: linear-gradient(#1976d2, #1976d2);
      text-shadow:
        $info_textshadow 0px -2px 0px,
        $info_textshadow -2px 0px 0px,
        $info_textshadow 0px 0px 0px,
        $info_textshadow 0.669131px 0.743145px 0px,
        $info_textshadow 1.33826px 1.48629px 0px,
        $info_textshadow 2.00739px 2.22943px 0px,
        $info_textshadow 2.67652px 2.97258px 0px,
        $info_textshadow 3.34565px 3.71572px 0px,
        $info_textshadow 4.01478px 4.45887px 0px,
        $info_textshadow 4.68391px 5.20201px 0px;

      > svg {
        color: #1976d2;
        width: 18px;
        height: 18px;
        margin-top: 4px;
        background-color: white;
        // box-shadow: inset 0px 0px 0px 4px #1976d2;
      }
    }

    &.pinned > label,
    &:hover > label {
      background-image: linear-gradient(#1976d2, #1976d2);

      &:before {
        display: none;
      }
    }

    &.preview:not(.pinned) > div {
      height: 180px;
      overflow: hidden;
    }

    > div,
    &.info.preview:hover > div {
      height: 460px;
      width: 400px;
      border-color: #1976d2;
    }
  }
}

.hide-lobby-content #lobby > *:not(iframe, .iframe-bg, .iframe-close-btn, #bg-img) {
  display: none;
}
</style>
