import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mail, MessageSquare, Smartphone, MessageCircle,
  CheckCircle, Clock, Send, MoreHorizontal,
  User, Tag, Inbox as InboxIcon, ArrowLeft,
  Paperclip, FileText, Filter, Search, X,
  ChevronRight, ExternalLink,
} from 'lucide-react'
import { Button, Badge, Avatar, EmptyState, Dropdown, Select } from '../components/ui'
import {
  useInboxStore, useContactStore, useUserStore, useUIStore,
} from '../store'
import { formatRelativeTime, formatDate, getStatusColor, cn } from '../utils'
import type { ConversationChannel, ConversationStatus } from '../types'

// ─── Channel meta ─────────────────────────────────────────

const CHANNEL_ICONS: Record<ConversationChannel, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  chat: <MessageSquare className="w-3.5 h-3.5" />,
  sms: <Smartphone className="w-3.5 h-3.5" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5" />,
}

const CHANNEL_LABELS: Record<ConversationChannel, string> = {
  email: 'Email',
  chat: 'Chat',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
}

const CHANNEL_COLORS: Record<ConversationChannel, string> = {
  email: 'bg-blue-50 text-blue-600',
  chat: 'bg-purple-50 text-purple-600',
  sms: 'bg-green-50 text-green-600',
  whatsapp: 'bg-teal-50 text-teal-600',
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  open: 'Abierto',
  pending: 'Pendiente',
  resolved: 'Resuelto',
  spam: 'Spam',
}

// ─── Helpers ──────────────────────────────────────────────

function formatGroupDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    return formatDate(dateStr, 'dd MMM yyyy')
  } catch { return dateStr }
}

function isSameDay(a: string, b: string): boolean {
  try {
    return new Date(a).toDateString() === new Date(b).toDateString()
  } catch { return false }
}

// ─── Inbox Page ───────────────────────────────────────────

