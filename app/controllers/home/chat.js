import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class ChatController extends Controller {
  @service
  fastboot;

  @service
  chat;

  @service
  session;

  @service
  currentUser;

  @computed('fastboot.isFastBoot')
  get isNotFastboot() {
    return !this.fastboot.isFastBoot;
  }

  @action
  authenticate(nick, pass) {
    this.set('session.store.cookieExpirationTime', 60 * 60 * 24 * 14);
    return this.session
      .authenticate('authenticator:devise', nick, pass)
      .then(() => {
        const token = this.session.data.authenticated.token;
        this.currentUser.load().then(() => {
          const avatarUrl = this.currentUser.user.avatarUrl;
          const role = this.currentUser.user.role;
          const style = this.currentUser.user.style;
          const pronouns = this.currentUser.user.pronouns;
          this.chat.push('authorize_token', {
            user: nick,
            timestamp: Date.now(),
            token,
            avatarUrl,
            role,
            style,
            pronouns,
          });
          return true;
        });
      })
      .catch((/*reason*/) => {
        alert('Wrong password');
        return false;
      });
  }
}
