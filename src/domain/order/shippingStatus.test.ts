import { describe, it, expect } from 'bun:test';
import {
  ShippingStatus,
  isPending,
  isShipped,
  isDelivered,
  canTransitionTo,
  transitionTo,
} from './shippingStatus';
import { isOk, isErr } from '@shared/functional/result';

describe('ShippingStatus', () => {
  describe('型ガード', () => {
    it('PENDING状態を正しく識別できる', () => {
      const status: ShippingStatus = 'PENDING';
      expect(isPending(status)).toBe(true);
      expect(isShipped(status)).toBe(false);
      expect(isDelivered(status)).toBe(false);
    });

    it('SHIPPED状態を正しく識別できる', () => {
      const status: ShippingStatus = 'SHIPPED';
      expect(isPending(status)).toBe(false);
      expect(isShipped(status)).toBe(true);
      expect(isDelivered(status)).toBe(false);
    });

    it('DELIVERED状態を正しく識別できる', () => {
      const status: ShippingStatus = 'DELIVERED';
      expect(isPending(status)).toBe(false);
      expect(isShipped(status)).toBe(false);
      expect(isDelivered(status)).toBe(true);
    });
  });

  describe('状態遷移', () => {
    it('PENDINGからSHIPPEDへの遷移を許可する', () => {
      expect(canTransitionTo('PENDING', 'SHIPPED')).toBe(true);
    });

    it('PENDINGからDELIVEREDへの遷移を許可する', () => {
      expect(canTransitionTo('PENDING', 'DELIVERED')).toBe(true);
    });

    it('SHIPPEDからDELIVEREDへの遷移を許可する', () => {
      expect(canTransitionTo('SHIPPED', 'DELIVERED')).toBe(true);
    });

    it('SHIPPEDからPENDINGへの遷移を許可しない', () => {
      expect(canTransitionTo('SHIPPED', 'PENDING')).toBe(false);
    });

    it('DELIVEREDからPENDINGへの遷移を許可しない', () => {
      expect(canTransitionTo('DELIVERED', 'PENDING')).toBe(false);
    });

    it('DELIVEREDからSHIPPEDへの遷移を許可しない', () => {
      expect(canTransitionTo('DELIVERED', 'SHIPPED')).toBe(false);
    });

    it('同じ状態への遷移を許可する', () => {
      expect(canTransitionTo('PENDING', 'PENDING')).toBe(true);
      expect(canTransitionTo('SHIPPED', 'SHIPPED')).toBe(true);
      expect(canTransitionTo('DELIVERED', 'DELIVERED')).toBe(true);
    });
  });

  describe('transitionTo', () => {
    it('PENDINGからSHIPPEDへの遷移に成功する', () => {
      const result = transitionTo('PENDING', 'SHIPPED');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('SHIPPED');
      }
    });

    it('SHIPPEDからDELIVEREDへの遷移に成功する', () => {
      const result = transitionTo('SHIPPED', 'DELIVERED');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('DELIVERED');
      }
    });

    it('SHIPPEDからPENDINGへの遷移に失敗する', () => {
      const result = transitionTo('SHIPPED', 'PENDING');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_TRANSITION');
        expect(result.error.message).toContain('SHIPPED');
        expect(result.error.message).toContain('PENDING');
      }
    });

    it('DELIVEREDから他の状態への遷移に失敗する', () => {
      const resultToPending = transitionTo('DELIVERED', 'PENDING');
      expect(isErr(resultToPending)).toBe(true);

      const resultToShipped = transitionTo('DELIVERED', 'SHIPPED');
      expect(isErr(resultToShipped)).toBe(true);
    });

    it('同じ状態への遷移を許可する', () => {
      const result = transitionTo('PENDING', 'PENDING');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('PENDING');
      }
    });
  });
});