export default function Inbox() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const {
    conversations, activeConversationId, filterStatus, filterChannel,
    setActiveConversation, setFilterStatus, setFilterChannel,
    sendMessage, resolveConversation, getFiltered,
  } = useInboxStore()
  const { contacts } = useContactStore()
  const { currentUser, users } = useUserStore()
  const { addToast } = useUIStore()

  const [search, setSearch] = useState('')
  const [replyText, setReplyText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync URL param → active conversation
  useEffect(() => {
    if (id) setActiveConversation(id)
  }, [id])

  const filteredConversations = useMemo(() => {
    let list = getFiltered()
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.contactName.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.contactEmail?.toLowerCase().includes(q)
      )
    }
    return list
  }, [conversations, filterStatus, filterChannel, search])

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  )

  const activeContact = useMemo(() => {
    if (!activeConversation?.contactId) return null
    return contacts.find(c => c.id === activeConversation.contactId) ?? null
  }, [activeConversation, contacts])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [replyText])

  const handleSelectConversation = (convId: string) => {
    setActiveConversation(convId)
    navigate(`/inbox/${convId}`)
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !activeConversationId) return
    sendMessage(activeConversationId, replyText, `${currentUser.firstName} ${currentUser.lastName}`)
    setReplyText('')
    addToast({ type: 'success', title: 'Respuesta enviada' })
  }

  const handleResolve = () => {
    if (!activeConversationId) return
    resolveConversation(activeConversationId)
    addToast({ type: 'success', title: 'Conversación resuelta' })
  }

  const handleAssign = (userId: string) => {
    setAssignDropdownOpen(false)
    const user = users.find(u => u.id === userId)
    if (user) addToast({ type: 'success', title: `Asignada a ${user.firstName} ${user.lastName}` })
  }

  const handleTyping = (val: string) => {
    setReplyText(val)
    if (!isTyping && val.trim()) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }

  // ── Stats ────────────────────────────────────────────────
  const totalUnread = useMemo(() =>
    conversations.reduce((s, c) => s + c.unreadCount, 0),
    [conversations]
  )

  // ── Filter chip groups ───────────────────────────────────
  const FILTER_CHIPS = [
    { label: 'Todas', value: '' },
    { label: 'Email', channel: 'email' },
    { label: 'Chat', channel: 'chat' },
    { label: 'SMS', channel: 'sms' },
    { label: 'Abiertos', status: 'open' },
    { label: 'Resueltos', status: 'resolved' },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden">

      {/* ══════════════════════════════════════════════════ */}
      {/* LEFT PANE — conversation list (320px)              */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={cn(
        'flex flex-col border-r border-gray-200 bg-white flex-shrink-0',
        'w-80 xl:w-80',
        activeConversationId ? 'hidden lg:flex' : 'flex w-full lg:w-80'
      )}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">Bandeja</h1>
              {totalUnread > 0 && (
                <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {totalUnread}
                </span>
              )}
            </div>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Filtros"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              className="input-field pl-8 text-sm w-full"
              placeholder="Buscar conversaciones..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-1 flex-wrap">
            {FILTER_CHIPS.map(chip => {
              const isActive =
                ('channel' in chip && filterChannel === chip.channel) ||
                ('status' in chip && filterStatus === chip.status) ||
                (chip.value === '' && !filterChannel && !filterStatus)

              return (
                <button
                  key={chip.label}
                  onClick={() => {
                    if ('channel' in chip) {
                      setFilterChannel(filterChannel === chip.channel ? '' : chip.channel!)
                    } else if ('status' in chip) {
                      setFilterStatus(filterStatus === chip.status ? '' : chip.status!)
                    } else {
                      setFilterChannel('')
                      setFilterStatus('')
                    }
                  }}
                  className={cn('filter-chip text-xs', isActive && 'active')}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-300">
              <InboxIcon className="w-8 h-8" />
              <p className="text-sm text-gray-400">Sin conversaciones</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const lastMsg = conv.messages[conv.messages.length - 1]
              const assignee = users.find(u => u.id === conv.assignedToId)

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                    activeConversationId === conv.id
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : ''
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with unread badge */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={conv.contactName} size="sm" />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + time */}
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn(
                          'text-sm truncate',
                          conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                        )}>
                          {conv.contactName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatRelativeTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      {/* Subject */}
                      {conv.subject && (
                        <p className="text-xs font-medium text-gray-600 truncate mb-0.5">{conv.subject}</p>
                      )}

                      {/* Last message preview */}
                      {lastMsg && (
                        <p className="text-xs text-gray-400 truncate mb-1.5">
                          {lastMsg.isInbound ? '' : 'Tú: '}
                          {lastMsg.body}
                        </p>
                      )}

                      {/* Channel + status + assignee */}
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium',
                          CHANNEL_COLORS[conv.channel]
                        )}>
                          {CHANNEL_ICONS[conv.channel]}
                          {CHANNEL_LABELS[conv.channel]}
                        </span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          getStatusColor(conv.status)
                        )}>
                          {STATUS_LABELS[conv.status]}
                        </span>
                        {assignee && (
                          <div className="ml-auto flex-shrink-0" title={`${assignee.firstName} ${assignee.lastName}`}>
                            <Avatar name={`${assignee.firstName} ${assignee.lastName}`} size="xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* MIDDLE PANE — message thread (flex-1)              */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={cn(
        'flex-1 flex flex-col bg-gray-50 min-w-0',
        !activeConversationId && 'hidden lg:flex'
      )}>
        {!activeConversation ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <InboxIcon className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-500">Selecciona una conversación</p>
              <p className="text-sm mt-1">Elige una conversación de la lista para ver los mensajes</p>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile back */}
                <button
                  onClick={() => { setActiveConversation(null); navigate('/inbox') }}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Avatar name={activeConversation.contactName} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900 text-sm">{activeConversation.contactName}</h2>
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium',
                      CHANNEL_COLORS[activeConversation.channel]
                    )}>
                      {CHANNEL_ICONS[activeConversation.channel]}
                      {CHANNEL_LABELS[activeConversation.channel]}
                    </span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full font-medium',
                      getStatusColor(activeConversation.status)
                    )}>
                      {STATUS_LABELS[activeConversation.status]}
                    </span>
                  </div>
                  {activeConversation.contactEmail && (
                    <p className="text-xs text-gray-400 truncate">{activeConversation.contactEmail}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Assign dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setAssignDropdownOpen(!assignDropdownOpen)}
                    className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    Asignar
                  </button>
                  {assignDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setAssignDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => handleAssign(u.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                          >
                            <Avatar name={`${u.firstName} ${u.lastName}`} size="xs" />
                            <span className="text-gray-700 truncate">{u.firstName} {u.lastName}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {activeConversation.status !== 'resolved' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                    onClick={handleResolve}
                  >
                    Resolver
                  </Button>
                )}
              </div>
            </div>

            {/* Tags bar */}
            {activeConversation.tags.length > 0 && (
              <div className="bg-white border-b border-gray-100 px-5 py-2 flex items-center gap-2 flex-shrink-0">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {activeConversation.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-1">
              {activeConversation.messages.map((msg, idx) => {
                const prev = activeConversation.messages[idx - 1]
                const showDateSep = !prev || !isSameDay(prev.createdAt, msg.createdAt)

                return (
                  <React.Fragment key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 py-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                          {formatGroupDate(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                    <div className={cn(
                      'flex gap-3 max-w-[80%] mb-3',
                      msg.isInbound ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    )}>
                      <div className="flex-shrink-0 mt-1">
                        <Avatar name={msg.fromName} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <div className={cn(
                          'rounded-2xl px-4 py-2.5 shadow-sm',
                          msg.isInbound
                            ? 'bg-white text-gray-900 rounded-tl-sm'
                            : 'bg-primary text-white rounded-tr-sm'
                        )}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                        </div>
                        <div className={cn(
                          'flex items-center gap-1.5 mt-1 text-xs text-gray-400',
                          msg.isInbound ? 'pl-1' : 'pr-1 flex-row-reverse'
                        )}>
                          <span className="font-medium">{msg.fromName}</span>
                          <span>·</span>
                          <span>{formatRelativeTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}

              {isTyping && (
                <div className="flex items-center gap-2 ml-10 text-xs text-gray-400 animate-pulse">
                  <span className="inline-flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span>Escribiendo...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply composer */}
            {activeConversation.status !== 'resolved' ? (
              <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-end gap-3">
                  <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} size="sm" />
                  <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden">
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none min-h-[3rem]"
                      placeholder="Escribe tu respuesta..."
                      value={replyText}
                      onChange={e => handleTyping(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          handleSendReply()
                        }
                      }}
                    />
                    <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Adjuntar archivo"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Usar plantilla"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-400 hidden sm:block">Cmd+Enter para enviar</span>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Send className="w-3.5 h-3.5" />}
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-center gap-2 text-teal-600 flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Conversación resuelta</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* RIGHT PANE — contact info (280px)                 */}
      {/* ══════════════════════════════════════════════════ */}
      {activeConversation && (
        <div className="hidden xl:flex flex-col w-72 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col items-center text-center gap-2">
              <Avatar name={activeConversation.contactName} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{activeConversation.contactName}</h3>
                {activeConversation.contactEmail && (
                  <p className="text-xs text-gray-400 mt-0.5">{activeConversation.contactEmail}</p>
                )}
                {activeContact?.companyName && (
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{activeContact.companyName}</p>
                )}
              </div>
              {activeContact && (
                <button
                  onClick={() => navigate(`/contacts/${activeContact.id}`)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-navy transition-colors font-medium"
                >
                  Ver perfil completo
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick properties */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Detalles</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Canal</span>
                <span className={cn(
                  'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium',
                  CHANNEL_COLORS[activeConversation.channel]
                )}>
                  {CHANNEL_ICONS[activeConversation.channel]}
                  {CHANNEL_LABELS[activeConversation.channel]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estado</span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-medium',
                  getStatusColor(activeConversation.status)
                )}>
                  {STATUS_LABELS[activeConversation.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Asignado a</span>
                {activeConversation.assignedToId ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar
                      name={(() => {
                        const u = users.find(u => u.id === activeConversation.assignedToId)
                        return u ? `${u.firstName} ${u.lastName}` : '?'
                      })()}
                      size="xs"
                    />
                    <span className="text-xs text-gray-700">
                      {(() => {
                        const u = users.find(u => u.id === activeConversation.assignedToId)
                        return u ? u.firstName : '—'
                      })()}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">Sin asignar</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Mensajes</span>
                <span className="text-xs font-semibold text-gray-900">{activeConversation.messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Creada</span>
                <span className="text-xs text-gray-600">{formatDate(activeConversation.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {activeConversation.tags.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Etiquetas</p>
              <div className="flex flex-wrap gap-1.5">
                {activeConversation.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact additional info */}
          {activeContact && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contacto</p>
              <div className="space-y-1.5">
                {activeContact.jobTitle && (
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">Cargo: </span>{activeContact.jobTitle}
                  </p>
                )}
                {activeContact.phone && (
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">Tel: </span>{activeContact.phone}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeContact.tags.map(tag => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversation history note */}
          <div className="p-4 flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Historial de conversación
            </p>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-600">Total mensajes</span>
              <span className="text-sm font-bold text-gray-900">{activeConversation.messages.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notas internas</p>
              <textarea
                className="input-field w-full text-xs resize-none"
                rows={4}
                placeholder="Agrega notas internas sobre esta conversación..."
              />
              <button className="text-xs text-primary hover:text-navy font-medium transition-colors">
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
