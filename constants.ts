

import type { Medicine, Supplier, PurchaseOrder } from './types';

// These date helper functions are kept for potential future use, e.g., in modals for setting default dates.
const today = new Date();
const futureDate = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const pastDate = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
