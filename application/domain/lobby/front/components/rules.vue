<template>
  <perfect-scrollbar>
    <div>
      <ul>
        <li class="disabled">
          <label class="not-disabled">Игра "Релиз"</label>
          <div>Игра про ИТ-разработку</div>
          <ul>
            <li>
              <label v-on:click.stop="showRules('release')">Правила игры</label>
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
              <label v-on:click.stop="showRules('auto-deck')">Описание колоды</label>
              <hr />
              <span v-on:click="showGallery('auto', 'car')">Карты авто</span><br />
              <span v-on:click="showGallery('auto', 'service')">Карты сервисов</span><br />
              <span v-on:click="showGallery('auto', 'client')">Карты клиентов</span><br />
              <span v-on:click="showGallery('auto', 'feature')">Карты особенностей</span><br />
            </li>
            <li>
              <label v-on:click.stop="showRules('auto-sales')">Игра "Авто-продажи"</label>
            </li>
            <li>
              <label v-on:click.stop="showRules('auto-auction')">Игра "Авто-аукцион"</label>
            </li>
            <li>
              <label v-on:click.stop="showRules('auto-express')">Игра "Авто-экспресс"</label>
            </li>
          </ul>
        </li>
        <li class="disabled">
          <label>Скорринг</label>
          <div>Колода для игр про работу в банках</div>
          <ul>
            <li>
              <label v-on:click.stop="showRules('bank-deck')">Описание колоды</label>
              <hr />
              <span v-on:click="showGallery('bank', 'product')">Карты продуктов</span><br />
              <span v-on:click="showGallery('bank', 'service')">Карты сервисов</span><br />
              <span v-on:click="showGallery('bank', 'scoring')">Карты скоринга</span><br />
              <span v-on:click="showGallery('bank', 'client')">Карты клиентов</span><br />
              <span v-on:click="showGallery('bank', 'feature')">Карты особенностей</span><br />
            </li>
            <li>
              <label v-on:click.stop="showRules('bank-sales')">Игра "Банк-продаж"</label>
            </li>
            <li>
              <label v-on:click.stop="showRules('bank-risks')">Игра "Банк-рисков"</label>
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
    showRules(name) {
      api.action
        .call({
          path: 'helper.api.action',
          args: [{ tutorial: 'lobby-tutorial-gameRules', step: name }],
        })
        .catch(prettyAlert);
      return;
    },
    async showGallery(deck, group) {
      const { serverUrl } = this.lobby.gameServers[deck] || {};
      console.log({ deck, group, serverUrl });
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
