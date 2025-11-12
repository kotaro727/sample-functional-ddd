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
  describe('Type guards', () => {
    it('should identify PENDING status', () => {
      const status: ShippingStatus = 'PENDING';
      expect(isPending(status)).toBe(true);
      expect(isShipped(status)).toBe(false);
      expect(isDelivered(status)).toBe(false);
    });

    it('should identify SHIPPED status', () => {
      const status: ShippingStatus = 'SHIPPED';
      expect(isPending(status)).toBe(false);
      expect(isShipped(status)).toBe(true);
      expect(isDelivered(status)).toBe(false);
    });

    it('should identify DELIVERED status', () => {
      const status: ShippingStatus = 'DELIVERED';
      expect(isPending(status)).toBe(false);
      expect(isShipped(status)).toBe(false);
      expect(isDelivered(status)).toBe(true);
    });
  });

  describe('State transitions', () => {
    it('should allow transition from PENDING to SHIPPED', () => {
      expect(canTransitionTo('PENDING', 'SHIPPED')).toBe(true);
    });

    it('should allow transition from PENDING to DELIVERED', () => {
      expect(canTransitionTo('PENDING', 'DELIVERED')).toBe(true);
    });

    it('should allow transition from SHIPPED to DELIVERED', () => {
      expect(canTransitionTo('SHIPPED', 'DELIVERED')).toBe(true);
    });

    it('should not allow transition from SHIPPED to PENDING', () => {
      expect(canTransitionTo('SHIPPED', 'PENDING')).toBe(false);
    });

    it('should not allow transition from DELIVERED to PENDING', () => {
      expect(canTransitionTo('DELIVERED', 'PENDING')).toBe(false);
    });

    it('should not allow transition from DELIVERED to SHIPPED', () => {
      expect(canTransitionTo('DELIVERED', 'SHIPPED')).toBe(false);
    });

    it('should allow staying in the same state', () => {
      expect(canTransitionTo('PENDING', 'PENDING')).toBe(true);
      expect(canTransitionTo('SHIPPED', 'SHIPPED')).toBe(true);
      expect(canTransitionTo('DELIVERED', 'DELIVERED')).toBe(true);
    });
  });

  describe('transitionTo', () => {
    it('should successfully transition from PENDING to SHIPPED', () => {
      const result = transitionTo('PENDING', 'SHIPPED');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('SHIPPED');
      }
    });

    it('should successfully transition from SHIPPED to DELIVERED', () => {
      const result = transitionTo('SHIPPED', 'DELIVERED');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('DELIVERED');
      }
    });

    it('should fail to transition from SHIPPED to PENDING', () => {
      const result = transitionTo('SHIPPED', 'PENDING');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_TRANSITION');
        expect(result.error.message).toContain('SHIPPED');
        expect(result.error.message).toContain('PENDING');
      }
    });

    it('should fail to transition from DELIVERED to any other state', () => {
      const resultToPending = transitionTo('DELIVERED', 'PENDING');
      expect(isErr(resultToPending)).toBe(true);

      const resultToShipped = transitionTo('DELIVERED', 'SHIPPED');
      expect(isErr(resultToShipped)).toBe(true);
    });

    it('should allow staying in the same state', () => {
      const result = transitionTo('PENDING', 'PENDING');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('PENDING');
      }
    });
  });
});
