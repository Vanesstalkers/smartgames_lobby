({
  steps: {
    teambuilding: {
      superPos: true,
      bigControls: true,
      text: 'Проведение корпоративных мероприятий в формате настольных игр для любого количества участников.',
      actions: {
        before: async (data) => {
          const { $root } = data; // в аргументах функции строго data, чтобы фронт корректно восстановил функцию из строки

          const $item = $root.querySelector('.menu-item.info.pinned');
          if (!$item) $root.querySelector('.menu-item.info > label')?.click();
        }
      },
      buttons: [
        { text: 'Расскажи про бизнес-игры <a>для ИТ</a>', link: 'https://release.smartgames.studio/#/rules' },
        { text: 'Проведи <a>демонстрацию</a> игр <a>для ИТ</a>', action: 'changeTutorial', tutorial: 'lobby-tutorial-menuGameReleaseCorporate', step: 'initFromSales' },
        { text: 'Расскажи про бизнес-игры <a>для автодилеров</a>', link: 'https://auto.smartgames.studio/#/rules' },
        { text: 'Назад', action: 'exit' },
      ],
    },
    delivery: {
      superPos: true,
      text: `
        Все представленные на портале игры имеют настольный формат. Мы <a>можем доставить их в офис в любом городе РФ</a>.
      `,
      buttons: [
        { text: 'Посмотреть контакты', step: 'contacts' },
        { text: 'Спасибо', action: 'exit' },
      ],
    },
    games: {
      superPos: true,
      text: `
        Мы готовы <a>придумать и разработать игру обучающую бизнес-процессам компании</a>. Либо можно дополнить и адаптировать одну из уже имеющихся в наличии игр.
      `,
      buttons: [
        { text: 'Посмотреть контакты', step: 'contacts' },
        { text: 'Спасибо', action: 'exit' },
      ],
    },
    it: {
      superPos: true,
      text: `
        Разработка электронной варианта игры (<a>включая мобильную версию</a>), предполагает как <a>передачу исходного кода заказчику</a>, так и <a>возможность долгосрочной поддержки</a>.
      `,
      buttons: [
        { text: 'Посмотреть контакты', step: 'contacts' },
        { text: 'Спасибо', action: 'exit' },
      ],
    },
    contacts: {
      superPos: true,
      html: () => `
        По любым вопросам можно связаться с руководителем студии.
         
        Электронная почта: <a href="mailto:ivan@smartgames.studio">ivan@smartgames.studio</a>
        Контактный телефон: <a href="tel:+79266323666" target="_blank">8-926-632-3666</a>
        (доступен во всех популярных мессенджерах)

        <div class="contact-icons-wrapper">
          <a href="https://t.me/smartgamesstudio" target="_black" class="telegram-link"> </a>
          <a href="https://vk.com/smartgames.studio" target="_black" class="vk-link"> </a>
        </div>
      `,
      buttons: [
        { text: 'Написать сейчас', link: 'mailto:ivan@smartgames.studio' },
        { text: 'Позвонить сейчас', link: 'tel:89266323666' },
        { text: 'Спасибо', action: 'exit' },
      ],
    },
  },
});
