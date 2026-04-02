import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Spinner } from './components/ui'

// Import all pages
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import ContactDetail from './pages/ContactDetail'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Deals from './pages/Deals'
import Tickets from './pages/Tickets'
import Tasks from './pages/Tasks'
import Activities from './pages/Activities'
import EmailMarketing from './pages/EmailMarketing'
import Sequences from './pages/Sequences'
import Reports from './pages/Reports'
import Products from './pages/Products'
import Quotes from './pages/Quotes'
import QuoteDetail from './pages/QuoteDetail'
import Inbox from './pages/Inbox'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactDetail />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<CompanyDetail />} />
        <Route path="deals" element={<Deals />} />
        <Route path="deals/:id" element={<Deals />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<Tickets />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="activities" element={<Activities />} />
        <Route path="email-marketing" element={<EmailMarketing />} />
        <Route path="sequences" element={<Sequences />} />
        <Route path="reports" element={<Reports />} />
        <Route path="products" element={<Products />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="quotes/:id" element={<QuoteDetail />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="inbox/:id" element={<Inbox />} />
        <Route path="settings/*" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
