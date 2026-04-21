import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Worker Portal | InvCentral',
  description: 'Staff member portal for InvCentral Inventory Management System',
}

export default function WorkerLoginPage() {
  return (
    <LoginForm 
      type="worker" 
      title="Staff Portal" 
      subtitle="Operational access for inventory management"
    />
  )
}
