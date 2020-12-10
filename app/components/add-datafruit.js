import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class AddDatafruit extends Component {
  @service
  store;

  @tracked
  showingDatafruits = true;

  get isSubmittable() {
    let datafruit = this.datafruit;
    return !(!isEmpty(datafruit.content) && !datafruit.isSaving);
  }

  @action
  addDatafruit() {
    this.showingDatafruits = false;
    this.datafruit = this.store.createRecord('microtext');
  }

  @action
  submit() {
    this.datafruit
      .save()
      .then(() => {
        this.showingDatafruits = true;
      })
      .catch(() => {
        console.log("couldn't save datafruit");
      });
  }
}
