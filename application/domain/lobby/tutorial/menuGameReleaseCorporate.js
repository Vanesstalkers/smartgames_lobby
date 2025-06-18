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

      const $releaseBtn = $root.querySelector('.select-btn.game-release');
      if ($releaseBtn) $releaseBtn.click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда

      $root.querySelector('.menu-item-content.games .game-block.release-game .select-btn.corporate').click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    },
    async transferToSettingsBlock(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      await utils.transferToConfigBlock(data);

      $root.querySelector('.game-config-block.release-game-config .competition').click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    }
  },
  steps: {
    corporate: {
      initialStep: true,
      text: `
        Данный режим предназначен для корпоративных игр и он представлен в двух форматах:

        СОРЕВНОВАНИЕ - <a>нескольких команд борются за победу</a>
        КООПЕРАЦИЯ - <a>игроки, разбитых на несколько групп, достигают общей цели</a>
      `,
      actions: { before: async (data) => await data.utils.transferToConfigBlock(data) },
      active: '.game-config-block.release-game-config .select-btn',
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
        Через установленное количество раундов игра прекратится и все участники будут признаны проигравшими.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .rounds', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
      buttons: [
        { text: 'Дальше', step: 'teams' }
      ],
    },
    teams: {
      text: `
        На сложность игры так же влияет <a>значение таймера, доступного на ход</a>.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .teams', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
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
