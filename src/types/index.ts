// ============================================================
// CRM CENTRAL - Core Type Definitions
// ============================================================

export type ID = string;

// ─── Users ───────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'rep' | 'viewer';

export interface User {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  teamId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// ─── Address ─────────────────────────────────────────────
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// ─── Contacts ────────────────────────────────────────────
export type LifecycleStage =
  | 'subscriber' | 'lead' | 'marketing_qualified'
  | 'sales_qualified' | 'opportunity' | 'customer' | 'evangelist';

export type ContactStatus = 'active' | 'inactive' | 'unsubscribed' | 'bounced';
export type LeadSource = 'organic_search' | 'paid_ads' | 'referral' | 'social_media' | 'email' | 'event' | 'direct' | 'other';

export interface Contact {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  companyId?: ID;
  companyName?: string;
  lifecycleStage: LifecycleStage;
  status: ContactStatus;
  ownerId: ID;
  tags: string[];
  source: LeadSource;
  avatarUrl?: string;
  linkedIn?: string;
  twitter?: string;
  website?: string;
  address?: Address;
  leadScore: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

// ─── Companies ───────────────────────────────────────────
export type CompanyType = 'prospect' | 'customer' | 'partner' | 'competitor' | 'vendor';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+';

export interface Company {
  id: ID;
  name: string;
  domain?: string;
  industry?: string;
  type: CompanyType;
  size?: CompanySize;
  employeeCount?: number;
  annualRevenue?: number;
  phone?: string;
  website?: string;
  linkedIn?: string;
  address?: Address;
  ownerId: ID;
  tags: string[];
  description?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

// ─── Pipelines ───────────────────────────────────────────
export type PipelineType = 'deals' | 'tickets';

export interface PipelineStage {
  id: ID;
  name: string;
  probability: number;
  order: number;
  color: string;
  pipelineId: ID;
}

export interface Pipeline {
  id: ID;
  name: string;
  type: PipelineType;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: string;
}

// ─── Deals ───────────────────────────────────────────────
export type DealStatus = 'open' | 'won' | 'lost';
export type DealPriority = 'low' | 'medium' | 'high';

export interface Deal {
  id: ID;
  name: string;
  value: number;
  currency: string;
  status: DealStatus;
  priority: DealPriority;
  pipelineId: ID;
  stageId: ID;
  ownerId: ID;
  contactIds: ID[];
  companyId?: ID;
  closeDate?: string;
  probability: number;
  source?: LeadSource;
  tags: string[];
  description?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

// ─── Tickets ─────────────────────────────────────────────
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketSource = 'email' | 'chat' | 'phone' | 'form' | 'social';

export interface Ticket {
  id: ID;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  pipelineId: ID;
  stageId: ID;
  ownerId: ID;
  contactId?: ID;
  companyId?: ID;
  tags: string[];
  source: TicketSource;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  dueDate?: string;
}

// ─── Tasks ───────────────────────────────────────────────
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'deferred';
export type TaskType = 'call' | 'email' | 'meeting' | 'follow_up' | 'other';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: ID;
  title: string;
  notes?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  dueTime?: string;
  ownerId: ID;
  associatedContactIds: ID[];
  associatedDealIds: ID[];
  associatedCompanyIds: ID[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Activities ──────────────────────────────────────────
export type ActivityType =
  | 'note' | 'email_sent' | 'email_received' | 'call' | 'meeting'
  | 'task_completed' | 'deal_created' | 'deal_won' | 'deal_lost'
  | 'deal_stage_changed' | 'contact_created' | 'company_created'
  | 'ticket_created' | 'ticket_resolved' | 'email_opened' | 'email_clicked';

export interface Activity {
  id: ID;
  type: ActivityType;
  title: string;
  body?: string;
  ownerId: ID;
  associatedContactId?: ID;
  associatedDealId?: ID;
  associatedCompanyId?: ID;
  associatedTicketId?: ID;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Email Marketing ─────────────────────────────────────
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';

export interface EmailTemplate {
  id: ID;
  name: string;
  subject: string;
  previewText?: string;
  htmlContent: string;
  category: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: ID;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId?: ID;
  htmlContent: string;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Sequences ───────────────────────────────────────────
export type SequenceStepType = 'email' | 'delay' | 'task' | 'condition';
export type SequenceStatus = 'active' | 'paused' | 'draft';

export interface SequenceStep {
  id: ID;
  sequenceId: ID;
  order: number;
  type: SequenceStepType;
  delayDays?: number;
  delayHours?: number;
  subject?: string;
  body?: string;
  taskTitle?: string;
  taskType?: TaskType;
  condition?: string;
}

export interface Sequence {
  id: ID;
  name: string;
  description?: string;
  status: SequenceStatus;
  steps: SequenceStep[];
  enrolledCount: number;
  completedCount: number;
  openRate?: number;
  replyRate?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Products ────────────────────────────────────────────
export type BillingFrequency = 'one_time' | 'monthly' | 'quarterly' | 'annually';

export interface Product {
  id: ID;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  currency: string;
  billingFrequency: BillingFrequency;
  unit?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Quotes ──────────────────────────────────────────────
export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';

export interface QuoteLineItem {
  id: ID;
  productId?: ID;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quote {
  id: ID;
  quoteNumber: string;
  dealId?: ID;
  contactId?: ID;
  companyId?: ID;
  status: QuoteStatus;
  validUntil: string;
  currency: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  ownerId: ID;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  signedAt?: string;
}

// ─── Inbox / Conversations ───────────────────────────────
export type ConversationChannel = 'email' | 'chat' | 'sms' | 'whatsapp';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'spam';

export interface Message {
  id: ID;
  conversationId: ID;
  fromName: string;
  fromEmail?: string;
  body: string;
  isInbound: boolean;
  channel: ConversationChannel;
  createdAt: string;
  readAt?: string;
}

export interface Conversation {
  id: ID;
  channel: ConversationChannel;
  status: ConversationStatus;
  subject?: string;
  contactId?: ID;
  contactName: string;
  contactEmail?: string;
  assignedToId?: ID;
  messages: Message[];
  lastMessageAt: string;
  unreadCount: number;
  tags: string[];
  createdAt: string;
}

// ─── Reports ─────────────────────────────────────────────
export interface ReportWidget {
  id: ID;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'stat' | 'table';
  dataKey: string;
  colSpan: 1 | 2 | 3;
}

// ─── UI State ────────────────────────────────────────────
export interface Toast {
  id: ID;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

// Utility types
export type SortDirection = 'asc' | 'desc';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
