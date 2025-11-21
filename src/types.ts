// src/types.ts
export type SubscriptionCycle = 'weekly' | 'monthly' | 'yearly';

export type SubscriptionCategory = 
  | 'Entertainment' 
  | 'Work' 
  | 'Health' 
  | 'Utility' 
  | 'Other';

  export type Currency = 'USD' | 'EUR' | 'MKD' | 'GBP';

export interface Subscription {
  id: string;
  serviceName: string;
  cost: number;
  currency: Currency;
  cycle: SubscriptionCycle;
  nextBillDate: string; // ISO string 'YYYY-MM-DD'
  category: SubscriptionCategory;
  managementUrl: string;
  reminderDays: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string; // ISO string
  read: boolean;
}

// This will be the type for our "Add New" form
export type SubscriptionFormData = Omit<Subscription, 'id'>;