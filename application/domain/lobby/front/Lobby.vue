<template>
  <div v-if="lobbyDataLoaded" id="lobby" :class="[
    state.isMobile ? 'mobile-view' : '',
    state.isLandscape ? 'landscape-view' : 'portrait-view',
    !state.currentUser ? 'need-auth' : '',
  ]">
    <iframe v-if="iframeScr" :src="iframeScr" :id="`gameIframe`" allowfullscreen></iframe>

    <div v-if="!state.currentUser" class="auth">
      <div class="form">
        <h3>Вход в лобби</h3>
        <button class="new" v-on:click="createDemoUser">Войти как гость</button>
        <button v-if="!showLoginForm" class="link" v-on:click="showLoginForm = true">Войти с паролем</button>
        <template v-else>
          <div class="inputs">
            <input v-model="auth.login" name="login" placeholder="логин" />
            <span :style="{ width: '10px' }"></span>
            <input v-model="auth.password" name="password" placeholder="пароль" />
          </div>
          <button v-on:click="login">Авторизоваться</button>
        </template>
        <div v-if="auth.err" class="err">{{ auth.err }}</div>
      </div>
    </div>

    <helper v-if="!userData.gameId" :showProfile="showProfile" :defaultMenu="defaultTutorialMenu" />

    <div class="menu-item-list">
      <div :class="['menu-item', pinned.game ? 'pinned' : '', 'game']">
        <label v-on:click="pinMenuItem('game')">
          ИГРОВАЯ КОМНАТА <font-awesome-icon :icon="['fas', 'circle-xmark']" size="2xs" />
        </label>
        <games class="menu-item-content" :showGameIframe="showGameIframe" />
      </div>
      <div :class="['menu-item', pinned.list ? 'pinned' : '', 'list']">
        <label v-on:click="pinMenuItem('list')">
          ПРАВИЛА ИГР <font-awesome-icon :icon="['fas', 'circle-xmark']" size="2xs" />
        </label>
        <rules class="menu-item-content" />
      </div>
      <div :class="['menu-item', pinned.chat ? 'pinned' : '', 'chat']">
        <label v-on:click="pinMenuItem('chat')">
          ОБЩЕНИЕ <font-awesome-icon :icon="['fas', 'circle-xmark']" size="2xs" />
          <small v-if="unreadMessages > 0">есть новые сообщения</small>
        </label>
        <chat class="menu-item-content" :defActiveChannel="`lobby-${state.currentLobby}`" :userData="userData"
          :isVisible="pinned.chat" :hasUnreadMessages="hasUnreadMessages" :channels="chatChannels" />
      </div>
      <div :class="['menu-item', pinned.top ? 'pinned' : '', 'top']">
        <label v-on:click="pinMenuItem('top')">
          ЗАЛ СЛАВЫ <font-awesome-icon :icon="['fas', 'circle-xmark']" size="2xs" />
        </label>
        <rankings class="menu-item-content" :games="lobby.rankings" />
      </div>
      <div :class="[
        'menu-item',
        pinned.info ? 'pinned' : '',
        'info',
        !state.isMobile && pinned.info === null ? 'preview' : '',
      ]">
        <label v-on:click="pinMenuItem('info')">
          УСЛУГИ СТУДИИ <font-awesome-icon :icon="['fas', 'circle-xmark']" size="2xs" />
        </label>

        <perfect-scrollbar class="menu-item-content">
          <ul>
            <li>
              <label v-on:click.stop="showInfo('teambuilding')">Проведение тимбилдингов</label>
              <div>С неограниченным количеством участников</div>
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
    </div>

    <profile v-if="profileActive" :closeProfile="closeProfile" :userData="userData" />

    <div class="main-logo">
      <div class="contact-icons-wrapper">
        <a href="https://t.me/smartgamesstudio" target="_black" class="telegram-link"> </a>
        <a href="https://vk.com/smartgames.studio" target="_black" class="vk-link"> </a>
      </div>
    </div>

    <img id="bg-img" src="./assets/lobby.png" usemap="#image-map" :style="{
      position: 'absolute',
      left: `${bg.left || 0}px`,
      top: `${bg.top || 0}px`,
      scale: bg.scale || 1,
      transformOrigin: 'center',
      filter: 'grayscale(1)',
    }" />
  </div>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar';
import { addEvents, removeEvents, events } from './lobbyEvents';

import GUIWrapper from '@/components/gui-wrapper.vue';
import helper from '~/lib/helper/front/helper.vue';
import games from './components/games.vue';
import rankings from './components/rankings.vue';
import rules from './components/rules.vue';
import profile from './components/profile.vue';
import chat from '~/lib/chat/front/chat.vue';

