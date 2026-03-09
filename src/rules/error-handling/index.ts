import { loadRulesFromJson } from '../data/loader.js';

export class ErrorHandlingRules {
  static getRules() {
    return loadRulesFromJson('error-handling');
  }
}
