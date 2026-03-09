import { loadRulesFromJson } from '../data/loader.js';

export class FormRules {
  static getRules() {
    return loadRulesFromJson('forms');
  }
}