export default {
  components: {
    PerfectScrollbar,
    GUIWrapper,
    helper,
    games,
    rankings,
    rules,
    profile,
    chat,
  },
  props: {
    customInitSession: Function,
  },
  data() {
    return {
      lobbyDataLoaded: false,
      lobbyDataLoadEvents: [],
      auth: { login: '', password: '', err: null },
      unreadMessages: 0,
      profileActive: false,
      bg: {
        top: 0,
        left: 0,
        showMask: '',
      },
      pinnedItemsLoaded: false,
      pinned: { chat: false, list: false, top: false, game: false, info: false },
      iframeScr: '',
      showLoginForm: false,
    };
  },
  watch: {
    'userData.gameId': function (val) {
      if (!val) this.iframeScr = '';
    },
    lobbyDataLoaded: function () {
      this.$set(this.$root.state, 'viewLoaded', true);
      for (const event of this.lobbyDataLoadEvents) event();
      this.lobbyDataLoadEvents = [];
    },
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      const store = this.state.store || {};

      // не придумал другого способа как предустановить pinnedItems с учетом синхронной подгрузки userData
      this.preparePinnedItems(store.user?.[this.state.currentUser]);

      return store;
    },
    userData() {
      const currentUserData = this.store.user?.[this.state.currentUser] || {};
      return { id: this.state.currentUser, ...currentUserData };
    },
    lobby() {
      return this.store.lobby?.[this.state.currentLobby] || {};
    },
    chatChannels() {
      return {
        [`lobby-${state.currentLobby}`]: {
          name: 'Общий чат',
          users: this.lobby.users || {},
          items: this.lobby.chat || {},
        },
      };
    },
    defaultTutorialMenu() {
      return {
        text: 'Чем могу помочь?',
        bigControls: true,
        buttons: [
          {
            text: 'Открой мой профиль', action: async function () {
              this.menu = null;
              this.showProfile();
            }
          },
          {
            text: 'Активировать подсказки', action: async function () {
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
            }
          },
          {
            text: 'Покажи доступные обучения',
            action: {
              text: 'Нажмите на нужное обучение в списке, чтобы запустить его повторно:',
              showList: [
                { title: 'Стартовое приветствие', action: { tutorial: 'lobby-tutorial-start' } },
                { title: 'Игровая комната', action: { tutorial: 'lobby-tutorial-menuGame' } },
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
  },
  methods: {
    async initSession(config = {}) {
      await this.$root.initSession(config, {
        success: async ({ lobbyId, availableLobbies }) => {
          if (lobbyId) {
            this.$set(this.$root.state, 'currentLobby', lobbyId);
            this.lobbyDataLoaded = true;
          } else {
            if (availableLobbies.length) await this.callLobbyEnter({ lobbyId: availableLobbies[0] });
          }
        },
        error: async (err) => {
          if (err.message) this.auth.err = err.message;
          // чтобы пользователь увидел форму авторизации
          this.lobbyDataLoaded = true;
        },
      });
    },
    async createDemoUser() {
      await this.initSession({ demo: true });
    },
    async login() {
      await this.initSession({ login: this.auth.login, password: this.auth.password });
    },
    async callLobbyEnter({ lobbyId }) {
      await api.action
        .call({ path: 'lobby.api.enter', args: [{ lobbyId }] })
        .then(() => {
          this.$set(this.$root.state, 'currentLobby', lobbyId);
          this.lobbyDataLoaded = true;
        })
        .catch(prettyAlert);
    },
    showGameIframe({ deckType }) {
      if (!this.lobbyDataLoaded)
        return this.lobbyDataLoadEvents.push(() => {
          this.showGameIframe({ deckType });
        });

      window.iframeEvents.push({
        data: {
          emit: { name: 'updateStore', data: { lobby: this.store.lobby } },
        },
        event: (postMessageData) => {
          const $iframe = document.querySelector('#gameIframe');
          $iframe.contentWindow.postMessage(postMessageData, '*');
        },
      });

      const game = this.lobby.gameServers[deckType];

      function encodeUri(state) {
        return Object.entries({
          // iframeCode: deckType,
          lobbyOrigin: state.serverOrigin,
          userId: state.currentUser,
          lobbyId: state.currentLobby,
          token: state.currentToken,
        })
          .map((pair) => pair.map(encodeURIComponent).join('='))
          .join('&');
      }

      this.iframeScr = game.url + '?' + encodeUri(state);
    },

    show(mask) {
      if (mask === '' && this.state.isMobile) return;
      this.bg.showMask = mask;
    },
    preparePinnedItems(userData = {}) {
      if (this.pinnedItemsLoaded) return;
      if (!userData?.lobbyPinnedItems) return;
      this.$set(this, 'pinned', userData.lobbyPinnedItems);
      this.pinnedItemsLoaded = true;
    },
    pinMenuItem(code) {
      this.pinned[code] = !this.pinned[code];
      api.action
        .call({
          path: 'user.api.update',
          args: [{ lobbyPinnedItems: this.pinned }],
        })
        .catch(prettyAlert);
    },
    showInfo(name) {
      api.action
        .call({
          path: 'helper.api.action',
          args: [{ tutorial: 'lobby-tutorial-sales', step: name }],
        })
        .catch(prettyAlert);
    },
    showProfile() {
      this.profileActive = true;
    },
    closeProfile() {
      this.profileActive = false;
    },
    hasUnreadMessages(count = 0) {
      if (this.unreadMessages === 0 && count > 0) {
        prettyAlert({
          message: 'У вас новое сообщение в чате',
        });
      }
    },
  },
  async created() {
    this.state.emit.restoreGame = async (data) => {
      const { deckType, gameType, gameId, needLoadGame } = data;

      window.iframeEvents.push({
        data: {
          args: [{ deckType, gameType, gameId, needLoadGame }],
        },
        event: ({ args }) => {
          const $iframe = document.querySelector('#gameIframe');
          $iframe.contentWindow.postMessage({ path: 'game.api.restore', args }, '*');
        },
      });

      this.showGameIframe({ deckType });
    };

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
  async mounted() {
    if (this.state.currentUser && this.state.currentLobby) {
      this.lobbyDataLoaded = true;
    } else {
      const initSession = this.customInitSession || this.initSession;
      initSession();
    }
    addEvents(this);
    events.resizeBG();
  },
  async beforeDestroy() {
    removeEvents();
    this.$set(this.$root.state, 'viewLoaded', false);

    return; // при входе в игру не выходим из лобби

    await api.action
      .call({
        path: 'lobby.api.exit',
      })
      .then((data) => {
        this.$set(this.$root.state, 'currentLobby', '');
      })
      .catch(prettyAlert);
  },
};
</script>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css" />
<style lang="scss">
@import '@/mixins.scss';

#lobby {
  height: 100%;
  width: 100%;
}

#lobby iframe {
  z-index: 99999;
  position: absolute;
  width: 100%;
  height: 100%;
  right: 0px;
  bottom: 0px;
}

.menu-item {
  z-index: 1;
  position: absolute;
  transform: translate(-50%, -50%);
  transition: top 0.7s;

  &.pinned,
  &.preview {
    z-index: 2;
  }

  .menu-item-content {
    visibility: hidden;
    opacity: 0;
    border: 4px solid #f4e205;
    position: absolute;
    left: 0px;
    top: 100%;
    background-image: url(@/assets/clear-black-back.png);
    color: white;
    transition:
      visibility 0s,
      opacity 0.5s linear;
    overflow: auto;
  }
}

.menu-item.pinned>div {
  max-height: none !important;
}

#lobby.mobile-view .menu-item-list {
  position: relative;
  height: calc(100% - 150px - 50px);
  width: 100%;
  margin-top: 150px;
  @include flex($wrap: wrap);

  .menu-item {
    font-size: 10px;

    &.info {
      top: 0%;
    }

    &.top {
      top: 20%;
    }

    &.list {
      top: 40%;
    }

    &.chat {
      top: 60%;
    }

    &.game {
      top: 80%;
    }

    &.pinned,
    &.tutorial-active {
      top: 0px;
      height: calc(100% - 5% - 50px);
      z-index: 2;
    }
  }
}

#lobby.mobile-view.landscape-view .menu-item-list {
  margin-top: 5%;
  width: 50%;
  height: 100%;

  .menu-item {
    &.game {
      left: 100%;
      top: 150px;
      width: 90%;

      &.pinned,
      &.tutorial-active {
        left: 0px;
        top: 0px;
        width: 100%;

        label {
          display: initial;
          white-space: nowrap;
          left: 20%;
        }

        .menu-item-content {
          width: 185%;
        }
      }
    }

    >div {
      top: auto;
      left: 5%;
      width: 185%;
      height: calc(100% - 30px);
    }
  }
}

$textshadow: rgb(42, 22, 23);

.menu-item>label {
  cursor: pointer;
  position: relative;
  color: crimson;
  text-shadow:
    $textshadow 0px 0px 0px,
    $textshadow 0.669131px 0.743145px 0px,
    $textshadow 1.33826px 1.48629px 0px,
    $textshadow 2.00739px 2.22943px 0px,
    $textshadow 2.67652px 2.97258px 0px,
    $textshadow 3.34565px 3.71572px 0px,
    $textshadow 4.01478px 4.45887px 0px,
    $textshadow 4.68391px 5.20201px 0px;
  font-family: fantasy;
  font-weight: bold;
  letter-spacing: 10px;
  white-space: nowrap;
  padding-left: 6px;

  font-size: 3em;
  background-image: linear-gradient(#f4e205, #f4e205);
  background-size: 100% 10px;
  background-repeat: no-repeat;
  background-position: 100% 0%;
  transition:
    background-size 0.7s,
    background-position 0.5s ease-in-out;
}

.menu-item:hover>label,
.menu-item.pinned>label,
#lobby:not(.mobile-view) .menu-item.tutorial-active>label {
  background-size: 100% 100%;
  background-position: 0% 100%;
  transition:
    background-position 0.7s,
    background-size 0.5s ease-in-out;
  box-shadow: 1px 0px 20px 6px rgba(0, 0, 0, 1);
}

.menu-item>label>svg {
  display: none;
  padding: 10px;
  position: absolute;
  top: 0px;
  right: 100%;
  color: #f4e205;
  box-shadow: 0px 0px 10px 2px rgb(0, 0, 0);
  background-color: black;
  border-radius: 50%;
  padding: 0px;
  margin: 10px;

  :hover {
    opacity: 0.7;
  }
}

.menu-item.pinned>label>svg {
  display: inline-block;
}

#lobby:not(.mobile-view) .menu-item:hover>div,
.menu-item.pinned>div,
.menu-item.preview>div,
.menu-item.tutorial-active>div {
  visibility: visible;
  opacity: 1;
}

.menu-item.info {
  top: 100px;
  left: calc(50% + 400px);

  $info_textshadow: rgb(42, 22, 23);

  >label {
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

    >svg {
      color: #1976d2;
      width: 18px;
      height: 18px;
      margin-top: 4px;
      background-color: white;
      // box-shadow: inset 0px 0px 0px 4px #1976d2;
    }
  }

  &.pinned>label,
  &:hover>label {
    background-image: linear-gradient(#1976d2, #1976d2);

    &:before {
      display: none;
    }
  }

  &.preview:not(.pinned)>div {
    height: 180px;
    overflow: hidden;
  }

  >div,
  &.info.preview:hover>div {
    height: 460px;
    width: 400px;
    border-color: #1976d2;
  }
}

.menu-item.game {
  top: 70%;
  left: 45%;
}

.menu-item.game.pinned {
  top: 45%;
  left: 45%;
}

.menu-item.game>label {
  display: block;
  white-space: pre-line;
}

.menu-item.game>div {
  height: 300px;
  width: 500px;
  max-height: 200px;
}

.menu-item.chat {
  top: 60%;
  left: 10%;
}

.menu-item.chat>label>small {
  font-size: 16px;
  letter-spacing: 0px;
  text-align: right;
  position: absolute;
  width: 100%;
  text-align: center;
  left: 0px;
  top: -16px;
  color: #0078d7;
}

.menu-item.chat.pinned {
  top: 10%;
  left: 10%;
}

.menu-item.chat>div {
  height: 500px;
  width: 300px;
  max-height: 200px;
}

.menu-item.top {
  top: 35%;
  left: 40%;
}

.menu-item.top.pinned {
  top: 10%;
  left: 40%;
}

.menu-item.top>div {
  height: 200px;
  width: 500px;
}

.menu-item.list {
  top: 45%;
  left: 80%;
}

.menu-item.list.pinned {
  top: 20%;
  left: 80%;
}

.menu-item.list>div {
  height: 500px;
  width: 400px;
  max-height: 300px;
}

#lobby.mobile-view .menu-item {
  left: 0px;
  width: 100%;
  transform: none;
}

#lobby.mobile-view .menu-item>div {
  top: auto;
  left: 5%;
  width: 90%;
  height: 100%;
}

#lobby.mobile-view .menu-item.game>label {
  max-width: 220px;
  margin: auto;
}

