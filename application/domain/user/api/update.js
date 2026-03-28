async (context, data) => {
  const { login, password, name, tgUsername, gender, info, avatarCode, lobbyConfigs } = data;
  const { userId } = context.session.state;
  const user = lib.store('user').get(userId);

  const setData = {};
  if (avatarCode !== undefined) {
    setData.avatarUrl = `${lib.lobby.__gameServerConfig.serverUrl}/img/workers/${avatarCode}`;
  }
  user.set(setData);

  return lib.user.api.update(context, data);
};
