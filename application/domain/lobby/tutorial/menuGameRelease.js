({
  steps: {
    hello: {
      initialStep: true,
      text: `Для начала нужно выбрать колоду бизнес-карт, которой ты будешь играть (прямо сейчас доступна только колода "Релиз").`,
      active: '.select-btn.wait-for-select:not(.disabled)',
      actions: {
        before: ({ $root }) => {

        },
      },
      buttons: [
        { text: 'Продолжай', step: 'type' },
        { text: 'Я разберусь', action: 'exit' },
      ],
    },
    type: {
      text: 'Далее нужно выбрать тип игры. Предлагается несколько вариантов на выбор для одного, двух и трех человек. Важно уточнить, что ИИ еще не настроен, так что поиграть одному в режим для нескольких человек пока что не удастся.',
      // text: 'Далее нужно выбрать тип игры. Предлагается три варианта на выбор: \r\n "Фриланс" - игра для одного \r\n "Дуэль" - игра 1-на-1 против другого игрока* \r\n "Каждый за себя" - игра для троих человек* \r\n * игра против ИИ еще не поддерживается, так что если вам не с кем играть, то выбирайте режим "Фриланс".',
      active: '.select-btn.wait-for-select:not(.disabled)',
      actions: {
        before: ({ $root }) => {
          const $block = $root.querySelector('.menu-item.game.pinned');
          if (!$block) $root.querySelector('.menu-item.game > label')?.click();
          const $item = $root.querySelector('.game-block');
          if (!$item) $root.querySelector('.select-btn.game-release.wait-for-select:not(.disabled)')?.click();
        },
      },
      buttons: [{ text: 'Продолжай', step: 'single' }, { text: 'exit', action: 'exit' }],
    },
    single: {
      text: '"Фриланс" - игра для одного человека, по своему формату напоминающая раскладывание пасьянса. Цель игры - завершить заполнение поля раньше, чем количество пустых зон на поле превысит количество костяшек в колоде. Новые зоны на поле будут появляться каждый раз, когда колода карт-событий окажется пустой.',
      active: '.select-btn.wait-for-select.single',
      buttons: [{ text: 'Дальше', step: 'duel' }, { text: 'exit', action: 'exit' }],
    },
    duel: {
      text: '"Дуэль" - игра для двоих игроков, которые соревнуются между собой. Цель игры - заполнить все зоны поля, при этом победителем считается тот, кто положил последнюю недостающую костяшку.',
      active: '.select-btn.wait-for-select.duel',
      buttons: [{ text: 'Дальше', step: 'ffa' }, { text: 'exit', action: 'exit' }],
    },
    ffa: {
      text: '"Каждый за себя" - разновидность дуэли, но для троих игроков одновременно. Правила такие же - побеждает тот, кто положит последнюю костяшку на поле',
      active: '.select-btn.wait-for-select.ffa',
      buttons: [{ text: 'Дальше', step: 'config' }, { text: 'exit', action: 'exit' }],
    },
    config: {
      text: 'Для каждого типа игры доступны 3 уровня сложности. При этом чем сложнее игра, тем больше денег будет заработано по ее итогам.',
      active: '.select-btn.wait-for-select:not(.disabled)',
      actions: {
        before: ({ $root }) => {
          const $item = $root.querySelector('.game-config-block');
          if (!$item) $root.querySelector('.select-btn.wait-for-select:not(.disabled)')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'blitz' }, { text: 'exit', action: 'exit' }],
    },
    blitz: {
      text: '"Блиц" - это самый простой и самый быстрый вариант игры. В нем карты ежедневных событий добавляются непосредственно в руку игрока.',
      active: '.select-btn.wait-for-select.blitz',
      buttons: [{ text: 'Дальше', step: 'standart' }, { text: 'exit', action: 'exit' }],
    },
    standart: {
      text: '"Стандарт" отличается от блица тем, что он обычно играется на большем количестве игровых блоков, а карты ежедневных событий в начале хода могут быть разыграны только в текущем ходу.',
      active: '.select-btn.wait-for-select.standart',
      buttons: [{ text: 'Дальше', step: 'hardcore' }, { text: 'exit', action: 'exit' }],
    },
    hardcore: {
      text: '"Хардкор" - самый сложный, но в тоже время и самый прибыльный режим. Главной его отличительной особенностью является то, что ежедневные события срабатывают автоматически в начале хода.',
      active: '.select-btn.wait-for-select.hardcore',
      buttons: [{ text: 'Дальше', step: 'time' }, { text: 'exit', action: 'exit' }],
    },

    time: {
      text: 'Непосредственно перед началом игры можно выбрать время на ход. Оно не может превышать 120 секунд, но и не должно быть меньше 15 секунд.',
      active: '.timer',
      actions: {
        before: ({ $root }) => {
          const $item = $root.querySelector('.game-start-block');
          if (!$item) $root.querySelector('.select-btn.wait-for-select:not(.disabled)')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'exit' }, { text: 'exit', action: 'exit' }],
    },

    exit: {
      text: 'Для начала игры нажмите соответствующую кнопку.',
      active: '.game-start-block .select-btn',
      buttons: [{ text: 'Спасибо', action: 'exit' }],
    },
  },
});
