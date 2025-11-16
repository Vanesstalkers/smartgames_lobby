(class PortalSession extends lib.lobby.Session() {
  getUserClass() {
    return domain.user.Class;
  }
});