#lobby.mobile-view.portrait-view .menu-item.game>div {
  height: 90%;
}

#lobby.mobile-view.landscape-view .menu-item.game>label {
  max-width: 450px;
}

.menu-item.tutorial-active {
  background: white;
}

#lobby.mobile-view .menu-item.tutorial-active {
  background: transparent;
  box-shadow: none;
}

#lobby>.main-logo {
  z-index: 1;
  position: absolute;
  width: 400px;
  height: 200px;
  left: calc(50% - 200px);
  top: 0px;
  background-image: url(assets/logo.png);
  background-size: cover;
  transform-origin: top;

  .contact-icons-wrapper {
    position: absolute;
    top: 115px;
    right: 30px;
    display: flex;
    justify-content: center;

    * {
      cursor: pointer;
      width: 30px;
      height: 30px;
      margin: 5px;
      background-size: cover;
      box-shadow: 1.5px 1px black;
      border-radius: 50%;

      &:hover {
        opacity: 0.7;
      }
    }

    .telegram-link {
      background-image: url(assets/telegram.png);
    }

    .vk-link {
      background-image: url(assets/vk.png);
    }
  }
}

#lobby.mobile-view>.main-logo {
  width: 300px;
  height: 150px;
  left: calc(50% - 150px);

  .contact-icons-wrapper {
    top: 80px;
    right: 15px;
  }
}

