import { IMockForgeState } from './types';
import stableStringify from 'json-stable-stringify';

export function isChange(state: IMockForgeState) {
  const cache = state.__cache__;
  if (!cache) {
    return true;
  }
  const { __cache__, ...rest } = state;
  return stableStringify(rest) === __cache__;
}

export function removeCacheFromState(state: IMockForgeState) {
  const { __cache__, ...rest } = state;
  return rest;
}
