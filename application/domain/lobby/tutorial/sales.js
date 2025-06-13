({
  steps: {
    teambuilding: {
      superPos: true,
      text: 'Проведение корпоративных мероприятий в формате настольных игр для любого количества участников.',
      buttons: [
        { text: 'Для ИТ', step: 'teambuilding_it' },
        { text: 'Для автодилеров', step: 'teambuilding_auto' },
        { text: 'Не интересует', action: 'exit' },
      ],
    },
    teambuilding_it: {
      superPos: true,
      text: 'Авторская разработка "Бизнес-симуляция РЕЛИЗ" .',
      buttons: [
        { text: 'Описание', link: 'https://release.smartgames.studio/#/rules' },
        { text: 'Получить контакты', step: 'contacts' },
        { text: 'Назад', step: 'teambuilding' },
      ],
    },
    teambuilding_auto: {
      superPos: true,
      text: 'Авторская разработка "Бизнес-покер для автодилеров".',
      buttons: [
        { text: 'Описание', link: 'https://auto.smartgames.studio/#/rules' },
        { text: 'Получить контакты', step: 'contacts' },
        { text: 'Назад', step: 'teambuilding' },
      ],
    },
    delivery: {
      superPos: true,
      text: 'Мы можем доставить вам настольные варианты тех игр, которые уже есть на портале. Помимо этого мы готовы брендировать любую из них по вас.',
      buttons: [
        { text: 'Получить контакты', step: 'contacts' },
        { text: 'Не интересует', action: 'exit' },
      ],
    },
    games: {
      superPos: true,
      text: 'Мы готовы придумать и разработать совершенно игру про ваш бизнес, либо адаптировать одну из уже имеющихся в наличии.',
      buttons: [
        { text: 'Получить контакты', step: 'contacts' },
        { text: 'Не интересует', action: 'exit' },
      ],
    },
    it: {
      superPos: true,
      text: 'Если хотите, то мы можем разработать электронную версию игры, в том числе и в формате мобильного приложения.',
      buttons: [
        { text: 'Получить контакты', step: 'contacts' },
        { text: 'Не интересует', action: 'exit' },
      ],
    },
    contacts: {
      superPos: true,
      html: () => `Можете связаться с руководителем студии Иваном Мироновым. 
        Электронная почта: <a href="mailto:ivan@smartgames.studio">ivan@smartgames.studio</a>
        Контактный телефон: <a href="tel:+79266323666" target="_blank">8-926-632-3666</a>
        (доступен во всех популярных мессенджерах)
      `,
      buttons: [
        { text: 'Написать сейчас', link: 'mailto:ivan@smartgames.studio' },
        { text: 'Позвонить сейчас', link: 'tel:89266323666' },
        { text: 'Спасибо', action: 'exit' },
      ],
    },
  },
});