#lobby.mobile-view.landscape-view>.main-logo {
  left: auto;
  right: 10px;
  top: -25px;
}

.menu-item.info ul,
.menu-item.list ul {
  font-size: 18px;
  color: white;
  text-align: left;
}

.menu-item.info ul>li,
.menu-item.list ul>li {
  padding-bottom: 20px;
}

.menu-item.info ul>li>label,
.menu-item.info ul>li>label>a,
.menu-item.info ul>li::marker,
.menu-item.list ul>li>label,
.menu-item.list ul>li>label>a,
.menu-item.list ul>li::marker {
  cursor: pointer;
  font-family: fantasy;
  font-size: 24px;
  color: #f4e205;
  text-decoration: none;
}

.menu-item.list ul>li>span {
  cursor: pointer;
  color: #f4e205;
}

.menu-item ul>li.white>label,
.menu-item ul>li.white>label>a,
.menu-item ul>li.white::marker {
  color: white;
}

.menu-item.info ul>li>label,
.menu-item.info ul>li>label>a,
.menu-item.info ul>li::marker {
  color: crimson;
}

.menu-item.list ul>li:not(.disabled) label:hover,
.menu-item.list ul>li:not(.disabled) label:hover>a,
.menu-item.list ul>li>span:hover,
.menu-item.list ul>li:not(.disabled):hover::marker,
.menu-item.info ul>li:not(.disabled)>label:hover,
.menu-item.info ul>li>span:hover,
.menu-item.info ul>li:not(.disabled):hover::marker {
  color: white;
}

