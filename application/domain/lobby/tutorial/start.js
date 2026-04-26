/* eslint-disable max-len */
({
  utils: {
    ...lib.lobby.tutorial.menuGame.utils,
    async showGamesBlock(data) {
      const { $root } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки

      const $label = $root.querySelector('.menu-item.game:not(.pinned) label');
      if ($label) $label.click();

      await new Promise((resolve) => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
    },
  },
  steps: {
    init: {
      initialStep: true,
      text: `
        Выбери одну из предложенных игр:
        <a>ИГРА НА МИЛЛИАРД</a> - официальный бизнес-тренажёр Академии Х10 Игоря Рыбакова
        <a>РЕЛИЗ</a> - симулятор ИТ-разработки
        <a>АВТОБИЗНЕС</a> - симулятор продаж автомобилей
        <a>БАНКИНГ</a> - симулятор продаж банковских продуктов
      `,
      actions: {
        before: async (data) => await data.utils.showGamesBlock(data),
      },
      active: '.menu-item-content.games .game-types .select-btn',
      buttons: [{ text: 'Хорошо', action: 'exit', exit: true }],
    },
  },
});
