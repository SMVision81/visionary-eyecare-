import type { EnquiryStatus, ReviewStatus } from './types';

// Owner-facing names for statuses (used in tabs, badges and buttons).
export const reviewStatusLabel: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  live: 'Live on website',
  hidden: 'Hidden',
  removed: 'Removed',
};

export const enquiryStatusLabel: Record<EnquiryStatus, string> = {
  new: 'New',
  awaiting_reply: 'Not yet replied',
  replied: 'Replied',
  archived: 'Archived',
};

export const reviewTabs: ReviewStatus[] = ['pending', 'approved', 'live', 'hidden', 'removed'];
export const enquiryTabs: EnquiryStatus[] = ['new', 'awaiting_reply', 'replied', 'archived'];
