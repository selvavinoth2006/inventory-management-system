import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login | InvCentral',
  description: 'Administrative access for InvCentral Inventory Management System',
}

export default function AdminLoginPage() {
  return (
    <LoginForm 
      type="admin" 
      title="Admin Intelligence" 
      subtitle="Exclusive access for system administrators"
    />
  )
}
