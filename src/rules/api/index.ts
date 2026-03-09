import { loadRulesFromJson } from '../data/loader.js';

export class ApiRules {
  static getRules() {
    return loadRulesFromJson('api');
  }
}
