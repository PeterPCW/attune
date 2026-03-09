import { loadRulesFromJson } from '../data/loader.js';

export class StateRules {
  static getRules() {
    return loadRulesFromJson('state');
  }
}
