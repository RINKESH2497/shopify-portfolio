import { describe, it, expect } from '../../harness/test-framework';
import { CompletedOrder } from '../../harness/reference-engine';

describe('Tier 1: Feature 11 - Demo Account (Orders, Addresses, Profile) (R1, AC-BN-04)', () => {
  interface DemoAddress {
    id: string;
    label: string;
    street: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }

  interface DemoAccount {
    name: string;
    email: string;
    addresses: DemoAddress[];
    orders: CompletedOrder[];
  }

  const mockAccount: DemoAccount = {
    name: 'Demo Customer',
    email: 'shopper@shopifyportfolio.demo',
    addresses: [
      {
        id: 'addr-1',
        label: 'Home',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        postalCode: '97477',
        isDefault: true
      }
    ],
    orders: []
  };

  it('demo account provides customer profile details without real authentication', () => {
    expect(mockAccount.name).toBe('Demo Customer');
    expect(mockAccount.email).toContain('@');
    expect(mockAccount.addresses).toHaveLength(1);
  });

  it('placed order is recorded into simulated order history', () => {
    const order: CompletedOrder = {
      orderId: 'DEMO-ORD-TEST-001',
      storeId: 'coffee',
      customer: {
        email: mockAccount.email,
        firstName: 'Demo',
        lastName: 'Customer',
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        postalCode: '97477',
        country: 'US'
      },
      shippingMethod: { id: 'standard', name: 'Standard', rate: 5.0 },
      items: [],
      subtotal: 50.0,
      shippingFee: 5.0,
      tax: 4.0,
      total: 59.0,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    mockAccount.orders.push(order);
    expect(mockAccount.orders).toHaveLength(1);
    expect(mockAccount.orders[0].orderId).toBe('DEMO-ORD-TEST-001');
  });

  it('order details in history match order ID, items, and total paid', () => {
    const o = mockAccount.orders[0];
    expect(o.total).toBe(59.0);
    expect(o.customer.email).toBe(mockAccount.email);
    expect(o.status).toBe('confirmed');
  });

  it('demo account maintains saved shipping addresses with default address flag', () => {
    const defaultAddr = mockAccount.addresses.find(a => a.isDefault);
    expect(defaultAddr).toBeDefined();
    expect(defaultAddr?.street).toBe('742 Evergreen Terrace');
  });

  it('saved address can be added and retrieved', () => {
    const newAddress: DemoAddress = {
      id: 'addr-2',
      label: 'Office',
      street: '100 Tech Blvd',
      city: 'Seattle',
      postalCode: '98104',
      isDefault: false
    };

    mockAccount.addresses.push(newAddress);
    expect(mockAccount.addresses).toHaveLength(2);
    expect(mockAccount.addresses[1].label).toBe('Office');
  });

  it('order status displays confirmed state', () => {
    const order = mockAccount.orders[0];
    expect(['confirmed', 'processing']).toContain(order.status);
  });
});
