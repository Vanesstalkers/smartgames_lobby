({
  steps: {
    hello: {
      initialStep: true,
      text: `В чате игроки <a>находят соперников по игре</a> и просто общаются между собой.`,
      actions: {
        before: ({ $root }) => {
          const $item = $root.querySelector('.menu-item.chat.pinned');
          if (!$item) $root.querySelector('.menu-item.chat > label')?.click();
        },
      },
      buttons: [
        { text: 'Продолжай', step: 'username' },
        { text: 'Я разберусь', action: 'exit' },
      ],
    },
    username: {
      text: 'Для того, чтобы писать в чате, <a>необходимо указать свое имя</a>.',
      active: '.menu-item.chat .chat-controls-alert',
      actions: {
        before: ({ $root }) => {
          const $inputNameForm = $root.querySelector('.menu-item.chat .chat-controls-alert');
          const skipStep = $inputNameForm ? false : true;
          return { skipStep };
        },
      },
      pos: {
        desktop: 'bottom-right',
        mobile: 'top-right',
      },
      buttons: [{ text: 'Продолжай', step: 'channels' }],
    },
    channels: {
      text: 'Это список всех пользователей, находящихся в настоящий момент на портале. <a>Чтобы написать личное сообщение пользователю, то нужно нажать на его имя в этом блоке.</a>',
      active: '.menu-item.chat .chat-header',
      buttons: [{ text: 'Дальше', step: 'exit' }],
    },
    exit: {
      text: 'Это список всех доступных чатов (в том числе ранее открытых личных чатов).',
      active: '.menu-item.chat .chat-channels',
      buttons: [{ text: 'Спасибо', action: 'exit' }],
    },
  },
});
