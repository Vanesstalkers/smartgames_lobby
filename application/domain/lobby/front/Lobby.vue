<template>
  <lobby>
    <template #auth-form="{ handleAuthSuccess, callLobbyEnter }">
      <auth-form
        v-if="!state.currentUser"
        :on-success="handleAuthSuccess"
        :call-lobby-enter="callLobbyEnter"
      >
        <template #default="{ createDemoUser }">
          <button
            class="link"
            style="color: white"
            v-on:click="
              createDemoUser({
                tutorial: {
                  tutorial: 'lobby-tutorial-sales',
                  step: 'teambuilding',
                },
              })
            "
          >
            Меня интересуют корпоративные игры
          </button>
        </template>
      </auth-form>
    </template>

    <template #custom-layout>
      <iframe
        v-if="iframeScr"
        :src="iframeScr"
        :id="`gameIframe`"
        allowfullscreen
      />
    </template>

    <!-- Пример переопределения элемента game целиком -->
    <template #menu-item-game>
      <games class="menu-item-content" :showGameIframe="showGameIframe" />
    </template>
  </lobby>
</template>

<script>
import lobby from "~/lib/lobby/front/Lobby.vue";
import authForm from "~/lib/lobby/front/components/AuthForm.vue";
import games from "~/lib/lobby/front/components/games.vue";

export default {
  components: {
    lobby,
    authForm,
    games,
  },
  data() {
    return {
      iframeScr: "",
    };
  },
  watch: {
    "userData.gameId": function (val) {
      if (!val) {
        this.iframeScr = "";
      }
    },
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
        text: "Чем могу помочь?",
        bigControls: true,
        buttons: [
          {
            text: "Открой мой профиль",
            action: async function () {
              this.menu = null;
              this.showProfile();
            },
          },
          {
            text: "Активировать подсказки",
            action: async function () {
              await api.action
                .call({
                  path: "helper.api.restoreLinks",
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
            text: "Покажи доступные обучения",
            action: {
              text: `Выбери нужное обучение в списке, чтобы запустить его повторно:
              `,
              showList: [
                {
                  title: "Стартовое приветствие",
                  action: { tutorial: "lobby-tutorial-start" },
                },
                {
                  title: "Игровая комната",
                  action: { tutorial: "lobby-tutorial-menuGame" },
                },
                {
                  title: "Корпоративные игры в тематике ИТ",
                  action: {
                    tutorial: "lobby-tutorial-menuGameReleaseCorporate",
                  },
                },
                {
                  title: "Корпоративные игры для автобизнеса",
                  action: { tutorial: "lobby-tutorial-menuGameAutoPoker" },
                },
              ],
              buttons: [
                { text: "Назад в меню", action: "init" },
                { text: "Спасибо", action: "exit", exit: true },
              ],
            },
          },
          { text: "Спасибо, ничего не нужно", action: "exit", exit: true },
        ],
      };
    },
  },
  methods: {
    showGameIframe({ deckType }) {
      window.iframeEvents = window.iframeEvents || [];
      window.iframeEvents.push({
        data: {
          emit: { name: "updateStore", data: { lobby: this.store.lobby } },
        },
        event: (postMessageData) => {
          const $iframe = document.querySelector("#gameIframe");
          $iframe.contentWindow.postMessage(postMessageData, "*");
        },
      });

      const game = this.lobby.gameServers[deckType];

      function encodeUri(state) {
        return Object.entries({
          iframe: true,
          lobbyOrigin: state.serverOrigin,
          userId: state.currentUser,
          lobbyId: state.currentLobby,
          token: state.currentToken,
        })
          .map((pair) => pair.map(encodeURIComponent).join("="))
          .join("&");
      }

      this.$emit("show-game-iframe", {
        deckType,
        game,
        iframeSrc: game.url + "?" + encodeUri(this.state),
      });
    },

    customMenu() {
      const menuWrapper = tutorial.menuWrapper(this.userData);
      const menuButtonsMap = tutorial.menuButtonsMap(this.tutorialActions);

      const { cancel, tutorials, helperLinks } = menuButtonsMap;
      const fillTutorials = tutorials({
        showList: [
          {
            title: "Стартовое приветствие",
            action: { tutorial: "lobby-tutorial-start" },
          },
          {
            title: "Игровая комната",
            action: { tutorial: "lobby-tutorial-menuGame" },
          },
          {
            title: "Корпоративные игры в тематике ИТ",
            action: { tutorial: "lobby-tutorial-menuGameReleaseCorporate" },
          },
          {
            title: "Корпоративные игры для автобизнеса",
            action: { tutorial: "lobby-tutorial-menuGameAutoPoker" },
          },
        ],
      });

      const self = this;
      return menuWrapper({
        buttons: [
          cancel(),
          {
            text: "Открой мой профиль",
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
    this.state.emit.restoreGame = async (data) => {
      const { deckType, gameType, gameId, needLoadGame } = data;
      window.iframeEvents.push({
        data: {
          args: [{ deckType, gameType, gameId, needLoadGame }],
        },
        event: ({ args }) => {
          const $iframe = document.querySelector("#gameIframe");
          $iframe.contentWindow.postMessage(
            { path: "game.api.restore", args },
            "*",
          );
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
      console.log("iframeDead", { events });
      // for (const { event, data } of events) {
      //   event(data);
      // }
    };
    this.state.emit.hideGameIframe = () => {
      this.iframeScr = "";
    };
  },
};
</script>
<style lang="scss">
@import "@/mixins.scss";

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
</style>
