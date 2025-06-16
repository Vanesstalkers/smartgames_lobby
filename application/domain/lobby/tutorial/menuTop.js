({
  steps: {
    hello: {
      initialStep: true,
      text: `Для каждой игровой колоды свой список рейтингов.`,
      actions: {
        before: ({ $root }) => {
          const $item = $root.querySelector('.menu-item.top.pinned');
          if (!$item) $root.querySelector('.menu-item.top > label')?.click();
          const $close = $root.querySelector('.menu-item-content .title .close');
          if($close) $close.click();
        },
      },
      buttons: [
        { text: 'Продолжай', step: 'list' },
        { text: 'Я разберусь', action: 'exit' },
      ],
    },
    list: {
      text: 'Каждый рейтинг формируется по своим показателям. Например, это может быть наибольшее количество игр или полученный доход.',
      actions: {
        before: ({ $root }) => {
          $root.querySelector('.menu-item-content .menu-game-item .toggle-ranking')?.click();
        },
      },
      buttons: [{ text: 'Продолжай', step: 'rating' }],
    },
    rating: {
      text: 'В таблице 5 лучших результатов. <a>Твой личный результат выделен по цвету среди все остальных строк</a>.',
      active: 'tr.iam',
      actions: {
        before: ({ $root }) => {
          const $item = $root.querySelector('.menu-item-content .rankings .title');
          if (!$item) $root.querySelector('.menu-item-content .menu-game-item .toggle-ranking')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'exit' }],
    },
    exit: {
      text: 'Это иконка для возврата к списку рейтингов.',
      active: { selector: '.menu-item-content .title .close', css: { boxShadow: '0px 0px 10px 10px #f4e205' } },
      buttons: [{ text: 'Спасибо', action: 'exit' }],
    },
  },
});
