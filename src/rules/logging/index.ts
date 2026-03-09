import { loadRulesFromJson } from '../data/loader.js';

export class LoggingRules {
  static getRules() {
    return loadRulesFromJson('logging');
  }
}
