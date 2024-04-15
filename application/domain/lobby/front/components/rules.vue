<template>
  <perfect-scrollbar>
    <div>
      <ul>
        <li class="disabled">
          <label class="not-disabled">Игра "Релиз"</label>
          <div>Игра про ИТ-разработку</div>
          <ul>
            <li>
              <label>
                <a :href="lobby.gameServers.release?.serverUrl + '/rules/deck.pdf'" target="_blank">
                  Правила игры
                </a>
              </label>
              <hr />
              <span v-on:click="showGallery('release')">Список карт</span>
            </li>
          </ul>
        </li>
        <li class="disabled">
          <label>Автобизнес</label>
          <div>Колода для игр про продажи автомобилей</div>
          <ul>
            <li>
              <label>
                <a :href="lobby.gameServers.auto?.serverUrl + '/rules/deck.pdf'" target="_blank">
                  Описание колоды
                </a>
              </label>
              <hr />
              <span v-on:click="showGallery('auto', 'car')">Карты авто</span><br />
              <span v-on:click="showGallery('auto', 'service')">Карты сервисов</span><br />
              <span v-on:click="showGallery('auto', 'client')">Карты клиентов</span><br />
              <span v-on:click="showGallery('auto', 'feature')">Карты особенностей</span><br />
            </li>
            <li>
              <label>
                <a :href="lobby.gameServers.auto?.serverUrl + '/rules/sales.pdf'" target="_blank">
                  Игра "Авто-продажи"
                </a>
              </label>
            </li>
            <li>
              <label>
                <a :href="lobby.gameServers.auto?.serverUrl + '/rules/auction.pdf'" target="_blank">
                  Игра "Авто-аукцион"
                </a>
              </label>
            </li>
            <li>
              <label>
                <a :href="lobby.gameServers.auto?.serverUrl + '/rules/express.pdf'" target="_blank">
                  Игра "Авто-экспресс"
                </a>
              </label>
            </li>
          </ul>
        </li>
        <li class="disabled">
          <label>Скорринг</label>
          <div>Колода для игр про работу в банках</div>
          <ul>
            <li>
              <label>
                <a :href="state.serverOrigin + '/pdf/rules/bank-deck.pdf'" target="_blank">
                  Правила игры
                </a>
              </label>
              
              <hr />
              <span v-on:click="showGallery('bank', 'product')">Карты продуктов</span><br />
              <span v-on:click="showGallery('bank', 'service')">Карты сервисов</span><br />
              <span v-on:click="showGallery('bank', 'scoring')">Карты скоринга</span><br />
              <span v-on:click="showGallery('bank', 'client')">Карты клиентов</span><br />
              <span v-on:click="showGallery('bank', 'feature')">Карты особенностей</span><br />
            </li>
            <li>
              <label>
                <a :href="state.serverOrigin + '/pdf/rules/bank-sales.pdf'" target="_blank">
                  Игра "Банк-продаж"
                </a>
              </label>
            </li>
            <li>
              <label>
                <a :href="state.serverOrigin + '/pdf/rules/bank-risks.pdf'" target="_blank">
                  Игра "Банк-рисков"
                </a>
              </label>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </perfect-scrollbar>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

export default {
  components: {
    PerfectScrollbar,
  },
  props: {},
  data() {
    return {};
  },
  watch: {},
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      return this.state.store || {};
    },
    lobby() {
      return this.store.lobby?.[this.state.currentLobby] || {};
    },
  },
  methods: {
    async showGallery(deck, group) {
      const { serverUrl } = this.lobby.gameServers[deck] || {};
      let serverOrigin;
      let images = [];
      if (serverUrl) {
        serverOrigin = serverUrl;

        const method = 'POST';
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({ path: 'game.api.cards', args: [{ selectGroup: group }] });
        images = await fetch(serverOrigin + '/api/action/public', { method, headers, body }).then((res) =>
          res.text().then((packet) => {
            const {
              result: { cards },
            } = JSON.parse(packet);
            return cards;
          })
        );
      } else {
        serverOrigin = this.state.serverOrigin;
        switch (deck) {
          case 'bank':
            switch (group) {
              case 'product':
                for (let i = 1; i <= 32; i++) images.push(`bank/product/product${i}.png`);
                break;
              case 'service':
                for (let i = 1; i <= 32; i++) images.push(`bank/service/service${i}.png`);
                break;
              case 'client':
                for (let i = 1; i <= 24; i++) images.push(`bank/client/client${i}.png`);
                break;
              case 'feature':
                for (let i = 1; i <= 24; i++) images.push(`bank/feature/spec${i}.png`);
                break;
              case 'scoring':
                for (let i = 1; i <= 8; i++) images.push(`bank/scoring/scoring${i}.png`);
                break;
            }
            break;
        }
      }

      new Fancybox(
        images.map((path) => ({
          src: `${serverOrigin}/img/cards/${path}`,
          type: 'image',
        }))
      );
    },
  },
  async created() {},
  async mounted() {},
  async beforeDestroy() {},
};
</script>
<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css" />
<style lang="scss"></style>
