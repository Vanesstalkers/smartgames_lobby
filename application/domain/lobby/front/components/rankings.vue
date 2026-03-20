<template>
  <perfect-scrollbar ref="scrollRankings">
    <div class="rankings">
      <div v-if="!rankingMenuOpened" class="title">
        <div>{{ activeRating?.title }}</div>
        <div v-on:click="rankingMenuOpened = true" class="close" />
      </div>
      <div v-if="rankingMenuOpened" class="menu">
        Выбор рейтинга:
        <div v-for="game in rankingGameList" :key="game.code" class="menu-game-item">
          <h4 class="toggle-game" v-on:click="toggleMenuGameItem({ gameCode: game.code, event: $event })">
            <span>Игра "{{ game.title }}"</span>
          </h4>
          <ul v-if="menuGameItems[game.code]?.open">
            <li v-for="ranking in game.rankingList" :key="ranking.title">
              <span class="toggle-ranking" v-on:click="selectRating({ game, ranking })">{{ ranking.title }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="!rankingMenuOpened" class="content">
        <PerfectScrollbar>
          <table v-if="activeRating">
            <tr>
              <th v-for="header in activeRatingHeaders" :key="header.code" :code="header.code">
                {{ header.title }}
              </th>
            </tr>
            <tr
              v-for="(item, idx) in activeRating.list"
              :key="idx"
              :class="[item.iam ? 'iam' : '', item.noGames ? 'no-games' : '']"
            >
              <td v-for="header in activeRatingHeaders" :key="header.code + idx" :code="header.code">
                {{ item[header.code] }}
              </td>
            </tr>
          </table>
        </PerfectScrollbar>
      </div>
    </div>
  </perfect-scrollbar>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar';

export default {
  components: {
    PerfectScrollbar,
  },
  props: {
    lobby: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      rankingMenuOpened: true,
      activeRating: null,
      menuGameItems: {},
    };
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    rankingGameList() {
      const rankings = this.lobby?.rankings || {};
      const gameServers = this.lobby?.gameServers || {};
      return Object.entries(rankings).map(([code, game]) => ({
        code,
        ...gameServers[code],
        rankingList: Object.entries(game).map(([rankingCode, ranking]) => ({ ...ranking, code: rankingCode })),
      }));
    },
    activeRatingHeaders() {
      return [{ code: 'idx' }, { code: 'player' }].concat(this.activeRating?.headers || []);
    },
  },
  methods: {
    toggleMenuGameItem({ gameCode, event }) {
      if (!this.menuGameItems[gameCode]) this.$set(this.menuGameItems, gameCode, {});
      const state = !this.menuGameItems[gameCode]?.open;
      this.$set(this.menuGameItems[gameCode], 'open', state);
      if (state === true) {
        this.$nextTick(() => {
          const game = event.target.closest('.menu-game-item');
          const scrollTo = game.offsetTop + game.clientHeight;
          if (this.$refs.scrollRankings.$el.scrollTop < scrollTo) this.$refs.scrollRankings.$el.scrollTop = scrollTo;
        });
      }
    },
    getUsersRankings({ gameType, usersList = [] }) {
      const lobbyUsers = this.$root.state.store.lobby[this.state.currentLobby].users || {};
      const result = usersList.map((userId, idx) => ({
        idx: idx + 1,
        ...(lobbyUsers[userId]?.rankings?.[gameType] || {}),
        player: lobbyUsers[userId]?.name || 'имя не указано',
        iam: userId === this.state.currentUser,
      }));
      if (result.filter((user) => user.iam).length === 0) {
        const userId = this.state.currentUser;
        const user = lobbyUsers[userId] || {};
        result.push({ player: '...' });
        const iamItem = user.rankings?.[gameType] ? { ...user.rankings[gameType] } : { noGames: true };
        iamItem.idx = '-';
        iamItem.iam = true;
        iamItem.player = user.name || 'игрок (имя не указано)';
        result.push(iamItem);
      }
      return result;
    },
    selectRating({ game, ranking }) {
      this.rankingMenuOpened = false;
      this.activeRating = {
        title: `${ranking.title} (Игра "${game.title}")`,
        headers: ranking.headers,
        list: this.getUsersRankings({ gameType: game.code, usersList: ranking.usersTop }),
      };
    },
  },
};
</script>
