import type {
  User, Contact, Company, Pipeline, Deal, Ticket,
  Task, Activity, EmailCampaign, EmailTemplate,
  Sequence, SequenceStep, Product, Quote, Conversation, Message,
} from '../types'

// ─── Users ───────────────────────────────────────────────
export const USERS: User[] = [
  { id: 'u1', firstName: 'Ana', lastName: 'García', email: 'ana@crmcentral.com', role: 'super_admin', title: 'CEO', isActive: true, createdAt: '2023-01-10T09:00:00Z', avatarUrl: undefined },
  { id: 'u2', firstName: 'Carlos', lastName: 'López', email: 'carlos@crmcentral.com', role: 'manager', title: 'Sales Manager', isActive: true, createdAt: '2023-02-15T09:00:00Z' },
  { id: 'u3', firstName: 'María', lastName: 'Rodríguez', email: 'maria@crmcentral.com', role: 'rep', title: 'Sales Rep', isActive: true, createdAt: '2023-03-01T09:00:00Z' },
  { id: 'u4', firstName: 'Jorge', lastName: 'Martínez', email: 'jorge@crmcentral.com', role: 'rep', title: 'Sales Rep', isActive: true, createdAt: '2023-03-15T09:00:00Z' },
  { id: 'u5', firstName: 'Laura', lastName: 'Sánchez', email: 'laura@crmcentral.com', role: 'rep', title: 'Account Executive', isActive: true, createdAt: '2023-04-01T09:00:00Z' },
  { id: 'u6', firstName: 'Diego', lastName: 'Hernández', email: 'diego@crmcentral.com', role: 'manager', title: 'Marketing Manager', isActive: true, createdAt: '2023-04-15T09:00:00Z' },
  { id: 'u7', firstName: 'Sofia', lastName: 'Torres', email: 'sofia@crmcentral.com', role: 'rep', title: 'Customer Success', isActive: false, createdAt: '2023-05-01T09:00:00Z' },
  { id: 'u8', firstName: 'Ricardo', lastName: 'Vargas', email: 'ricardo@crmcentral.com', role: 'viewer', title: 'Finance', isActive: true, createdAt: '2023-06-01T09:00:00Z' },
]

// ─── Pipelines ───────────────────────────────────────────
export const PIPELINES: Pipeline[] = [
  {
    id: 'p1',
    name: 'Pipeline Principal',
    type: 'deals',
    isDefault: true,
    createdAt: '2023-01-10T09:00:00Z',
    stages: [
      { id: 'ps1', name: 'Prospecto', probability: 10, order: 0, color: '#6B7280', pipelineId: 'p1' },
      { id: 'ps2', name: 'Calificado', probability: 25, order: 1, color: '#3B82F6', pipelineId: 'p1' },
      { id: 'ps3', name: 'Propuesta', probability: 50, order: 2, color: '#8B5CF6', pipelineId: 'p1' },
      { id: 'ps4', name: 'Negociación', probability: 75, order: 3, color: '#F59E0B', pipelineId: 'p1' },
      { id: 'ps5', name: 'Cierre', probability: 90, order: 4, color: '#2AD4AE', pipelineId: 'p1' },
    ],
  },
  {
    id: 'p2',
    name: 'Enterprise Sales',
    type: 'deals',
    isDefault: false,
    createdAt: '2023-03-01T09:00:00Z',
    stages: [
      { id: 'ps6', name: 'Discovery', probability: 10, order: 0, color: '#6B7280', pipelineId: 'p2' },
      { id: 'ps7', name: 'Demo', probability: 30, order: 1, color: '#3B82F6', pipelineId: 'p2' },
      { id: 'ps8', name: 'Evaluación Técnica', probability: 50, order: 2, color: '#8B5CF6', pipelineId: 'p2' },
      { id: 'ps9', name: 'Propuesta Ejecutiva', probability: 70, order: 3, color: '#F59E0B', pipelineId: 'p2' },
      { id: 'ps10', name: 'Contrato', probability: 90, order: 4, color: '#2AD4AE', pipelineId: 'p2' },
    ],
  },
  {
    id: 'pt1',
    name: 'Soporte General',
    type: 'tickets',
    isDefault: true,
    createdAt: '2023-01-10T09:00:00Z',
    stages: [
      { id: 'ts1', name: 'Nuevo', probability: 0, order: 0, color: '#6B7280', pipelineId: 'pt1' },
      { id: 'ts2', name: 'En Proceso', probability: 0, order: 1, color: '#3B82F6', pipelineId: 'pt1' },
      { id: 'ts3', name: 'Esperando Respuesta', probability: 0, order: 2, color: '#F59E0B', pipelineId: 'pt1' },
      { id: 'ts4', name: 'Resuelto', probability: 0, order: 3, color: '#2AD4AE', pipelineId: 'pt1' },
    ],
  },
]

