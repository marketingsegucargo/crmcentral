import { create } from 'zustand'
import { generateId } from '../utils'
import {
  USERS, CONTACTS, COMPANIES, PIPELINES, DEALS, TICKETS,
  TASKS, ACTIVITIES, EMAIL_CAMPAIGNS, EMAIL_TEMPLATES,
  SEQUENCES, PRODUCTS, QUOTES, CONVERSATIONS,
} from '../data'
import type {
  User, Contact, Company, Pipeline, Deal, Ticket,
  Task, Activity, EmailCampaign, EmailTemplate,
  Sequence, Product, Quote, Conversation, Message, Toast,
} from '../types'

// ─── UI Store ────────────────────────────────────────────
interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  toasts: Toast[]
  toggleSidebar: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  addToast: (toast) => {
    const id = generateId()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// ─── User Store ───────────────────────────────────────────
interface UserState {
  currentUser: User
  users: User[]
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: USERS[0],
  users: USERS,
  addUser: (user) => set((s) => ({
    users: [...s.users, { ...user, id: generateId(), createdAt: new Date().toISOString() }],
  })),
  updateUser: (id, updates) => set((s) => ({
    users: s.users.map((u) => u.id === id ? { ...u, ...updates } : u),
  })),
  deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
}))

// ─── Contact Store ────────────────────────────────────────
interface ContactState {
  contacts: Contact[]
  searchQuery: string
  filterStage: string
  filterOwner: string
  sortField: keyof Contact
  sortDir: 'asc' | 'desc'
  isFormOpen: boolean
  editingContact: Contact | null
  setSearch: (q: string) => void
  setFilterStage: (s: string) => void
  setFilterOwner: (o: string) => void
  setSort: (field: keyof Contact) => void
  openForm: (contact?: Contact) => void
  closeForm: () => void
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  getFiltered: () => Contact[]
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: CONTACTS,
  searchQuery: '',
  filterStage: '',
  filterOwner: '',
  sortField: 'createdAt',
  sortDir: 'desc',
  isFormOpen: false,
  editingContact: null,
  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterStage: (filterStage) => set({ filterStage }),
  setFilterOwner: (filterOwner) => set({ filterOwner }),
  setSort: (field) => set((s) => ({
    sortField: field,
    sortDir: s.sortField === field && s.sortDir === 'asc' ? 'desc' : 'asc',
  })),
  openForm: (contact) => set({ isFormOpen: true, editingContact: contact ?? null }),
  closeForm: () => set({ isFormOpen: false, editingContact: null }),
  addContact: (data) => set((s) => ({
    contacts: [{ ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.contacts],
  })),
  updateContact: (id, updates) => set((s) => ({
    contacts: s.contacts.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c),
  })),
  deleteContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
  getFiltered: () => {
    const { contacts, searchQuery, filterStage, filterOwner, sortField, sortDir } = get()
    let list = contacts
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.companyName?.toLowerCase().includes(q) ||
        c.jobTitle?.toLowerCase().includes(q)
      )
    }
    if (filterStage) list = list.filter((c) => c.lifecycleStage === filterStage)
    if (filterOwner) list = list.filter((c) => c.ownerId === filterOwner)
    list = [...list].sort((a, b) => {
      const va = String(a[sortField] ?? '')
      const vb = String(b[sortField] ?? '')
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return list
  },
}))

// ─── Company Store ────────────────────────────────────────
interface CompanyState {
  companies: Company[]
  searchQuery: string
  filterType: string
  isFormOpen: boolean
  editingCompany: Company | null
  setSearch: (q: string) => void
  setFilterType: (t: string) => void
  openForm: (company?: Company) => void
  closeForm: () => void
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  deleteCompany: (id: string) => void
  getFiltered: () => Company[]
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: COMPANIES,
  searchQuery: '',
  filterType: '',
  isFormOpen: false,
  editingCompany: null,
  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterType: (filterType) => set({ filterType }),
  openForm: (company) => set({ isFormOpen: true, editingCompany: company ?? null }),
  closeForm: () => set({ isFormOpen: false, editingCompany: null }),
  addCompany: (data) => set((s) => ({
    companies: [{ ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.companies],
  })),
  updateCompany: (id, updates) => set((s) => ({
    companies: s.companies.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c),
  })),
  deleteCompany: (id) => set((s) => ({ companies: s.companies.filter((c) => c.id !== id) })),
  getFiltered: () => {
    const { companies, searchQuery, filterType } = get()
    let list = companies
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.domain?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q)
      )
    }
    if (filterType) list = list.filter((c) => c.type === filterType)
    return list
  },
}))

