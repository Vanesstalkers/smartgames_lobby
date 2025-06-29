({
  utils: {
    async transferToGameTypeBlock(data) {
      const { $root } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки

      const $breadcrumbs = $root.querySelector('.menu-item-content.games .breadcrumbs .select-btn.selected');
      if ($breadcrumbs) $breadcrumbs.click();

      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
      const $releaseBtn = $root.querySelector('.select-btn.game-release');
      if ($releaseBtn) $releaseBtn.click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
    },
    async transferToConfigBlock(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      await utils.transferToGameTypeBlock(data);

      $root.querySelector('.game-block.release-game .select-btn.single').click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    },
    async transferToSettingsBlock(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      await utils.transferToConfigBlock(data);

      $root.querySelector('.release-game-config .select-btn.blitz').click();
      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда (для подсветки active-элементов)
    }
  },
  steps: {
    release: {
      initialStep: true,
      text: `
        Колода бизнес-карт РЕЛИЗ позволяет проводить <a>симуляции процессов ИТ-разработки</a>. Доступны несколько типов игр, включая одиночный и командный.
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
        
        ФРИЛАНС - <a>игра для одного игрока</a>
        ДУЭЛЬ - <a>игра на двоих друг против друга</a>
        КАЖДЫЙ ЗА СЕБЯ - <a>игра для 3-х игроков</a>
        КОРПОРАТИВНЫЕ ПРОЕКТЫ - <a>формат корпоративной игры</a>
      `,
      actions: { before: async (data) => await data.utils.transferToGameTypeBlock(data) },
      active: '.release-game .select-btn:not(.disabled)',
      buttons: [{ text: 'Продолжай', step: 'config' }],
    },
    config: {
      text: `
        Режим игры определяет ее сложность:
        
        БЛИЦ - <a>быстрая и простая игра</a>
        СТАНДАРТ - <a>базовый режим</a>
        ХАРДКОР - <a>для тех, кто любит потруднее</a>
      `,
      actions: { before: async (data) => await data.utils.transferToConfigBlock(data) },
      active: '.release-game-config .select-btn',
      buttons: [
        { text: 'Дальше', step: 'time' }
      ],
    },
    time: {
      text: `
        На сложность игры так же влияет <a>значение таймера, доступного на ход</a>.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: { selector: '.game-start-block .timer', css: { boxShadow: '0 0 20px 10px white', padding: '4px 10px' } },
      buttons: [
        { text: 'Дальше', step: 'exit' }
      ],
    },
    exit: {
      text: `
        Для начала игры необходимо нажать соответствующую кнопку.
      `,
      actions: { before: async (data) => await data.utils.transferToSettingsBlock(data) },
      active: '.game-start-block .select-btn',
      buttons: [
        { text: 'Спасибо', action: 'exit' }
      ],
    },
  },
});