// ─── Companies ───────────────────────────────────────────
export const COMPANIES: Company[] = [
  { id: 'c1', name: 'Tecnova Solutions', domain: 'tecnova.mx', industry: 'Tecnología', type: 'customer', size: '51-200', employeeCount: 150, annualRevenue: 5000000, phone: '+52 55 1234-5678', website: 'https://tecnova.mx', ownerId: 'u2', tags: ['enterprise', 'tech'], description: 'Empresa líder en soluciones tecnológicas para PYMES.', createdAt: '2023-02-01T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z', lastActivityAt: '2024-03-20T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'c2', name: 'Fintek Capital', domain: 'fintek.com.mx', industry: 'Finanzas', type: 'prospect', size: '201-500', employeeCount: 320, annualRevenue: 15000000, website: 'https://fintek.com.mx', ownerId: 'u3', tags: ['fintech', 'enterprise'], createdAt: '2023-03-15T09:00:00Z', updatedAt: '2024-02-01T09:00:00Z', lastActivityAt: '2024-03-18T09:00:00Z', address: { city: 'Monterrey', country: 'México' } },
  { id: 'c3', name: 'HealthPro Clínicas', domain: 'healthpro.mx', industry: 'Salud', type: 'customer', size: '11-50', employeeCount: 45, annualRevenue: 2000000, phone: '+52 81 9876-5432', website: 'https://healthpro.mx', ownerId: 'u4', tags: ['healthcare', 'smb'], createdAt: '2023-04-01T09:00:00Z', updatedAt: '2024-01-20T09:00:00Z', lastActivityAt: '2024-03-15T09:00:00Z', address: { city: 'Guadalajara', country: 'México' } },
  { id: 'c4', name: 'Retail Express', domain: 'retailexpress.mx', industry: 'Retail', type: 'prospect', size: '51-200', employeeCount: 180, annualRevenue: 8000000, website: 'https://retailexpress.mx', ownerId: 'u5', tags: ['retail', 'ecommerce'], createdAt: '2023-05-10T09:00:00Z', updatedAt: '2024-02-10T09:00:00Z', lastActivityAt: '2024-03-10T09:00:00Z', address: { city: 'Puebla', country: 'México' } },
  { id: 'c5', name: 'LogiMax Freight', domain: 'logimax.mx', industry: 'Logística', type: 'customer', size: '201-500', employeeCount: 420, annualRevenue: 22000000, phone: '+52 55 4567-8901', website: 'https://logimax.mx', ownerId: 'u2', tags: ['logistics', 'enterprise'], createdAt: '2023-06-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z', lastActivityAt: '2024-03-22T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'c6', name: 'EduSmart Academy', domain: 'edusmart.mx', industry: 'Educación', type: 'prospect', size: '11-50', employeeCount: 30, annualRevenue: 800000, website: 'https://edusmart.mx', ownerId: 'u3', tags: ['edtech', 'smb'], createdAt: '2023-07-15T09:00:00Z', updatedAt: '2024-01-05T09:00:00Z', lastActivityAt: '2024-02-28T09:00:00Z', address: { city: 'Querétaro', country: 'México' } },
  { id: 'c7', name: 'Constructora Apex', domain: 'apex.mx', industry: 'Real Estate', type: 'partner', size: '51-200', employeeCount: 95, annualRevenue: 12000000, phone: '+52 55 2345-6789', website: 'https://apex.mx', ownerId: 'u4', tags: ['construction', 'real-estate'], createdAt: '2023-08-01T09:00:00Z', updatedAt: '2024-02-20T09:00:00Z', lastActivityAt: '2024-03-08T09:00:00Z', address: { city: 'Cancún', country: 'México' } },
  { id: 'c8', name: 'MediaFlow Studios', domain: 'mediaflow.mx', industry: 'Media', type: 'prospect', size: '1-10', employeeCount: 8, annualRevenue: 500000, website: 'https://mediaflow.mx', ownerId: 'u5', tags: ['media', 'creative'], createdAt: '2023-09-10T09:00:00Z', updatedAt: '2024-01-25T09:00:00Z', lastActivityAt: '2024-03-01T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'c9', name: 'GreenEnergy MX', domain: 'greenenergy.mx', industry: 'Energía', type: 'prospect', size: '51-200', employeeCount: 75, annualRevenue: 3000000, website: 'https://greenenergy.mx', ownerId: 'u2', tags: ['energy', 'sustainability'], createdAt: '2023-10-01T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z', lastActivityAt: '2024-03-12T09:00:00Z', address: { city: 'Mérida', country: 'México' } },
  { id: 'c10', name: 'AlphaCo Consulting', domain: 'alphaco.mx', industry: 'Consultoría', type: 'customer', size: '11-50', employeeCount: 25, annualRevenue: 1500000, phone: '+52 55 3456-7890', website: 'https://alphaco.mx', ownerId: 'u3', tags: ['consulting', 'b2b'], createdAt: '2023-11-01T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z', lastActivityAt: '2024-03-25T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
]

// ─── Contacts ────────────────────────────────────────────
export const CONTACTS: Contact[] = [
  { id: 'ct1', firstName: 'Roberto', lastName: 'Guzmán', email: 'roberto@tecnova.mx', phone: '+52 55 1111-2222', jobTitle: 'CTO', companyId: 'c1', companyName: 'Tecnova Solutions', lifecycleStage: 'customer', status: 'active', ownerId: 'u2', tags: ['decision-maker', 'tech'], source: 'referral', leadScore: 92, createdAt: '2023-02-05T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z', lastActivityAt: '2024-03-20T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'ct2', firstName: 'Fernanda', lastName: 'Morales', email: 'fernanda@fintek.com.mx', phone: '+52 81 3333-4444', jobTitle: 'CFO', companyId: 'c2', companyName: 'Fintek Capital', lifecycleStage: 'sales_qualified', status: 'active', ownerId: 'u3', tags: ['executive', 'finance'], source: 'organic_search', leadScore: 78, createdAt: '2023-03-20T09:00:00Z', updatedAt: '2024-03-18T09:00:00Z', lastActivityAt: '2024-03-18T09:00:00Z', address: { city: 'Monterrey', country: 'México' } },
  { id: 'ct3', firstName: 'Alejandro', lastName: 'Pérez', email: 'alejandro@healthpro.mx', phone: '+52 33 5555-6666', jobTitle: 'Director General', companyId: 'c3', companyName: 'HealthPro Clínicas', lifecycleStage: 'customer', status: 'active', ownerId: 'u4', tags: ['decision-maker', 'healthcare'], source: 'event', leadScore: 85, createdAt: '2023-04-05T09:00:00Z', updatedAt: '2024-03-15T09:00:00Z', lastActivityAt: '2024-03-15T09:00:00Z', address: { city: 'Guadalajara', country: 'México' } },
  { id: 'ct4', firstName: 'Valentina', lastName: 'Cruz', email: 'valentina@retailexpress.mx', phone: '+52 22 7777-8888', jobTitle: 'Head of Digital', companyId: 'c4', companyName: 'Retail Express', lifecycleStage: 'opportunity', status: 'active', ownerId: 'u5', tags: ['ecommerce', 'marketing'], source: 'paid_ads', leadScore: 65, createdAt: '2023-05-15T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z', lastActivityAt: '2024-03-10T09:00:00Z', address: { city: 'Puebla', country: 'México' } },
  { id: 'ct5', firstName: 'Miguel', lastName: 'Castillo', email: 'miguel@logimax.mx', phone: '+52 55 9999-0000', jobTitle: 'VP Operations', companyId: 'c5', companyName: 'LogiMax Freight', lifecycleStage: 'customer', status: 'active', ownerId: 'u2', tags: ['operations', 'enterprise'], source: 'referral', leadScore: 91, createdAt: '2023-06-05T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', lastActivityAt: '2024-03-22T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'ct6', firstName: 'Daniela', lastName: 'Flores', email: 'daniela@edusmart.mx', phone: '+52 44 2222-3333', jobTitle: 'Founder & CEO', companyId: 'c6', companyName: 'EduSmart Academy', lifecycleStage: 'marketing_qualified', status: 'active', ownerId: 'u3', tags: ['startup', 'founder'], source: 'social_media', leadScore: 55, createdAt: '2023-07-20T09:00:00Z', updatedAt: '2024-02-28T09:00:00Z', lastActivityAt: '2024-02-28T09:00:00Z', address: { city: 'Querétaro', country: 'México' } },
  { id: 'ct7', firstName: 'Andrés', lastName: 'Jiménez', email: 'andres@apex.mx', phone: '+52 99 4444-5555', jobTitle: 'CEO', companyId: 'c7', companyName: 'Constructora Apex', lifecycleStage: 'customer', status: 'active', ownerId: 'u4', tags: ['construction', 'decision-maker'], source: 'direct', leadScore: 88, createdAt: '2023-08-05T09:00:00Z', updatedAt: '2024-03-08T09:00:00Z', lastActivityAt: '2024-03-08T09:00:00Z', address: { city: 'Cancún', country: 'México' } },
  { id: 'ct8', firstName: 'Patricia', lastName: 'Ramírez', email: 'patricia@mediaflow.mx', phone: '+52 55 6666-7777', jobTitle: 'Creative Director', companyId: 'c8', companyName: 'MediaFlow Studios', lifecycleStage: 'lead', status: 'active', ownerId: 'u5', tags: ['creative', 'media'], source: 'organic_search', leadScore: 40, createdAt: '2023-09-15T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z', lastActivityAt: '2024-03-01T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'ct9', firstName: 'Eduardo', lastName: 'Medina', email: 'eduardo@greenenergy.mx', phone: '+52 99 8888-9999', jobTitle: 'Director Comercial', companyId: 'c9', companyName: 'GreenEnergy MX', lifecycleStage: 'sales_qualified', status: 'active', ownerId: 'u2', tags: ['energy', 'enterprise'], source: 'event', leadScore: 72, createdAt: '2023-10-05T09:00:00Z', updatedAt: '2024-03-12T09:00:00Z', lastActivityAt: '2024-03-12T09:00:00Z', address: { city: 'Mérida', country: 'México' } },
  { id: 'ct10', firstName: 'Isabella', lastName: 'Aguilar', email: 'isabella@alphaco.mx', phone: '+52 55 0000-1111', jobTitle: 'Managing Partner', companyId: 'c10', companyName: 'AlphaCo Consulting', lifecycleStage: 'customer', status: 'active', ownerId: 'u3', tags: ['consulting', 'partner'], source: 'referral', leadScore: 95, createdAt: '2023-11-05T09:00:00Z', updatedAt: '2024-03-25T09:00:00Z', lastActivityAt: '2024-03-25T09:00:00Z', address: { city: 'Ciudad de México', country: 'México' } },
  { id: 'ct11', firstName: 'Tomás', lastName: 'Núñez', email: 'tomas.nunez@gmail.com', phone: '+52 55 1234-9876', jobTitle: 'IT Manager', lifecycleStage: 'lead', status: 'active', ownerId: 'u3', tags: ['it', 'tech'], source: 'organic_search', leadScore: 35, createdAt: '2024-01-10T09:00:00Z', updatedAt: '2024-03-05T09:00:00Z', lastActivityAt: '2024-03-05T09:00:00Z' },
  { id: 'ct12', firstName: 'Carmen', lastName: 'Vega', email: 'carmen.vega@outlook.com', phone: '+52 33 9870-1234', jobTitle: 'Directora de Marketing', lifecycleStage: 'marketing_qualified', status: 'active', ownerId: 'u5', tags: ['marketing', 'decision-maker'], source: 'paid_ads', leadScore: 58, createdAt: '2024-01-25T09:00:00Z', updatedAt: '2024-03-15T09:00:00Z', lastActivityAt: '2024-03-15T09:00:00Z' },
  { id: 'ct13', firstName: 'Luis', lastName: 'Mendoza', email: 'luis@tecnova.mx', phone: '+52 55 2345-6789', jobTitle: 'Product Manager', companyId: 'c1', companyName: 'Tecnova Solutions', lifecycleStage: 'customer', status: 'active', ownerId: 'u2', tags: ['product', 'tech'], source: 'referral', leadScore: 80, createdAt: '2023-03-01T09:00:00Z', updatedAt: '2024-02-20T09:00:00Z', lastActivityAt: '2024-02-20T09:00:00Z' },
  { id: 'ct14', firstName: 'Ana María', lastName: 'Santos', email: 'ana.santos@fintek.com.mx', phone: '+52 81 3456-7890', jobTitle: 'VP Technology', companyId: 'c2', companyName: 'Fintek Capital', lifecycleStage: 'sales_qualified', status: 'active', ownerId: 'u4', tags: ['technology', 'finance'], source: 'event', leadScore: 68, createdAt: '2023-04-10T09:00:00Z', updatedAt: '2024-03-08T09:00:00Z', lastActivityAt: '2024-03-08T09:00:00Z' },
  { id: 'ct15', firstName: 'Jorge Luis', lastName: 'Ortega', email: 'jorge@greenenergy.mx', phone: '+52 99 4567-8901', jobTitle: 'Gerente de Proyectos', companyId: 'c9', companyName: 'GreenEnergy MX', lifecycleStage: 'opportunity', status: 'active', ownerId: 'u2', tags: ['projects', 'energy'], source: 'referral', leadScore: 62, createdAt: '2023-11-15T09:00:00Z', updatedAt: '2024-03-18T09:00:00Z', lastActivityAt: '2024-03-18T09:00:00Z' },
  { id: 'ct16', firstName: 'Gabriela', lastName: 'Reyes', email: 'gabriela.reyes@gmail.com', phone: '+52 55 5678-9012', jobTitle: 'COO', lifecycleStage: 'subscriber', status: 'active', ownerId: 'u3', tags: ['operations', 'executive'], source: 'organic_search', leadScore: 22, createdAt: '2024-02-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z', lastActivityAt: '2024-03-01T09:00:00Z' },
  { id: 'ct17', firstName: 'Héctor', lastName: 'Paredes', email: 'hector@logimax.mx', phone: '+52 55 6789-0123', jobTitle: 'Head of IT', companyId: 'c5', companyName: 'LogiMax Freight', lifecycleStage: 'customer', status: 'active', ownerId: 'u4', tags: ['it', 'logistics'], source: 'direct', leadScore: 75, createdAt: '2023-07-01T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z', lastActivityAt: '2024-02-15T09:00:00Z' },
  { id: 'ct18', firstName: 'Mariana', lastName: 'Calderón', email: 'mariana@apex.mx', phone: '+52 99 7890-1234', jobTitle: 'CFO', companyId: 'c7', companyName: 'Constructora Apex', lifecycleStage: 'customer', status: 'active', ownerId: 'u5', tags: ['finance', 'construction'], source: 'referral', leadScore: 83, createdAt: '2023-09-01T09:00:00Z', updatedAt: '2024-03-05T09:00:00Z', lastActivityAt: '2024-03-05T09:00:00Z' },
  { id: 'ct19', firstName: 'Rodrigo', lastName: 'Espinoza', email: 'rodrigo.espinoza@hotmail.com', lifecycleStage: 'lead', status: 'active', ownerId: 'u5', tags: ['startup', 'tech'], source: 'social_media', leadScore: 30, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z', lastActivityAt: '2024-03-10T09:00:00Z' },
  { id: 'ct20', firstName: 'Natalia', lastName: 'Guerrero', email: 'natalia@alphaco.mx', phone: '+52 55 8901-2345', jobTitle: 'Senior Consultant', companyId: 'c10', companyName: 'AlphaCo Consulting', lifecycleStage: 'customer', status: 'active', ownerId: 'u2', tags: ['consulting', 'strategy'], source: 'referral', leadScore: 88, createdAt: '2023-12-01T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z', lastActivityAt: '2024-03-20T09:00:00Z' },
]

// ─── Deals ───────────────────────────────────────────────
export const DEALS: Deal[] = [
  { id: 'd1', name: 'Tecnova - CRM Enterprise', value: 180000, currency: 'MXN', status: 'open', priority: 'high', pipelineId: 'p1', stageId: 'ps4', ownerId: 'u2', contactIds: ['ct1', 'ct13'], companyId: 'c1', closeDate: '2024-04-30T00:00:00Z', probability: 75, source: 'referral', tags: ['enterprise', 'crm'], description: 'Licenciamiento completo de CRM para 150 usuarios.', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z', lastActivityAt: '2024-03-20T09:00:00Z' },
  { id: 'd2', name: 'Fintek - Módulo Analytics', value: 95000, currency: 'MXN', status: 'open', priority: 'high', pipelineId: 'p1', stageId: 'ps3', ownerId: 'u3', contactIds: ['ct2', 'ct14'], companyId: 'c2', closeDate: '2024-05-15T00:00:00Z', probability: 50, source: 'organic_search', tags: ['analytics', 'fintech'], createdAt: '2024-01-20T09:00:00Z', updatedAt: '2024-03-18T09:00:00Z', lastActivityAt: '2024-03-18T09:00:00Z' },
  { id: 'd3', name: 'HealthPro - Suite Médica', value: 45000, currency: 'MXN', status: 'won', priority: 'medium', pipelineId: 'p1', stageId: 'ps5', ownerId: 'u4', contactIds: ['ct3'], companyId: 'c3', closeDate: '2024-03-01T00:00:00Z', probability: 100, source: 'event', tags: ['healthcare', 'saas'], createdAt: '2023-12-10T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z', lastActivityAt: '2024-03-01T09:00:00Z' },
  { id: 'd4', name: 'Retail Express - E-commerce', value: 72000, currency: 'MXN', status: 'open', priority: 'medium', pipelineId: 'p1', stageId: 'ps2', ownerId: 'u5', contactIds: ['ct4'], companyId: 'c4', closeDate: '2024-06-01T00:00:00Z', probability: 25, source: 'paid_ads', tags: ['ecommerce', 'retail'], createdAt: '2024-02-05T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z', lastActivityAt: '2024-03-10T09:00:00Z' },
  { id: 'd5', name: 'LogiMax - Sistema Tracking', value: 320000, currency: 'MXN', status: 'open', priority: 'high', pipelineId: 'p1', stageId: 'ps5', ownerId: 'u2', contactIds: ['ct5', 'ct17'], companyId: 'c5', closeDate: '2024-04-15T00:00:00Z', probability: 90, source: 'referral', tags: ['logistics', 'tracking', 'enterprise'], createdAt: '2024-01-08T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', lastActivityAt: '2024-03-22T09:00:00Z' },
  { id: 'd6', name: 'EduSmart - LMS Platform', value: 28000, currency: 'MXN', status: 'open', priority: 'low', pipelineId: 'p1', stageId: 'ps1', ownerId: 'u3', contactIds: ['ct6'], companyId: 'c6', closeDate: '2024-07-01T00:00:00Z', probability: 10, source: 'social_media', tags: ['edtech', 'lms'], createdAt: '2024-02-20T09:00:00Z', updatedAt: '2024-02-28T09:00:00Z', lastActivityAt: '2024-02-28T09:00:00Z' },
  { id: 'd7', name: 'Apex - CRM Construcción', value: 65000, currency: 'MXN', status: 'open', priority: 'medium', pipelineId: 'p1', stageId: 'ps3', ownerId: 'u4', contactIds: ['ct7', 'ct18'], companyId: 'c7', closeDate: '2024-05-30T00:00:00Z', probability: 50, source: 'direct', tags: ['construction', 'crm'], createdAt: '2024-01-25T09:00:00Z', updatedAt: '2024-03-08T09:00:00Z', lastActivityAt: '2024-03-08T09:00:00Z' },
  { id: 'd8', name: 'GreenEnergy - Automatización', value: 115000, currency: 'MXN', status: 'open', priority: 'high', pipelineId: 'p2', stageId: 'ps8', ownerId: 'u2', contactIds: ['ct9', 'ct15'], companyId: 'c9', closeDate: '2024-05-01T00:00:00Z', probability: 50, source: 'event', tags: ['energy', 'automation', 'enterprise'], createdAt: '2024-01-30T09:00:00Z', updatedAt: '2024-03-12T09:00:00Z', lastActivityAt: '2024-03-12T09:00:00Z' },
  { id: 'd9', name: 'AlphaCo - Consultoría CRM', value: 38000, currency: 'MXN', status: 'won', priority: 'medium', pipelineId: 'p1', stageId: 'ps5', ownerId: 'u3', contactIds: ['ct10', 'ct20'], companyId: 'c10', closeDate: '2024-03-15T00:00:00Z', probability: 100, source: 'referral', tags: ['consulting', 'implementation'], createdAt: '2024-01-05T09:00:00Z', updatedAt: '2024-03-15T09:00:00Z', lastActivityAt: '2024-03-15T09:00:00Z' },
  { id: 'd10', name: 'Fintek - Integración Bancaria', value: 210000, currency: 'MXN', status: 'open', priority: 'high', pipelineId: 'p2', stageId: 'ps9', ownerId: 'u4', contactIds: ['ct2'], companyId: 'c2', closeDate: '2024-06-30T00:00:00Z', probability: 70, source: 'event', tags: ['fintech', 'integration', 'enterprise'], createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z', lastActivityAt: '2024-03-20T09:00:00Z' },
  { id: 'd11', name: 'MediaFlow - Paquete Creative', value: 18000, currency: 'MXN', status: 'lost', priority: 'low', pipelineId: 'p1', stageId: 'ps2', ownerId: 'u5', contactIds: ['ct8'], companyId: 'c8', closeDate: '2024-02-28T00:00:00Z', probability: 0, source: 'organic_search', tags: ['media'], lostReason: 'Presupuesto insuficiente', createdAt: '2024-01-20T09:00:00Z', updatedAt: '2024-02-28T09:00:00Z', lastActivityAt: '2024-02-28T09:00:00Z' },
  { id: 'd12', name: 'Tecnova - Módulo RRHH', value: 55000, currency: 'MXN', status: 'open', priority: 'medium', pipelineId: 'p1', stageId: 'ps2', ownerId: 'u2', contactIds: ['ct1'], companyId: 'c1', closeDate: '2024-07-15T00:00:00Z', probability: 25, source: 'referral', tags: ['hr', 'module'], createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-25T09:00:00Z', lastActivityAt: '2024-03-25T09:00:00Z' },
]

// ─── Tickets ─────────────────────────────────────────────
export const TICKETS: Ticket[] = [
  { id: 'tk1', subject: 'Error en módulo de reportes', description: 'Los reportes de ventas no cargan correctamente cuando el rango de fechas supera 3 meses.', priority: 'high', status: 'open', pipelineId: 'pt1', stageId: 'ts2', ownerId: 'u4', contactId: 'ct1', companyId: 'c1', tags: ['bug', 'reports'], source: 'email', createdAt: '2024-03-20T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', dueDate: '2024-03-27T00:00:00Z' },
  { id: 'tk2', subject: 'Solicitud de capacitación - nuevo personal', description: 'Necesitamos capacitación para 5 nuevos usuarios que se incorporaron al equipo.', priority: 'medium', status: 'pending', pipelineId: 'pt1', stageId: 'ts3', ownerId: 'u3', contactId: 'ct5', companyId: 'c5', tags: ['training', 'onboarding'], source: 'email', createdAt: '2024-03-18T09:00:00Z', updatedAt: '2024-03-21T09:00:00Z', dueDate: '2024-04-01T00:00:00Z' },
  { id: 'tk3', subject: 'Integración con ERP no funciona', description: 'La integración con SAP está fallando desde la última actualización.', priority: 'urgent', status: 'open', pipelineId: 'pt1', stageId: 'ts1', ownerId: 'u2', contactId: 'ct3', companyId: 'c3', tags: ['integration', 'erp', 'urgent'], source: 'phone', createdAt: '2024-03-22T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', dueDate: '2024-03-24T00:00:00Z' },
  { id: 'tk4', subject: 'Exportación de datos en CSV', description: 'Necesitamos que el export incluya campos personalizados en el CSV de contactos.', priority: 'low', status: 'pending', pipelineId: 'pt1', stageId: 'ts3', ownerId: 'u5', contactId: 'ct10', companyId: 'c10', tags: ['export', 'feature-request'], source: 'email', createdAt: '2024-03-15T09:00:00Z', updatedAt: '2024-03-19T09:00:00Z', dueDate: '2024-04-15T00:00:00Z' },
  { id: 'tk5', subject: 'Configurar SSO con Google Workspace', description: 'Queremos configurar el inicio de sesión único con Google Workspace para todos los usuarios.', priority: 'medium', status: 'resolved', pipelineId: 'pt1', stageId: 'ts4', ownerId: 'u4', contactId: 'ct7', companyId: 'c7', tags: ['sso', 'security'], source: 'chat', createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-15T09:00:00Z', closedAt: '2024-03-15T09:00:00Z' },
  { id: 'tk6', subject: 'Lentitud en carga de dashboard', description: 'El dashboard principal tarda más de 10 segundos en cargar con más de 10,000 registros.', priority: 'high', status: 'open', pipelineId: 'pt1', stageId: 'ts2', ownerId: 'u2', contactId: 'ct9', companyId: 'c9', tags: ['performance', 'dashboard'], source: 'email', createdAt: '2024-03-19T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', dueDate: '2024-03-28T00:00:00Z' },
  { id: 'tk7', subject: 'No recibo notificaciones por email', description: 'Desde hace 3 días no llegan las notificaciones automáticas de nuevos leads.', priority: 'medium', status: 'open', pipelineId: 'pt1', stageId: 'ts1', ownerId: 'u3', contactId: 'ct4', companyId: 'c4', tags: ['notifications', 'email'], source: 'chat', createdAt: '2024-03-21T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', dueDate: '2024-03-26T00:00:00Z' },
  { id: 'tk8', subject: 'Facturación - cobro duplicado', description: 'Se realizó un cobro duplicado en la factura de marzo. Favor de revisar.', priority: 'urgent', status: 'pending', pipelineId: 'pt1', stageId: 'ts2', ownerId: 'u2', contactId: 'ct2', companyId: 'c2', tags: ['billing', 'urgent'], source: 'email', createdAt: '2024-03-22T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z', dueDate: '2024-03-25T00:00:00Z' },
]

// ─── Tasks ───────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

export const TASKS: Task[] = [
  { id: 'tsk1', title: 'Llamada de seguimiento con Roberto Guzmán', type: 'call', status: 'not_started', priority: 'high', dueDate: `${today}T10:00:00Z`, dueTime: '10:00', ownerId: 'u2', associatedContactIds: ['ct1'], associatedDealIds: ['d1'], associatedCompanyIds: ['c1'], createdAt: '2024-03-20T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z' },
  { id: 'tsk2', title: 'Enviar propuesta actualizada a Fintek', type: 'email', status: 'not_started', priority: 'high', dueDate: `${today}T14:00:00Z`, dueTime: '14:00', ownerId: 'u3', associatedContactIds: ['ct2'], associatedDealIds: ['d2'], associatedCompanyIds: ['c2'], notes: 'Incluir el módulo de analytics con pricing especial.', createdAt: '2024-03-21T09:00:00Z', updatedAt: '2024-03-21T09:00:00Z' },
  { id: 'tsk3', title: 'Demo con equipo de LogiMax', type: 'meeting', status: 'in_progress', priority: 'high', dueDate: `${today}T16:00:00Z`, dueTime: '16:00', ownerId: 'u2', associatedContactIds: ['ct5', 'ct17'], associatedDealIds: ['d5'], associatedCompanyIds: ['c5'], notes: 'Demo del módulo de tracking en tiempo real.', createdAt: '2024-03-22T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z' },
  { id: 'tsk4', title: 'Revisar contrato GreenEnergy', type: 'follow_up', status: 'not_started', priority: 'normal', dueDate: `${tomorrow}T09:00:00Z`, dueTime: '09:00', ownerId: 'u2', associatedContactIds: ['ct9'], associatedDealIds: ['d8'], associatedCompanyIds: ['c9'], createdAt: '2024-03-21T09:00:00Z', updatedAt: '2024-03-21T09:00:00Z' },
  { id: 'tsk5', title: 'Presentación ejecutiva Fintek Enterprise', type: 'meeting', status: 'not_started', priority: 'high', dueDate: `${tomorrow}T11:00:00Z`, dueTime: '11:00', ownerId: 'u4', associatedContactIds: ['ct2', 'ct14'], associatedDealIds: ['d10'], associatedCompanyIds: ['c2'], createdAt: '2024-03-22T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z' },
  { id: 'tsk6', title: 'Seguimiento EduSmart - necesidades', type: 'call', status: 'not_started', priority: 'low', dueDate: `${nextWeek}T10:00:00Z`, dueTime: '10:00', ownerId: 'u3', associatedContactIds: ['ct6'], associatedDealIds: ['d6'], associatedCompanyIds: ['c6'], createdAt: '2024-03-20T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z' },
  { id: 'tsk7', title: 'Actualizar datos de Constructora Apex', type: 'other', status: 'not_started', priority: 'normal', dueDate: `${nextWeek}T15:00:00Z`, ownerId: 'u4', associatedContactIds: ['ct7'], associatedDealIds: ['d7'], associatedCompanyIds: ['c7'], createdAt: '2024-03-19T09:00:00Z', updatedAt: '2024-03-19T09:00:00Z' },
  { id: 'tsk8', title: 'Llamada de onboarding - HealthPro', type: 'call', status: 'completed', priority: 'high', dueDate: `${yesterday}T10:00:00Z`, ownerId: 'u4', associatedContactIds: ['ct3'], associatedDealIds: ['d3'], associatedCompanyIds: ['c3'], completedAt: `${yesterday}T10:45:00Z`, createdAt: '2024-02-28T09:00:00Z', updatedAt: `${yesterday}T10:45:00Z` },
  { id: 'tsk9', title: 'Enviar invoice AlphaCo', type: 'email', status: 'completed', priority: 'high', dueDate: `${yesterday}T12:00:00Z`, ownerId: 'u3', associatedContactIds: ['ct10'], associatedDealIds: ['d9'], associatedCompanyIds: ['c10'], completedAt: `${yesterday}T11:30:00Z`, createdAt: '2024-03-14T09:00:00Z', updatedAt: `${yesterday}T11:30:00Z` },
  { id: 'tsk10', title: 'Seguimiento ticket #TK-001', type: 'follow_up', status: 'not_started', priority: 'high', dueDate: `${yesterday}T16:00:00Z`, ownerId: 'u4', associatedContactIds: ['ct1'], associatedDealIds: [], associatedCompanyIds: ['c1'], createdAt: '2024-03-21T09:00:00Z', updatedAt: '2024-03-21T09:00:00Z' },
]

// ─── Activities ──────────────────────────────────────────
export const ACTIVITIES: Activity[] = [
  { id: 'act1', type: 'deal_won', title: 'Deal ganado: HealthPro - Suite Médica', body: 'Felicidades! El deal por $45,000 MXN fue cerrado exitosamente.', ownerId: 'u4', associatedContactId: 'ct3', associatedDealId: 'd3', associatedCompanyId: 'c3', createdAt: '2024-03-01T09:00:00Z' },
  { id: 'act2', type: 'call', title: 'Llamada con Roberto Guzmán - 45 min', body: 'Discutimos los requerimientos del módulo de reportes. Próximo paso: propuesta técnica.', ownerId: 'u2', associatedContactId: 'ct1', associatedDealId: 'd1', associatedCompanyId: 'c1', metadata: { duration: 45 }, createdAt: '2024-03-20T10:30:00Z' },
  { id: 'act3', type: 'email_sent', title: 'Propuesta enviada a Fintek Capital', body: 'Se envió la propuesta del módulo de analytics con pricing especial.', ownerId: 'u3', associatedContactId: 'ct2', associatedDealId: 'd2', associatedCompanyId: 'c2', createdAt: '2024-03-18T14:00:00Z' },
  { id: 'act4', type: 'meeting', title: 'Demo LogiMax - Sistema de Tracking', body: 'Presentación del módulo de tracking en tiempo real. Muy buena recepción del equipo.', ownerId: 'u2', associatedContactId: 'ct5', associatedDealId: 'd5', associatedCompanyId: 'c5', metadata: { duration: 60 }, createdAt: '2024-03-22T16:00:00Z' },
  { id: 'act5', type: 'note', title: 'Nota: GreenEnergy - Status negociación', body: 'El equipo legal está revisando el contrato. Esperamos respuesta esta semana.', ownerId: 'u2', associatedContactId: 'ct9', associatedDealId: 'd8', associatedCompanyId: 'c9', createdAt: '2024-03-12T09:00:00Z' },
  { id: 'act6', type: 'contact_created', title: 'Nuevo contacto: Gabriela Reyes', ownerId: 'u3', associatedContactId: 'ct16', createdAt: '2024-02-01T09:00:00Z' },
  { id: 'act7', type: 'deal_created', title: 'Nuevo deal: Tecnova - Módulo RRHH', body: 'Deal por $55,000 MXN creado en el pipeline principal.', ownerId: 'u2', associatedContactId: 'ct1', associatedDealId: 'd12', associatedCompanyId: 'c1', createdAt: '2024-03-01T09:00:00Z' },
  { id: 'act8', type: 'deal_stage_changed', title: 'Deal movido: Apex - CRM Construcción', body: 'Deal movido de "Calificado" a "Propuesta"', ownerId: 'u4', associatedContactId: 'ct7', associatedDealId: 'd7', associatedCompanyId: 'c7', createdAt: '2024-03-08T09:00:00Z' },
  { id: 'act9', type: 'email_opened', title: 'Propuesta abierta por Fernanda Morales', body: 'La propuesta fue abierta 3 veces en las últimas 24 horas.', ownerId: 'u3', associatedContactId: 'ct2', associatedDealId: 'd2', associatedCompanyId: 'c2', createdAt: '2024-03-19T09:30:00Z' },
  { id: 'act10', type: 'ticket_created', title: 'Nuevo ticket: Error en módulo de reportes', ownerId: 'u4', associatedContactId: 'ct1', associatedCompanyId: 'c1', createdAt: '2024-03-20T09:00:00Z' },
  { id: 'act11', type: 'ticket_resolved', title: 'Ticket resuelto: SSO con Google Workspace', ownerId: 'u4', associatedContactId: 'ct7', associatedCompanyId: 'c7', createdAt: '2024-03-15T09:00:00Z' },
  { id: 'act12', type: 'deal_won', title: 'Deal ganado: AlphaCo - Consultoría CRM', body: 'Deal por $38,000 MXN cerrado. Inicio de implementación en abril.', ownerId: 'u3', associatedContactId: 'ct10', associatedDealId: 'd9', associatedCompanyId: 'c10', createdAt: '2024-03-15T12:00:00Z' },
  { id: 'act13', type: 'call', title: 'Llamada de onboarding con Isabella Aguilar - 60 min', body: 'Revisamos el plan de implementación y los próximos pasos.', ownerId: 'u3', associatedContactId: 'ct10', associatedCompanyId: 'c10', metadata: { duration: 60 }, createdAt: '2024-03-20T14:00:00Z' },
  { id: 'act14', type: 'email_received', title: 'Respuesta de Alejandro Pérez - HealthPro', body: 'Confirmó que el sistema está funcionando correctamente. Muy satisfecho.', ownerId: 'u4', associatedContactId: 'ct3', associatedCompanyId: 'c3', createdAt: '2024-03-15T16:00:00Z' },
  { id: 'act15', type: 'company_created', title: 'Nueva empresa: GreenEnergy MX', ownerId: 'u2', associatedCompanyId: 'c9', createdAt: '2023-10-01T09:00:00Z' },
]

// ─── Email Campaigns ──────────────────────────────────────
export const EMAIL_CAMPAIGNS: EmailCampaign[] = [
  { id: 'ec1', name: 'Newsletter Marzo 2024', subject: '🚀 Novedades del mes: Nuevas funciones CRM Central', fromName: 'CRM Central', fromEmail: 'news@crmcentral.com', htmlContent: '<h1>Novedades</h1>', status: 'sent', sentAt: '2024-03-05T09:00:00Z', recipientCount: 1240, stats: { sent: 1240, delivered: 1198, opened: 542, clicked: 127, bounced: 42, unsubscribed: 8 }, createdAt: '2024-02-28T09:00:00Z', updatedAt: '2024-03-05T09:00:00Z' },
  { id: 'ec2', name: 'Campaña Webinar Q1', subject: 'Únete a nuestro webinar gratuito: CRM para Pymes', fromName: 'Ana García - CRM Central', fromEmail: 'ana@crmcentral.com', htmlContent: '<h1>Webinar</h1>', status: 'sent', sentAt: '2024-02-15T09:00:00Z', recipientCount: 856, stats: { sent: 856, delivered: 830, opened: 398, clicked: 201, bounced: 26, unsubscribed: 5 }, createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z' },
  { id: 'ec3', name: 'Seguimiento Leads Fríos', subject: 'Tenemos algo especial para ti 🎯', fromName: 'Carlos López', fromEmail: 'carlos@crmcentral.com', htmlContent: '<h1>Seguimiento</h1>', status: 'sent', sentAt: '2024-01-20T09:00:00Z', recipientCount: 423, stats: { sent: 423, delivered: 410, opened: 145, clicked: 38, bounced: 13, unsubscribed: 3 }, createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-20T09:00:00Z' },
  { id: 'ec4', name: 'Newsletter Abril 2024', subject: '📊 Tendencias CRM: Lo que debes saber en Q2', fromName: 'CRM Central', fromEmail: 'news@crmcentral.com', htmlContent: '<h1>Newsletter</h1>', status: 'scheduled', scheduledAt: '2024-04-05T09:00:00Z', recipientCount: 0, stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }, createdAt: '2024-03-20T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z' },
  { id: 'ec5', name: 'Oferta Especial Q2', subject: '¡50% OFF en tu primer mes! Solo esta semana', fromName: 'CRM Central', fromEmail: 'promo@crmcentral.com', htmlContent: '<h1>Oferta</h1>', status: 'draft', recipientCount: 0, stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }, createdAt: '2024-03-22T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z' },
]

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 'et1', name: 'Bienvenida nuevo cliente', subject: 'Bienvenido a {{company}}', category: 'Onboarding', htmlContent: '<h1>¡Bienvenido!</h1><p>Hola {{firstName}},</p><p>Nos alegra tenerte a bordo.</p>', createdAt: '2023-06-01T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z' },
  { id: 'et2', name: 'Seguimiento post-demo', subject: 'Siguientes pasos - Demo {{company}}', category: 'Sales', htmlContent: '<h1>Gracias por tu tiempo</h1>', createdAt: '2023-07-01T09:00:00Z', updatedAt: '2024-02-01T09:00:00Z' },
  { id: 'et3', name: 'Propuesta comercial', subject: 'Propuesta personalizada para {{company}}', category: 'Sales', htmlContent: '<h1>Propuesta</h1>', createdAt: '2023-08-01T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z' },
  { id: 'et4', name: 'Newsletter mensual', subject: 'Novedades de {{month}}', category: 'Marketing', htmlContent: '<h1>Newsletter</h1>', createdAt: '2023-09-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z' },
  { id: 'et5', name: 'Re-engagement', subject: 'Te echamos de menos 👋', category: 'Marketing', htmlContent: '<h1>Te echamos de menos</h1>', createdAt: '2023-10-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'et6', name: 'Confirmación de ticket', subject: 'Ticket #{{ticketId}} recibido', category: 'Support', htmlContent: '<h1>Ticket recibido</h1>', createdAt: '2023-11-01T09:00:00Z', updatedAt: '2024-01-20T09:00:00Z' },
]

// ─── Sequences ───────────────────────────────────────────
export const SEQUENCES: Sequence[] = [
  {
    id: 'seq1', name: 'Onboarding nuevo lead', description: 'Secuencia de bienvenida para nuevos leads. 5 emails en 2 semanas.', status: 'active', enrolledCount: 48, completedCount: 31, openRate: 68, replyRate: 22, createdAt: '2023-06-01T09:00:00Z', updatedAt: '2024-02-01T09:00:00Z',
    steps: [
      { id: 'ss1', sequenceId: 'seq1', order: 1, type: 'email', subject: 'Bienvenido a CRM Central', body: 'Hola {{firstName}}, nos alegra tenerte...', delayDays: 0 },
      { id: 'ss2', sequenceId: 'seq1', order: 2, type: 'delay', delayDays: 2 },
      { id: 'ss3', sequenceId: 'seq1', order: 3, type: 'email', subject: '¿Tienes preguntas? Aquí estamos', body: 'Han pasado un par de días...', delayDays: 2 },
      { id: 'ss4', sequenceId: 'seq1', order: 4, type: 'task', taskTitle: 'Llamar al lead si no ha respondido', taskType: 'call', delayDays: 5 },
      { id: 'ss5', sequenceId: 'seq1', order: 5, type: 'email', subject: 'Recursos que te ayudarán', body: 'Queremos compartirte...', delayDays: 7 },
    ],
  },
  {
    id: 'seq2', name: 'Seguimiento post-demo', description: 'Seguimiento automático después de una demo. 4 pasos en 1 semana.', status: 'active', enrolledCount: 23, completedCount: 18, openRate: 75, replyRate: 35, createdAt: '2023-08-01T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z',
    steps: [
      { id: 'ss6', sequenceId: 'seq2', order: 1, type: 'email', subject: 'Gracias por la demo, {{firstName}}', body: 'Fue un placer mostrarte...', delayDays: 0 },
      { id: 'ss7', sequenceId: 'seq2', order: 2, type: 'delay', delayDays: 1 },
      { id: 'ss8', sequenceId: 'seq2', order: 3, type: 'email', subject: 'Recursos adicionales y pricing', body: 'Adjunto encontrarás...', delayDays: 1 },
      { id: 'ss9', sequenceId: 'seq2', order: 4, type: 'task', taskTitle: 'Llamar para resolver dudas del pricing', taskType: 'call', delayDays: 3 },
    ],
  },
  {
    id: 'seq3', name: 'Re-engagement leads fríos', description: 'Reactiva contactos que no han respondido en 60+ días.', status: 'active', enrolledCount: 62, completedCount: 45, openRate: 32, replyRate: 8, createdAt: '2023-10-01T09:00:00Z', updatedAt: '2024-02-20T09:00:00Z',
    steps: [
      { id: 'ss10', sequenceId: 'seq3', order: 1, type: 'email', subject: 'Ha pasado un tiempo, {{firstName}}...', body: 'Queremos saber cómo estás...', delayDays: 0 },
      { id: 'ss11', sequenceId: 'seq3', order: 2, type: 'delay', delayDays: 7 },
      { id: 'ss12', sequenceId: 'seq3', order: 3, type: 'email', subject: 'Última oportunidad: oferta especial', body: 'Esta es nuestra oferta final...', delayDays: 7 },
    ],
  },
  {
    id: 'seq4', name: 'Upsell clientes actuales', description: 'Presenta módulos adicionales a clientes activos.', status: 'paused', enrolledCount: 15, completedCount: 8, openRate: 82, replyRate: 40, createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z',
    steps: [
      { id: 'ss13', sequenceId: 'seq4', order: 1, type: 'email', subject: 'Expande las capacidades de tu CRM', body: 'Como cliente existente...', delayDays: 0 },
      { id: 'ss14', sequenceId: 'seq4', order: 2, type: 'task', taskTitle: 'Agendar llamada de descubrimiento', taskType: 'call', delayDays: 3 },
    ],
  },
]

// ─── Products ────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  { id: 'pr1', name: 'CRM Starter', description: 'Hasta 5 usuarios y 1,000 contactos. Perfecto para pequeñas empresas.', sku: 'CRM-STR-001', price: 1500, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Planes', isActive: true, createdAt: '2023-01-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr2', name: 'CRM Professional', description: 'Hasta 25 usuarios y 10,000 contactos. Automatización y reportes avanzados.', sku: 'CRM-PRO-001', price: 4500, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Planes', isActive: true, createdAt: '2023-01-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr3', name: 'CRM Enterprise', description: 'Usuarios ilimitados, contactos ilimitados. Todas las funciones.', sku: 'CRM-ENT-001', price: 12000, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Planes', isActive: true, createdAt: '2023-01-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr4', name: 'Módulo Email Marketing', description: 'Campañas ilimitadas, segmentación avanzada, A/B testing.', sku: 'MOD-EMAIL-001', price: 800, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Módulos', isActive: true, createdAt: '2023-03-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr5', name: 'Módulo Secuencias', description: 'Automatización de secuencias de email y tareas.', sku: 'MOD-SEQ-001', price: 600, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Módulos', isActive: true, createdAt: '2023-03-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr6', name: 'Módulo Analytics Avanzado', description: 'Dashboards personalizados, reportes de BI, exportación de datos.', sku: 'MOD-ANA-001', price: 1200, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Módulos', isActive: true, createdAt: '2023-04-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr7', name: 'Implementación Básica', description: 'Setup inicial, migración de datos y capacitación básica (8 horas).', sku: 'SVC-IMP-BAS', price: 8000, currency: 'MXN', billingFrequency: 'one_time', unit: 'proyecto', category: 'Servicios', isActive: true, createdAt: '2023-02-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr8', name: 'Implementación Enterprise', description: 'Setup completo, migración avanzada, integraciones y capacitación (40 horas).', sku: 'SVC-IMP-ENT', price: 35000, currency: 'MXN', billingFrequency: 'one_time', unit: 'proyecto', category: 'Servicios', isActive: true, createdAt: '2023-02-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr9', name: 'Soporte Premium', description: 'Soporte prioritario 24/7, gerente de cuenta dedicado.', sku: 'SVC-SUP-PRE', price: 2500, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Servicios', isActive: true, createdAt: '2023-05-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr10', name: 'Capacitación Adicional', description: 'Sesión de capacitación adicional (4 horas) para tu equipo.', sku: 'SVC-TRN-001', price: 3500, currency: 'MXN', billingFrequency: 'one_time', unit: 'sesión', category: 'Servicios', isActive: true, createdAt: '2023-06-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr11', name: 'Módulo Firma Electrónica', description: 'Firmas electrónicas ilimitadas y gestión de documentos.', sku: 'MOD-SIGN-001', price: 450, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Módulos', isActive: true, createdAt: '2023-07-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
  { id: 'pr12', name: 'API Access', description: 'Acceso a API REST para integraciones personalizadas.', sku: 'API-ACC-001', price: 350, currency: 'MXN', billingFrequency: 'monthly', unit: 'mes', category: 'Add-ons', isActive: true, createdAt: '2023-08-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' },
]

// ─── Quotes ──────────────────────────────────────────────
export const QUOTES: Quote[] = [
  {
    id: 'q1', quoteNumber: 'QUO-2024-001', dealId: 'd1', contactId: 'ct1', companyId: 'c1', status: 'pending', validUntil: '2024-04-30T00:00:00Z', currency: 'MXN', ownerId: 'u2', createdAt: '2024-03-15T09:00:00Z', updatedAt: '2024-03-20T09:00:00Z', sentAt: '2024-03-15T10:00:00Z',
    lineItems: [
      { id: 'li1', productId: 'pr3', name: 'CRM Enterprise', quantity: 1, unitPrice: 12000, discount: 20, total: 9600 },
      { id: 'li2', productId: 'pr8', name: 'Implementación Enterprise', quantity: 1, unitPrice: 35000, discount: 10, total: 31500 },
      { id: 'li3', productId: 'pr9', name: 'Soporte Premium', quantity: 12, unitPrice: 2500, discount: 15, total: 25500 },
    ],
    subtotal: 66600, discountTotal: 9900, tax: 10656, total: 67356,
    notes: 'Precio especial para contrato anual. Incluye soporte premium por 12 meses.', terms: 'Pago 50% al inicio, 50% a 30 días de implementación.',
  },
  {
    id: 'q2', quoteNumber: 'QUO-2024-002', dealId: 'd5', contactId: 'ct5', companyId: 'c5', status: 'approved', validUntil: '2024-04-15T00:00:00Z', currency: 'MXN', ownerId: 'u2', createdAt: '2024-03-10T09:00:00Z', updatedAt: '2024-03-18T09:00:00Z', sentAt: '2024-03-10T10:00:00Z', signedAt: '2024-03-18T14:00:00Z',
    lineItems: [
      { id: 'li4', productId: 'pr3', name: 'CRM Enterprise', quantity: 1, unitPrice: 12000, discount: 25, total: 9000 },
      { id: 'li5', productId: 'pr6', name: 'Módulo Analytics Avanzado', quantity: 1, unitPrice: 1200, discount: 0, total: 1200 },
      { id: 'li6', productId: 'pr8', name: 'Implementación Enterprise', quantity: 1, unitPrice: 35000, discount: 15, total: 29750 },
    ],
    subtotal: 47200, discountTotal: 6950, tax: 6438, total: 46688, notes: 'Contrato anual prepago con descuento especial.',
  },
  {
    id: 'q3', quoteNumber: 'QUO-2024-003', dealId: 'd3', contactId: 'ct3', companyId: 'c3', status: 'approved', validUntil: '2024-03-01T00:00:00Z', currency: 'MXN', ownerId: 'u4', createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z', sentAt: '2024-02-15T10:00:00Z', signedAt: '2024-03-01T09:00:00Z',
    lineItems: [
      { id: 'li7', productId: 'pr2', name: 'CRM Professional', quantity: 1, unitPrice: 4500, discount: 0, total: 4500 },
      { id: 'li8', productId: 'pr7', name: 'Implementación Básica', quantity: 1, unitPrice: 8000, discount: 0, total: 8000 },
    ],
    subtotal: 12500, discountTotal: 0, tax: 2000, total: 14500,
  },
  {
    id: 'q4', quoteNumber: 'QUO-2024-004', dealId: 'd2', contactId: 'ct2', companyId: 'c2', status: 'draft', validUntil: '2024-05-15T00:00:00Z', currency: 'MXN', ownerId: 'u3', createdAt: '2024-03-18T09:00:00Z', updatedAt: '2024-03-22T09:00:00Z',
    lineItems: [
      { id: 'li9', productId: 'pr3', name: 'CRM Enterprise', quantity: 1, unitPrice: 12000, discount: 20, total: 9600 },
      { id: 'li10', productId: 'pr6', name: 'Módulo Analytics Avanzado', quantity: 1, unitPrice: 1200, discount: 0, total: 1200 },
    ],
    subtotal: 13200, discountTotal: 2400, tax: 1728, total: 12528,
  },
  {
    id: 'q5', quoteNumber: 'QUO-2024-005', dealId: 'd9', contactId: 'ct10', companyId: 'c10', status: 'approved', validUntil: '2024-03-30T00:00:00Z', currency: 'MXN', ownerId: 'u3', createdAt: '2024-03-05T09:00:00Z', updatedAt: '2024-03-15T09:00:00Z', sentAt: '2024-03-05T10:00:00Z', signedAt: '2024-03-15T09:00:00Z',
    lineItems: [
      { id: 'li11', productId: 'pr1', name: 'CRM Starter', quantity: 1, unitPrice: 1500, discount: 0, total: 1500 },
      { id: 'li12', productId: 'pr7', name: 'Implementación Básica', quantity: 1, unitPrice: 8000, discount: 10, total: 7200 },
      { id: 'li13', productId: 'pr10', name: 'Capacitación Adicional', quantity: 2, unitPrice: 3500, discount: 0, total: 7000 },
    ],
    subtotal: 15700, discountTotal: 800, tax: 2384, total: 17284,
  },
]

// ─── Conversations (Inbox) ────────────────────────────────
export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1', channel: 'email', status: 'open', subject: 'Consulta sobre precios Enterprise', contactId: 'ct2', contactName: 'Fernanda Morales', contactEmail: 'fernanda@fintek.com.mx', assignedToId: 'u3', lastMessageAt: '2024-03-22T14:30:00Z', unreadCount: 2, tags: ['pricing', 'enterprise'],
    createdAt: '2024-03-20T09:00:00Z',
    messages: [
      { id: 'msg1', conversationId: 'conv1', fromName: 'Fernanda Morales', fromEmail: 'fernanda@fintek.com.mx', body: 'Hola, me gustaría conocer más sobre el plan Enterprise y qué incluye el soporte dedicado. ¿Tienen opciones de pago anual?', isInbound: true, channel: 'email', createdAt: '2024-03-20T09:15:00Z' },
      { id: 'msg2', conversationId: 'conv1', fromName: 'Carlos López', fromEmail: 'carlos@crmcentral.com', body: 'Hola Fernanda, gracias por contactarnos. El plan Enterprise incluye usuarios ilimitados, todas las integraciones y soporte premium 24/7. Para pago anual ofrecemos un 20% de descuento. ¿Puedo agendar una llamada para explicarte todo en detalle?', isInbound: false, channel: 'email', createdAt: '2024-03-20T10:30:00Z', readAt: '2024-03-20T11:00:00Z' },
      { id: 'msg3', conversationId: 'conv1', fromName: 'Fernanda Morales', fromEmail: 'fernanda@fintek.com.mx', body: '¡Perfecto! Sí, me interesa mucho la opción anual. ¿Tienes disponibilidad el miércoles a las 11am?', isInbound: true, channel: 'email', createdAt: '2024-03-22T13:00:00Z' },
      { id: 'msg4', conversationId: 'conv1', fromName: 'Fernanda Morales', fromEmail: 'fernanda@fintek.com.mx', body: 'También me gustaría saber si el módulo de analytics está incluido en Enterprise o tiene costo adicional.', isInbound: true, channel: 'email', createdAt: '2024-03-22T14:30:00Z' },
    ],
  },
  {
    id: 'conv2', channel: 'chat', status: 'open', subject: 'Problema con importación de contactos', contactId: 'ct4', contactName: 'Valentina Cruz', contactEmail: 'valentina@retailexpress.mx', assignedToId: 'u4', lastMessageAt: '2024-03-22T16:00:00Z', unreadCount: 1, tags: ['support', 'import'],
    createdAt: '2024-03-22T15:30:00Z',
    messages: [
      { id: 'msg5', conversationId: 'conv2', fromName: 'Valentina Cruz', body: 'Hola, estoy intentando importar 5,000 contactos desde Excel y el proceso falla al 80%', isInbound: true, channel: 'chat', createdAt: '2024-03-22T15:30:00Z' },
      { id: 'msg6', conversationId: 'conv2', fromName: 'Jorge Martínez', fromEmail: 'jorge@crmcentral.com', body: 'Hola Valentina, te puedo ayudar con eso. ¿Puedes decirme qué error ves exactamente?', isInbound: false, channel: 'chat', createdAt: '2024-03-22T15:35:00Z' },
      { id: 'msg7', conversationId: 'conv2', fromName: 'Valentina Cruz', body: 'Dice "Error en columna Email: formato inválido en fila 4003"', isInbound: true, channel: 'chat', createdAt: '2024-03-22T16:00:00Z' },
    ],
  },
  {
    id: 'conv3', channel: 'email', status: 'resolved', subject: 'Factura de febrero - aclaración', contactId: 'ct1', contactName: 'Roberto Guzmán', contactEmail: 'roberto@tecnova.mx', assignedToId: 'u2', lastMessageAt: '2024-03-10T12:00:00Z', unreadCount: 0, tags: ['billing'],
    createdAt: '2024-03-05T09:00:00Z',
    messages: [
      { id: 'msg8', conversationId: 'conv3', fromName: 'Roberto Guzmán', fromEmail: 'roberto@tecnova.mx', body: 'Hola, tengo una duda sobre los cargos de febrero. El monto es diferente al mes anterior.', isInbound: true, channel: 'email', createdAt: '2024-03-05T09:00:00Z' },
      { id: 'msg9', conversationId: 'conv3', fromName: 'Carlos López', fromEmail: 'carlos@crmcentral.com', body: 'Hola Roberto, el cargo adicional corresponde al módulo de Analytics Avanzado que se activó el 1 de febrero. ¿Lo recuerdas?', isInbound: false, channel: 'email', createdAt: '2024-03-05T11:00:00Z' },
      { id: 'msg10', conversationId: 'conv3', fromName: 'Roberto Guzmán', fromEmail: 'roberto@tecnova.mx', body: 'Ah sí, perfecto. Ya recuerdo. Gracias por la aclaración.', isInbound: true, channel: 'email', createdAt: '2024-03-10T12:00:00Z' },
    ],
  },
  {
    id: 'conv4', channel: 'email', status: 'pending', subject: 'Solicitud de integración con Salesforce', contactId: 'ct9', contactName: 'Eduardo Medina', contactEmail: 'eduardo@greenenergy.mx', assignedToId: 'u2', lastMessageAt: '2024-03-21T10:00:00Z', unreadCount: 0, tags: ['integration', 'enterprise'],
    createdAt: '2024-03-20T14:00:00Z',
    messages: [
      { id: 'msg11', conversationId: 'conv4', fromName: 'Eduardo Medina', fromEmail: 'eduardo@greenenergy.mx', body: 'Necesitamos sincronizar CRM Central con nuestro Salesforce existente. ¿Es esto posible?', isInbound: true, channel: 'email', createdAt: '2024-03-20T14:00:00Z' },
      { id: 'msg12', conversationId: 'conv4', fromName: 'Carlos López', fromEmail: 'carlos@crmcentral.com', body: 'Hola Eduardo, sí tenemos integración bidireccional con Salesforce. Voy a consultar con nuestro equipo técnico los detalles de la migración y te respondo hoy.', isInbound: false, channel: 'email', createdAt: '2024-03-21T10:00:00Z' },
    ],
  },
  {
    id: 'conv5', channel: 'sms', status: 'open', subject: undefined, contactName: 'Patricia Ramírez', contactEmail: 'patricia@mediaflow.mx', assignedToId: 'u5', lastMessageAt: '2024-03-22T11:00:00Z', unreadCount: 3, tags: [],
    createdAt: '2024-03-22T10:00:00Z',
    messages: [
      { id: 'msg13', conversationId: 'conv5', fromName: 'Patricia Ramírez', body: 'Hola, me interesa el plan starter para mi agencia.', isInbound: true, channel: 'sms', createdAt: '2024-03-22T10:00:00Z' },
      { id: 'msg14', conversationId: 'conv5', fromName: 'Laura Sánchez', body: 'Hola Patricia! El plan Starter es perfecto para agencias pequeñas. ¿Cuántos usuarios necesitas?', isInbound: false, channel: 'sms', createdAt: '2024-03-22T10:15:00Z' },
      { id: 'msg15', conversationId: 'conv5', fromName: 'Patricia Ramírez', body: 'Somos 3 personas en el equipo', isInbound: true, channel: 'sms', createdAt: '2024-03-22T10:30:00Z' },
      { id: 'msg16', conversationId: 'conv5', fromName: 'Patricia Ramírez', body: '¿Tienen algún descuento para los primeros 3 meses?', isInbound: true, channel: 'sms', createdAt: '2024-03-22T10:45:00Z' },
      { id: 'msg17', conversationId: 'conv5', fromName: 'Patricia Ramírez', body: '¿Me pueden hacer una propuesta?', isInbound: true, channel: 'sms', createdAt: '2024-03-22T11:00:00Z' },
    ],
  },
]

// ─── Revenue data for charts ──────────────────────────────
export const MONTHLY_REVENUE = [
  { month: 'Abr 23', revenue: 145000, target: 150000 },
  { month: 'May 23', revenue: 162000, target: 160000 },
  { month: 'Jun 23', revenue: 178000, target: 170000 },
  { month: 'Jul 23', revenue: 155000, target: 175000 },
  { month: 'Ago 23', revenue: 191000, target: 180000 },
  { month: 'Sep 23', revenue: 208000, target: 185000 },
  { month: 'Oct 23', revenue: 224000, target: 200000 },
  { month: 'Nov 23', revenue: 242000, target: 220000 },
  { month: 'Dic 23', revenue: 285000, target: 250000 },
  { month: 'Ene 24', revenue: 198000, target: 260000 },
  { month: 'Feb 24', revenue: 231000, target: 270000 },
  { month: 'Mar 24', revenue: 267000, target: 280000 },
]

export const CONTACT_GROWTH = [
  { week: 'S1', nuevos: 12 }, { week: 'S2', nuevos: 18 }, { week: 'S3', nuevos: 8 },
  { week: 'S4', nuevos: 24 }, { week: 'S5', nuevos: 15 }, { week: 'S6', nuevos: 31 },
  { week: 'S7', nuevos: 22 }, { week: 'S8', nuevos: 19 }, { week: 'S9', nuevos: 28 },
  { week: 'S10', nuevos: 35 }, { week: 'S11', nuevos: 27 }, { week: 'S12', nuevos: 42 },
]