// ─── Pipeline Store ───────────────────────────────────────
interface PipelineState {
  pipelines: Pipeline[]
  addPipeline: (p: Omit<Pipeline, 'id' | 'createdAt'>) => void
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void
  deletePipeline: (id: string) => void
}

export const usePipelineStore = create<PipelineState>((set) => ({
  pipelines: PIPELINES,
  addPipeline: (p) => set((s) => ({
    pipelines: [...s.pipelines, { ...p, id: generateId(), createdAt: new Date().toISOString() }],
  })),
  updatePipeline: (id, updates) => set((s) => ({
    pipelines: s.pipelines.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  deletePipeline: (id) => set((s) => ({ pipelines: s.pipelines.filter((p) => p.id !== id) })),
}))

// ─── Deal Store ───────────────────────────────────────────
interface DealState {
  deals: Deal[]
  activePipelineId: string
  viewMode: 'kanban' | 'list'
  searchQuery: string
  filterOwner: string
  isFormOpen: boolean
  editingDeal: Deal | null
  setActivePipeline: (id: string) => void
  setViewMode: (mode: 'kanban' | 'list') => void
  setSearch: (q: string) => void
  setFilterOwner: (o: string) => void
  openForm: (deal?: Deal) => void
  closeForm: () => void
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDeal: (id: string, updates: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  moveDeal: (dealId: string, newStageId: string) => void
  getFiltered: () => Deal[]
  getDealsByStage: (pipelineId: string) => Record<string, Deal[]>
}

export const useDealStore = create<DealState>((set, get) => ({
  deals: DEALS,
  activePipelineId: 'p1',
  viewMode: 'kanban',
  searchQuery: '',
  filterOwner: '',
  isFormOpen: false,
  editingDeal: null,
  setActivePipeline: (activePipelineId) => set({ activePipelineId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterOwner: (filterOwner) => set({ filterOwner }),
  openForm: (deal) => set({ isFormOpen: true, editingDeal: deal ?? null }),
  closeForm: () => set({ isFormOpen: false, editingDeal: null }),
  addDeal: (data) => set((s) => ({
    deals: [{ ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.deals],
  })),
  updateDeal: (id, updates) => set((s) => ({
    deals: s.deals.map((d) => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d),
  })),
  deleteDeal: (id) => set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),
  moveDeal: (dealId, newStageId) => set((s) => ({
    deals: s.deals.map((d) => d.id === dealId ? { ...d, stageId: newStageId, updatedAt: new Date().toISOString() } : d),
  })),
  getFiltered: () => {
    const { deals, activePipelineId, searchQuery, filterOwner } = get()
    let list = deals.filter((d) => d.pipelineId === activePipelineId)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q))
    }
    if (filterOwner) list = list.filter((d) => d.ownerId === filterOwner)
    return list
  },
  getDealsByStage: (pipelineId) => {
    const { deals } = get()
    const byStage: Record<string, Deal[]> = {}
    deals.filter((d) => d.pipelineId === pipelineId && d.status === 'open').forEach((d) => {
      if (!byStage[d.stageId]) byStage[d.stageId] = []
      byStage[d.stageId].push(d)
    })
    return byStage
  },
}))

// ─── Ticket Store ─────────────────────────────────────────
interface TicketState {
  tickets: Ticket[]
  viewMode: 'kanban' | 'list'
  searchQuery: string
  filterPriority: string
  filterStatus: string
  isFormOpen: boolean
  editingTicket: Ticket | null
  setViewMode: (mode: 'kanban' | 'list') => void
  setSearch: (q: string) => void
  setFilterPriority: (p: string) => void
  setFilterStatus: (s: string) => void
  openForm: (ticket?: Ticket) => void
  closeForm: () => void
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTicket: (id: string, updates: Partial<Ticket>) => void
  deleteTicket: (id: string) => void
  moveTicket: (ticketId: string, newStageId: string) => void
  getFiltered: () => Ticket[]
  getByStage: () => Record<string, Ticket[]>
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: TICKETS,
  viewMode: 'list',
  searchQuery: '',
  filterPriority: '',
  filterStatus: '',
  isFormOpen: false,
  editingTicket: null,
  setViewMode: (viewMode) => set({ viewMode }),
  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  openForm: (ticket) => set({ isFormOpen: true, editingTicket: ticket ?? null }),
  closeForm: () => set({ isFormOpen: false, editingTicket: null }),
  addTicket: (data) => set((s) => ({
    tickets: [{ ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.tickets],
  })),
  updateTicket: (id, updates) => set((s) => ({
    tickets: s.tickets.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
  })),
  deleteTicket: (id) => set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })),
  moveTicket: (ticketId, newStageId) => set((s) => ({
    tickets: s.tickets.map((t) => t.id === ticketId ? { ...t, stageId: newStageId, updatedAt: new Date().toISOString() } : t),
  })),
  getFiltered: () => {
    const { tickets, searchQuery, filterPriority, filterStatus } = get()
    let list = tickets
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((t) => t.subject.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    if (filterPriority) list = list.filter((t) => t.priority === filterPriority)
    if (filterStatus) list = list.filter((t) => t.status === filterStatus)
    return list
  },
  getByStage: () => {
    const { tickets } = get()
    const byStage: Record<string, Ticket[]> = {}
    tickets.forEach((t) => {
      if (!byStage[t.stageId]) byStage[t.stageId] = []
      byStage[t.stageId].push(t)
    })
    return byStage
  },
}))

