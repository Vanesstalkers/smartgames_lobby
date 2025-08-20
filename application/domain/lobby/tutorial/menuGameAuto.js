({
  utils: {
    async transferToGameTypeBlock(data) {
      const { $root } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки

      const $breadcrumbs = $root.querySelector('.menu-item-content.games .breadcrumbs .select-btn.selected');
      if ($breadcrumbs) $breadcrumbs.click();

      await new Promise((resolve) => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
      const $btn = $root.querySelector('.select-btn.game-auto');
      if ($btn) $btn.click();
      await new Promise((resolve) => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
    },
    async transferToConfigBlock(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      await utils.transferToGameTypeBlock(data);

      $root.querySelector('.game-block.auto-game .select-btn.sales').click();
      await new Promise((resolve) => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    },
    async transferToSettingsBlock(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      await utils.transferToConfigBlock(data);

      $root.querySelector('.auto-game-config .select-btn.ai').click();
      await new Promise((resolve) => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    },
  },
  steps: {
    deck: {
      initialStep: true,
      text: `
        Колода бизнес-карт АВТОБИЗНЕС позволяет проводить <a>симуляции процессов продажи автомобилей в салонах автодилеров</a>. Доступны несколько типов игр, включая одиночный и командный.
      `,
      actions: { before: async (data) => await data.utils.transferToGameTypeBlock(data) },
      buttons: [
        { text: 'Продолжай', step: 'type' },
        { text: 'Я разберусь', action: 'exit' },
      ],
    },
    type: {
      text: `
        Варианты игры:
        
        АВТО-ПРОДАЖИ - самая простая игра <a>друг против друга или&nbsp;против&nbsp;AI</a>
        АВТО-АУКЦИОН - более сложная <a>игра для двоих</a>
        <span style="color: white; font-weight: bold;">БИЗНЕС-ПОКЕР - <a>формат корпоративной игры</a></span>
      `,
      actions: { before: async (data) => await data.utils.transferToGameTypeBlock(data) },
      active: '.auto-game .select-btn:not(.disabled)',
      buttons: [{ text: 'Продолжай', step: 'config' }],
    },
    config: {
      text: `
        Режим игры позволяет выбрать соперника:
        
        ДУЭЛЬ - <a>живой человек</a>
        ОДИН ИГРОК - <a>искусственный интелект</a>
      `,
      actions: { before: async (data) => await data.utils.transferToConfigBlock(data) },
      active: '.auto-game-config .select-btn',
      buttons: [{ text: 'Дальше', step: 'time' }],
    },
    time: {
      text: `
        На сложность игры так же влияет <a>значение&nbsp;таймера,&nbsp;доступного&nbsp;на&nbsp;ход</a>.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .timer', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
      buttons: [{ text: 'Дальше', step: 'ai' }],
    },
    ai: {
      text: `
        В одиночном режиме игры можно выбрать <a>уровень&nbsp;мастерства&nbsp;искусственного&nbsp;интеллекта</a>.
      `,
      actions: {
        before: async (data) => {
          await data.utils.transferToSettingsBlock(data);

          const { $root } = data;
          const $aiBlock = $root.querySelector('.game-start-block .ai-config');
          const skipStep = $aiBlock ? false : { goto: { step: 'exit' } };
          return { skipStep };
        },
      },
      active: {
        selector: '.game-start-block .ai-config',
        css: { boxShadow: 'inset white 0px 0px 10px 4px' },
      },
      buttons: [{ text: 'Дальше', step: 'exit' }],
    },
    exit: {
      text: `
        Для начала игры необходимо нажать соответствующую кнопку.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: '.game-start-block .select-btn',
      buttons: [{ text: 'Спасибо', action: 'exit' }],
    },
  },
});
