({
  steps: {
    hello: {
      initialStep: true,
      text: `Это игровые колоды с несколькими вариантами игр для каждой. <a>Рекомендую пройти отдельные обучения по конкретным колодам.</a>`,
      active: { selector: '.select-btn.wait-for-select:not(.disabled)', css: { boxShadow: '0px 0px 10px 4px white' } },
      actions: {
        before: ({ $root }) => {
          const $item = $root.querySelector('.menu-item.game.pinned');
          if (!$item) $root.querySelector('.menu-item.game > label')?.click();

          const $btn = $root.querySelector('.menu-item-content.games .select-btn.active');
          if ($btn) $btn.click(); // скрываем открытые конфиги
        },
      },
      buttons: [
        { text: 'Продолжай', step: 'type' },
        { text: 'Я разберусь', action: 'exit' },
      ],
    },
    type: {
      text: 'Это список идущих прямо сейчас и ожидающих начала игр.',
      active: [
        { selector: '.game-list-container .tutorial-games', css: { boxShadow: 'none' } },
        { selector: '.game-list-container .no-games-label', css: { display: 'none' } },
        { selector: '.game-list-container', css: { boxShadow: 'inset 0 0 20px 10px white' } },
      ],
      buttons: [{ text: 'Продолжай', step: 'settings' }, { text: 'exit', action: 'exit' }],
    },
    settings: {
      initialStep: true,
      text: 'Это тип и основные настройки игры (время на ход, количество игроков и т.п.).',
      active: [
        { selector: '.game-list-container .tutorial-games', css: { boxShadow: 'none' } },
        { selector: '.game-list-container .no-games-label', css: { display: 'none' } },
        { selector: '.game-list-container .game-config-info', css: { boxShadow: '0 0 10px 4px white' } },
      ],
      buttons: [{ text: 'Дальше', step: 'teams' }, { text: 'exit', action: 'exit' }],
    },
    teams: {
      initialStep: true,
      text: 'Это иконка для открытия список команд (<a>только у корпоративных игр</a>). Можно присоединиться к любой команде на выбор.',
      active: [
        { selector: '.game-list-container .tutorial-games', css: { boxShadow: 'none' } },
        { selector: '.game-list-container .no-games-label', css: { display: 'none' } },
        { selector: '.game-list-container .show-teams', css: { boxShadow: '0 0 10px 4px white' } },
      ],
      actions: {
        before: ({ $root }) => {
          const $showTeamsBtn = $root.querySelector('.game-list-container .show-teams');
          if (!$showTeamsBtn.classList.contains('open')) $showTeamsBtn.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'join' }, { text: 'exit', action: 'exit' }],
    },
    join: {
      text: 'Это кнопки <a>для присоединения к игре</a>.',
      active: [
        { selector: '.game-list-container .tutorial-games', css: { boxShadow: 'none' } },
        { selector: '.game-list-container .no-games-label', css: { display: 'none' } },
        { selector: '.game-list-container .join-btn:not(.viewer)', css: { boxShadow: '0 0 20px 10px white' } },
      ],
      buttons: [{ text: 'Дальше', step: 'view' }, { text: 'exit', action: 'exit' }],
    },
    view: {
      text: 'Можно посмотреть игру <a>в качестве наблюдателя</a>.',
      active: [
        { selector: '.game-list-container .tutorial-games', css: { boxShadow: 'none' } },
        { selector: '.game-list-container .no-games-label', css: { display: 'none' } },
        { selector: '.game-list-container .join-btn.viewer', css: { boxShadow: '0 0 20px 10px white' } },
      ],
      buttons: [{ text: 'Спасибо', action: 'exit' }],
    }
  },
});
