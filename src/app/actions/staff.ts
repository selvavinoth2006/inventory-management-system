'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createStaffAction(email: string, pass: string) {
  try {
    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pass,
      email_confirm: true // Auto confirm
    })

    if (authError) throw authError

    // Note: The trigger handle_new_user() in SQL will automatically 
    // create the profile entry with role 'staff'.
    
    revalidatePath('/staff')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteStaffAction(id: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) throw error
    
    revalidatePath('/staff')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
