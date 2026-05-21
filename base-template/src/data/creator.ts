import { CreatorStats, WalletState } from '../types';

export const INITIAL_CREATOR_STATS: CreatorStats = {
  views: 142800,
  upvotes: 12450,
  shares: 3420,
  copies: 8900,
  viewsHistory: [
    { date: 'May 10', views: 8500 },
    { date: 'May 11', views: 9200 },
    { date: 'May 12', views: 11200 },
    { date: 'May 13', views: 14800 },
    { date: 'May 14', views: 13500 },
    { date: 'May 15', views: 15600 },
    { date: 'May 16', views: 18900 },
    { date: 'May 17', views: 24200 },
    { date: 'May 18', views: 27100 }
  ],
  conversionHistory: [
    { date: 'May 10', rate: 4.8 },
    { date: 'May 11', rate: 5.1 },
    { date: 'May 12', rate: 5.5 },
    { date: 'May 13', rate: 6.2 },
    { date: 'May 14', rate: 5.9 },
    { date: 'May 15', rate: 6.4 },
    { date: 'May 16', rate: 6.8 },
    { date: 'May 17', rate: 7.2 },
    { date: 'May 18', rate: 7.5 }
  ]
};

export const INITIAL_WALLET: WalletState = {
  totalEarnings: 3450.75,
  currentBalance: 820.50,
  pendingBalance: 240.25,
  nextPayoutDate: 'May 28, 2026',
  transactions: [
    { id: 'T_001', date: 'May 16, 2026', description: 'Monthly Creator Fund Pool Allocation', amount: 450.00, status: 'Completed' },
    { id: 'T_002', date: 'May 10, 2026', description: 'Ad Revenue Share (May 1 - May 9)', amount: 180.25, status: 'Completed' },
    { id: 'T_003', date: 'May 01, 2026', description: 'Guide Sponshors Reward Payout', amount: 150.00, status: 'Completed' },
    { id: 'T_004', date: 'May 18, 2026', description: 'Ad Revenue Share (May 10 - May 17)', amount: 240.25, status: 'Pending' }
  ],
  monthlyRevenueHistory: [
    { month: 'Jan', amount: 350 },
    { month: 'Feb', amount: 580 },
    { month: 'Mar', amount: 820 },
    { month: 'Apr', amount: 1100 },
    { month: 'May', amount: 1450 }
  ]
};