// ─── Task Store ───────────────────────────────────────────
interface TaskState {
  tasks: Task[]
  filterStatus: string
  filterType: string
  isFormOpen: boolean
  editingTask: Task | null
  setFilterStatus: (s: string) => void
  setFilterType: (t: string) => void
  openForm: (task?: Task) => void
  closeForm: () => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  getFiltered: () => Task[]
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: TASKS,
  filterStatus: '',
  filterType: '',
  isFormOpen: false,
  editingTask: null,
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterType: (filterType) => set({ filterType }),
  openForm: (task) => set({ isFormOpen: true, editingTask: task ?? null }),
  closeForm: () => set({ isFormOpen: false, editingTask: null }),
  addTask: (data) => set((s) => ({
    tasks: [{ ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.tasks],
  })),
  updateTask: (id, updates) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
  })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  completeTask: (id) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : t),
  })),
  getFiltered: () => {
    const { tasks, filterStatus, filterType } = get()
    let list = tasks
    if (filterStatus) list = list.filter((t) => t.status === filterStatus)
    if (filterType) list = list.filter((t) => t.type === filterType)
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  },
}))

// ─── Activity Store ───────────────────────────────────────
interface ActivityState {
  activities: Activity[]
  filterType: string
  setFilterType: (t: string) => void
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void
  getFiltered: () => Activity[]
  getForContact: (contactId: string) => Activity[]
  getForDeal: (dealId: string) => Activity[]
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: ACTIVITIES,
  filterType: '',
  setFilterType: (filterType) => set({ filterType }),
  addActivity: (data) => set((s) => ({
    activities: [{ ...data, id: generateId(), createdAt: new Date().toISOString() }, ...s.activities],
  })),
  getFiltered: () => {
    const { activities, filterType } = get()
    let list = activities
    if (filterType) list = list.filter((a) => a.type === filterType)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },
  getForContact: (contactId) => get().activities
    .filter((a) => a.associatedContactId === contactId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getForDeal: (dealId) => get().activities
    .filter((a) => a.associatedDealId === dealId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
}))

