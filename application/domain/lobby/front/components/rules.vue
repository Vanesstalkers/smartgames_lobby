<template>
  <perfect-scrollbar>
    <div class="rules">
      <ul v-if="rulesSections && rulesSections.length">
        <li
          v-for="(section, sectionIndex) in rulesSections"
          :key="`${section.deck}-${sectionIndex}`"
          class="disabled"
        >
          <label class="not-disabled">{{ section.title }}</label>
          <div>{{ section.description }}</div>

          <ul>
            <li v-if="section.pdfLinks && section.pdfLinks.length">
              <label v-if="section.pdfLinks[0]">
                <a :href="getPdfHref(section.deck, section.pdfLinks[0])" target="_blank">{{
                  section.pdfLinks[0].label
                }}</a>
              </label>

              <hr v-if="section.galleries && section.galleries.length" />

              <span
                v-for="(galleryItem, galleryIndex) in section.galleries || []"
                :key="galleryIndex"
                class="gallery"
                v-on:click="showGallery(section.deck, galleryItem.selectGroup)"
              >{{ galleryItem.label }}</span
              ><br v-if="section.galleries && section.galleries.length" />
            </li>

            <li
              v-for="(pdfLink, pdfIndex) in (section.pdfLinks || []).slice(1)"
              :key="pdfIndex"
            >
              <label>
                <a :href="getPdfHref(section.deck, pdfLink)" target="_blank">{{ pdfLink.label }}</a>
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
import { FILTER_CONFIGS } from '~/lib/lobby/front/components/gallery-filters-config.mjs';

export default {
  name: 'rules',
  inject: ['updateGallery', 'fetchActionPublic'],
  components: {
    PerfectScrollbar,
  },
  props: {},
  data() {
    return {
      rulesSections: [],
    };
  },
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
  watch: {
    'lobby.gameServers': {
      immediate: true,
      handler() {
        this.loadRulesSections();
      },
    },
  },
  methods: {
    getFilterConfig(deck, group) {
      const key = group ? `${deck}.${group}` : deck;
      return FILTER_CONFIGS[key] || { filters: [] };
    },

    getPdfHref(deck, pdfLink) {
      if (!pdfLink?.path) return '';
      if (pdfLink.path.startsWith('http')) return pdfLink.path;

      const serverUrl = this.lobby.gameServers?.[deck]?.serverUrl || '';
      return `${serverUrl}${pdfLink.path}`;
    },

    async loadRulesSections() {
      const gameServers = this.lobby.gameServers || {};
      const deckOrder = ['release', 'auto', 'bank'];

      const decks = [
        ...deckOrder.filter((d) => !!gameServers?.[d]?.serverUrl),
        ...Object.keys(gameServers).filter((d) => !deckOrder.includes(d) && !!gameServers?.[d]?.serverUrl),
      ];

      const sections = [];
      for (const deck of decks) {
        const serverOrigin = gameServers[deck]?.serverUrl;
        if (!serverOrigin) continue;

        try {
          const data = await this.fetchActionPublic({
            serverOrigin,
            path: 'game.api.getRules',
            args: [],
          });
          const serviceRules = data?.result?.rules || [];

          serviceRules.forEach((section) => sections.push({ deck, ...section }));
        } catch (err) {
          console.error(`Failed to load rules for deck="${deck}"`, err);
        }
      }

      this.rulesSections = sections;
    },

    async showGallery(deck, selectGroup) {
      const { serverUrl: serverOrigin } = this.lobby.gameServers[deck] || {};
      if (!serverOrigin) return;

      const data = await this.fetchActionPublic({
        serverOrigin,
        path: 'game.api.cards',
        args: [{ selectGroup: selectGroup ?? null }],
      });

      const images = data?.result?.cards || [];

      const filterConfig = this.getFilterConfig(deck, selectGroup);
      // Галерея в глобальном лобби строит URL из `${serverOrigin}/img/cards/${img.path}`.
      // Чтобы не зависеть от $root.state.gameServerOrigin, делаем img.path абсолютным URL.
      const imagesWithAbsPath = (images || []).map((img) => {
        if (typeof img === 'string') return `${serverOrigin}/img/cards/${img}`;
        if (!img?.path) return img;
        return { ...img, path: `${serverOrigin}/img/cards/${img.path}` };
      });

      this.updateGallery(imagesWithAbsPath, filterConfig);
    },
  },
  async created() {},
  async mounted() {},
  async beforeDestroy() {},
};
</script>

<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css" />
<style scoped lang="scss">
.rules {
  label {
    > a:after {
      position: absolute;
      content: '';
      width: 16px;
      height: 16px;
      background-color: white;
      mask-image: url(@/assets/download.png);
      mask-size: 16px;
      -webkit-mask-image: url(@/assets/download.png);
      -webkit-mask-size: 16px;
      background-size: 16px;
      margin-left: 6px;
      background-repeat: no-repeat;
      margin-top: 8px;

      visibility: hidden;
    }

    &:hover {
      a::after {
        visibility: visible;
      }
    }
  }

  .gallery {
    display: block;

    &:after {
      position: absolute;
      content: '';
      width: 16px;
      height: 16px;
      background-color: white;
      mask-image: url(@/assets/gallery.png);
      mask-size: 16px;
      -webkit-mask-image: url(@/assets/gallery.png);
      -webkit-mask-size: 16px;
      background-size: 16px;
      margin-left: 4px;
      background-repeat: no-repeat;
      margin-top: 4px;

      visibility: hidden;
    }

    &:hover {
      &:after {
        visibility: visible;
      }
    }
  }
}
</style>

