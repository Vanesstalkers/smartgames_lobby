({
  steps: {
    hello: {
      // initialStep: true,
      superPos: true,
      text: `Приветствую на портале обучающих настольных бизнес-игр.\r\n<a>Я могу провести короткую экскурсию</a>.`,
      buttons: [
        { text: 'Продолжай', step: 'fullscreen' },
        { text: 'Я разберусь', step: 'exit', exit: true },
      ],
    },
    fullscreen: {
      superPos: true,
      text: 'В левом верхнем углу кнопка, которая включает <a>режим полного экрана</a>. Повторное нажатие на нее отключит этот режим.',
      active: '.fullscreen-btn',
      buttons: [{ text: 'Продолжай', step: 'games' }],
    },
    games: {
      pos: {
        desktop: 'bottom-left',
        mobile: 'bottom-right',
      },
      text: 'В разделе ПРАВИЛА ИГР <a>список всех игр на портале</a>. Можно скачать <a>правила</a> в pdf-формате, а также посмотреть <a>все карты каждой колоды</a>.',
      actions: {
        before: ({ $root }) => {
          let $item = $root.querySelector('.menu-item.list.pinned');
          if (!$item) $root.querySelector('.menu-item.list > label')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'rates' }],
    },
    rates: {
      pos: {
        desktop: 'bottom-left',
        mobile: 'bottom-right',
      },
      text: 'В разделе ЗАЛ СЛАВЫ <a>рейтинги достижений всех игроков</a>. Там же ты найдешь и статистику по своим играм.',
      actions: {
        before: ({ $root }) => {
          let $item = $root.querySelector('.menu-item.list.pinned');
          if ($item) $root.querySelector('.menu-item.list > label')?.click();
          $item = $root.querySelector('.menu-item.top.pinned');
          if (!$item) $root.querySelector('.menu-item.top > label')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'chat' }],
    },
    chat: {
      pos: {
        desktop: 'bottom-right',
        mobile: 'bottom-right',
      },
      text: 'ЧАТ ПОРТАЛА предназначен для общения игроков между собой и <a>поиска соперника</a>. В том числе есть возможность написать личное сообщение.',
      actions: {
        before: ({ $root }) => {
          let $item = $root.querySelector('.menu-item.top.pinned');
          if ($item) $root.querySelector('.menu-item.top > label')?.click();
          $item = $root.querySelector('.menu-item.chat.pinned');
          if (!$item) $root.querySelector('.menu-item.chat > label')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'playground' }],
    },
    playground: {
      pos: {
        desktop: 'bottom-right',
        mobile: 'bottom-right',
      },
      text: 'В разделе ИГРОВАЯ КОМНАТА, ты можешь <a>начать новую партию в одиночном режиме или с соперниками</a>. Также присутствует режим наблюдателя, позволяющий наблюдать за чужими играми.',
      actions: {
        before: ({ $root }) => {
          let $item = $root.querySelector('.menu-item.chat.pinned');
          if ($item) $root.querySelector('.menu-item.chat > label')?.click();
          $item = $root.querySelector('.menu-item.game.pinned');
          if (!$item) $root.querySelector('.menu-item.game > label')?.click();
        },
      },
      buttons: [{ text: 'Дальше', step: 'exit' }],
    },
    exit: {
      initialStep: true,
      superPos: { showMenu: true },
      active: { selector: '.helper-guru', position: 'fixed' },
      actions: {
        _prepare: (step, { isMobile }) => {
          const replaceText = 'левом нижнем';
          step.text = step.text.replace('[[menu-position]]', replaceText);
        },
        profile: (data, self) => {
          self.showProfile();
        },
      },
      // text: '<div class="text-left"><a>Иконка в [[menu-position]] углу открывает МЕНЮ ИГРОКА</a>. Оно позволяет:\r\n- получить доступ к своему профилю;\r\n- повторно запустить любое обучение.\r\n\r\n<center>Рекомендую сразу заполнить профиль, установив свой личный логин, пароль и выбрав аватар для игры.</center></div>',
      text: 'В [[menu-position]] углу иконка МЕНЮ ИГРОКА. В нем можно:\r\n- <a>получить доступ к своему профилю</a>\r\n- <a>повторно запустить любое обучение</a>\r\n\r\n<center>Рекомендую сразу заполнить профиль, установив свой личный логин, пароль и выбрав аватар для игры.</center>',
      buttons: [
        { text: 'Перейти в профиль', icon: ['fas', 'user'], action: 'profile' },
        { text: 'Понятно', action: 'exit' },
      ],
    },
  },
});