// ─── Email Store ──────────────────────────────────────────
interface EmailState {
  campaigns: EmailCampaign[]
  templates: EmailTemplate[]
  filterStatus: string
  isFormOpen: boolean
  setFilterStatus: (s: string) => void
  openForm: () => void
  closeForm: () => void
  addCampaign: (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCampaign: (id: string, updates: Partial<EmailCampaign>) => void
  deleteCampaign: (id: string) => void
  getFiltered: () => EmailCampaign[]
}

export const useEmailStore = create<EmailState>((set, get) => ({
  campaigns: EMAIL_CAMPAIGNS,
  templates: EMAIL_TEMPLATES,
  filterStatus: '',
  isFormOpen: false,
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  openForm: () => set({ isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false }),
  addCampaign: (data) => set((s) => ({
    campaigns: [{ ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...s.campaigns],
  })),
  updateCampaign: (id, updates) => set((s) => ({
    campaigns: s.campaigns.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),
  deleteCampaign: (id) => set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
  getFiltered: () => {
    const { campaigns, filterStatus } = get()
    if (!filterStatus) return campaigns
    return campaigns.filter((c) => c.status === filterStatus)
  },
}))

// ─── Sequence Store ───────────────────────────────────────
interface SequenceState {
  sequences: Sequence[]
  isFormOpen: boolean
  addSequence: (s: Omit<Sequence, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSequence: (id: string, updates: Partial<Sequence>) => void
  deleteSequence: (id: string) => void
  openForm: () => void
  closeForm: () => void
}

export const useSequenceStore = create<SequenceState>((set) => ({
  sequences: SEQUENCES,
  isFormOpen: false,
  openForm: () => set({ isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false }),
  addSequence: (data) => set((s) => ({
    sequences: [...s.sequences, { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })),
  updateSequence: (id, updates) => set((s) => ({
    sequences: s.sequences.map((seq) => seq.id === id ? { ...seq, ...updates } : seq),
  })),
  deleteSequence: (id) => set((s) => ({ sequences: s.sequences.filter((seq) => seq.id !== id) })),
}))

// ─── Product Store ────────────────────────────────────────
interface ProductState {
  products: Product[]
  searchQuery: string
  isFormOpen: boolean
  editingProduct: Product | null
  setSearch: (q: string) => void
  openForm: (product?: Product) => void
  closeForm: () => void
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getFiltered: () => Product[]
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: PRODUCTS,
  searchQuery: '',
  isFormOpen: false,
  editingProduct: null,
  setSearch: (searchQuery) => set({ searchQuery }),
  openForm: (product) => set({ isFormOpen: true, editingProduct: product ?? null }),
  closeForm: () => set({ isFormOpen: false, editingProduct: null }),
  addProduct: (data) => set((s) => ({
    products: [...s.products, { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })),
  updateProduct: (id, updates) => set((s) => ({
    products: s.products.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  getFiltered: () => {
    const { products, searchQuery } = get()
    if (!searchQuery) return products
    const q = searchQuery.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
  },
}))

// ─── Quote Store ──────────────────────────────────────────
interface QuoteState {
  quotes: Quote[]
  filterStatus: string
  isFormOpen: boolean
  setFilterStatus: (s: string) => void
  openForm: () => void
  closeForm: () => void
  addQuote: (q: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateQuote: (id: string, updates: Partial<Quote>) => void
  deleteQuote: (id: string) => void
  getFiltered: () => Quote[]
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: QUOTES,
  filterStatus: '',
  isFormOpen: false,
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  openForm: () => set({ isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false }),
  addQuote: (data) => set((s) => ({
    quotes: [...s.quotes, { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })),
  updateQuote: (id, updates) => set((s) => ({
    quotes: s.quotes.map((q) => q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q),
  })),
  deleteQuote: (id) => set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) })),
  getFiltered: () => {
    const { quotes, filterStatus } = get()
    if (!filterStatus) return quotes
    return quotes.filter((q) => q.status === filterStatus)
  },
}))

// ─── Inbox Store ──────────────────────────────────────────
interface InboxState {
  conversations: Conversation[]
  activeConversationId: string | null
  filterStatus: string
  filterChannel: string
  setActiveConversation: (id: string | null) => void
  setFilterStatus: (s: string) => void
  setFilterChannel: (c: string) => void
  sendMessage: (conversationId: string, body: string, fromName: string) => void
  resolveConversation: (id: string) => void
  getFiltered: () => Conversation[]
}

export const useInboxStore = create<InboxState>((set, get) => ({
  conversations: CONVERSATIONS,
  activeConversationId: null,
  filterStatus: '',
  filterChannel: '',
  setActiveConversation: (id) => {
    set((s) => ({
      activeConversationId: id,
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ),
    }))
  },
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterChannel: (filterChannel) => set({ filterChannel }),
  sendMessage: (conversationId, body, fromName) => {
    const message: Message = {
      id: generateId(),
      conversationId,
      fromName,
      body,
      isInbound: false,
      channel: 'email',
      createdAt: new Date().toISOString(),
      readAt: new Date().toISOString(),
    }
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], lastMessageAt: message.createdAt }
          : c
      ),
    }))
  },
  resolveConversation: (id) => set((s) => ({
    conversations: s.conversations.map((c) =>
      c.id === id ? { ...c, status: 'resolved' as const } : c
    ),
  })),
  getFiltered: () => {
    const { conversations, filterStatus, filterChannel } = get()
    let list = conversations
    if (filterStatus) list = list.filter((c) => c.status === filterStatus)
    if (filterChannel) list = list.filter((c) => c.channel === filterChannel)
    return list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
  },
}))
