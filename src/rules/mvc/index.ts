import { loadRulesFromJson } from '../data/loader.js';

export class MvcRules {
  static getRules() {
    return loadRulesFromJson('mvc');
  }
}
