({
  utils: {
    async showTopBlock(data) {
      const { $root } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки

      const $item = $root.querySelector('.menu-item.top.pinned');
      console.log("showTopBlock item", $item);
      if (!$item) $root.querySelector('.menu-item.top > label').click();
      const $close = $root.querySelector('.menu-item-content .title .close');
      console.log("showTopBlock close", $close);
      if ($close) $close.click();

      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
    },
    async showRankings(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      const selector = '.menu-item.top.pinned .toggle-game';
      
      let $item = $root.querySelector(selector);
      console.log('showRankings', $item);
      if (!$item) {
        await utils.showTopBlock(data);
        $item = $root.querySelector(selector);
        console.log('showRankings if (!$item) {', $item);
      }
      $item.click();

      await new Promise(resolve => setTimeout(resolve, 0)); // ждем отрисовки фронтенда
    },
    async showRating(data) {
      const { $root, utils } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки
      const selector = '.menu-item.top.pinned .toggle-ranking';

      let $item = $root.querySelector(selector);
      if (!$item) {
        await utils.showRankings(data);
        $item = $root.querySelector(selector);
      }
      $item.click();

      // const $btn = $root.querySelector('.menu-item.top.pinned .menu-item-content .title .close');
      // console.log('showRating', $btn);
      // if (!$btn) await utils.showRankings(data);
    }
  },
  steps: {
    top: {
      initialStep: true,
      text: `
        Для каждой игровой колоды свой список рейтингов.
      `,
      actions: { before: async ({ $root, utils }) => await utils.showTopBlock({ $root }) },
      buttons: [
        { text: 'Продолжай', step: 'list' },
        { text: 'Я разберусь', action: 'exit' },
      ],
    },
    list: {
      text: `
        Каждый рейтинг формируется по своим показателям. Например, это может быть наибольшее количество игр или полученный доход.
      `,
      actions: { before: async ({ $root, utils }) => await utils.showRankings({ $root, utils }) },
      buttons: [
        { text: 'Продолжай', step: 'rating' }
      ],
    },
    rating: {
      text: `
        В таблице 5 лучших результатов. <a>Твой личный результат выделен по цвету среди все остальных строк</a>.
      `,
      actions: { before: async ({ $root, utils }) => await utils.showRating({ $root, utils }) },
      active: 'tr.iam',
      buttons: [
        { text: 'Дальше', step: 'exit' }
      ],
    },
    exit: {
      text: `
        Это иконка для возврата к списку рейтингов.
      `,
      actions: { before: async ({ $root, utils }) => await utils.showRating({ $root, utils }) },
      active: { selector: '.menu-item-content .title .close', css: { boxShadow: '0px 0px 10px 10px #f4e205' } },
      buttons: [
        { text: 'Спасибо', action: 'exit' }
      ],
    },
  },
});
