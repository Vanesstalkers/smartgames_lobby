({
  utils: {
    async transferToConfigBlock(data) {
      const { $root, state: { isMobile } } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки

      if (isMobile) {
        $root.querySelectorAll('.menu-item.pinned:not(.game) label').forEach($el => $el.click());
      }

      const $item = $root.querySelector('.menu-item.game.pinned');
      if (!$item) $root.querySelector('.menu-item.game > label')?.click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда

      const $breadcrumbs = $root.querySelector('.menu-item-content.games .breadcrumbs .select-btn.selected');
      if ($breadcrumbs) $breadcrumbs.click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда

      const $btn = $root.querySelector('.select-btn.game-auto');
      if ($btn) $btn.click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда

      $root.querySelector('.menu-item-content.games .game-block.auto-game .select-btn.poker').click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    },
    async transferToSettingsBlock(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      await utils.transferToConfigBlock(data);

      const $btn = $root.querySelector('.game-config-block.auto-game-config .default');
      if ($btn) $btn.click(); // может не быть, так как для единственного конфига происходит автовыбор
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    }
  },
  steps: {
    initFromSales: {
      text: `
        Чтобы попасть в копроративный режим игры необходимо в&nbsp;ИГРОВОЙ&nbsp;КОМНАТЕ последовательно выбрать <a>Автобизнес&nbsp;>&nbsp;Бизнес-покер</a>.  
      `,
      actions: { before: async (data) => await data.utils.transferToConfigBlock(data) },
      active: { selector: '.breadcrumbs', css: { boxShadow: 'inset 0 0 20px 10px white', padding: '30px 0px' } },
      buttons: [
        { text: 'Продолжай', step: 'corporate' },
      ],
    },
    corporate: {
      initialStep: true,
      text: `
        Данный режим предназначен проведения тимбилдинга в формате карточной игры, напоминающей покер.
        Для получения практики в определении выигрышных комбинаций рекомендуется предварительно сыграть несколько игр против компьютера (<a>Автобизнес -> Авто-продажи -> Один игрок</a>).
      `,
      actions: { before: async (data) => await data.utils.transferToConfigBlock(data) },
      active: '.game-config-block.auto-game-config .select-btn',
      buttons: [
        { text: 'Продолжай', step: 'timer' },
        { text: 'Я разберусь', action: 'exit' }
      ],
    },
    timer: {
      text: `
        Чем меньше таймер, тем сложнее победить. <a>Для первых игр рекомендуется ставить значение не менее 60 секунд на ход</a>.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .timer', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
      buttons: [
        { text: 'Продолжай', step: 'rounds' }
      ],
    },
    rounds: {
      text: `
        Через установленное количество раундов игра прекратится и <a>победителем станет игрок с наибольшим количеством денег</a>.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .rounds', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
      buttons: [
        { text: 'Дальше', step: 'teams' }
      ],
    },
    teams: {
      text: `
        Игра начнется как только к ней подключаятся два игрока, однако <a>в&nbsp;процессе игры могут подключаться новые игроки</a>. Их&nbsp;количество ограничивается данной настройкой.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .max-players', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
      buttons: [
        { text: 'Дальше', step: 'exit' }
      ],
    },
    exit: {
      text: `
        Для начала игры необходимо нажать соответствующую кнопку.
      `,
      active: '.game-start-block .select-btn',
      buttons: [
        { text: 'Спасибо', action: 'exit' }
      ],
    },
  },
});