.menu-item.list ul>li.disabled>label {
  cursor: default !important;
}

.menu-item.list ul>li.disabled>label:not(.not-disabled):after {
  content: '(в разработке)';
  color: grey;
  font-size: 20px;
  padding-left: 10px;
}

.menu-item.list ul>li>hr {
  width: 80%;
  margin: 6px 0px;
}

.lobby-btn {
  background: #f4e205;
  border: 2px solid #f4e205;
  color: black;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}

.lobby-btn:hover,
.lobby-btn[disabled='disabled'] {
  background: black !important;
  color: #f4e205;
}

.menu-item.pinned .chat-controls {
  display: flex !important;
}

#lobby>.auth {
  z-index: 10001;
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background-image: url(@/assets/clear-black-back.png);
  background-size: cover;
  display: grid;

  >.form {
    align-self: center;
    justify-self: center;
    width: 400px;
    height: auto;
    border: 4px solid #f4e205;
    display: flex;
    flex-wrap: wrap;
    color: #f4e205;
    max-width: 90%;
    position: fixed;

    >.err {
      width: 100%;
      color: orangered;
      margin-bottom: 10px;
    }

    >h3 {
      width: 100%;
      text-align: center;
    }

    >.inputs {
      width: 100%;
      display: flex;
      margin: 10px;

      >input {
        width: 50%;
        font-size: 14px;
        padding: 2px 8px;
        background: transparent;
        border: 2px solid #f4e205;
        color: #f4e205;
      }
    }

    >button {
      width: 100%;
      margin: 10px;
      background: transparent;
      color: #f4e205;
      border: 2px solid #f4e205;
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }

      &.new {
        background-color: #f4e205;
        color: black;
      }

      &.link {
        background: transparent;
        border: none;
        text-decoration: underline;
        font-size: 16px;
        padding: 0;
        margin: 5px 0;
        font-size: 12px;
        padding-bottom: 10px;
      }
    }
  }
}
</style>
