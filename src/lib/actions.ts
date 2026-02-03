'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates, notifyAdmin } from '@/lib/email'
import { z } from 'zod'

// =====================================================
// APPLICATION ACTIONS
// =====================================================

const applicationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Please select a location'),
  platform: z.string().optional(),
  income_range: z.string().optional(),
  plan: z.enum(['starter', 'pro', 'fleet']),
  preferred_listing_id: z.string().uuid().optional().nullable(),
  consent: z.boolean().refine((v) => v === true, 'You must accept the terms'),
})

export async function submitApplication(formData: FormData) {
  const supabase = createClient()

  // Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const rawData = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    platform: formData.get('platform') || null,
    income_range: formData.get('income_range') || null,
    plan: formData.get('plan'),
    preferred_listing_id: formData.get('preferred_listing_id') || null,
    consent: formData.get('consent') === 'true',
  }

  const validationResult = applicationSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message,
    }
  }

  const data = validationResult.data

  // Insert application
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      user_id: user?.id || null,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      platform: data.platform,
      income_range: data.income_range,
      plan: data.plan,
      preferred_listing_id: data.preferred_listing_id,
      status: 'submitted',
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Application submission error:', error)
    return { success: false, error: 'Failed to submit application. Please try again.' }
  }

  const appData = application as any

  // Create initial event
  await supabase.from('application_events').insert({
    application_id: appData.id,
    from_status: null,
    to_status: 'submitted',
    actor_id: user?.id || null,
    note: 'Application submitted',
  } as any)

  // Send confirmation email
  const template = emailTemplates.applicationSubmitted({
    fullName: data.full_name,
    plan: data.plan.charAt(0).toUpperCase() + data.plan.slice(1),
    applicationId: appData.id,
  })
  await sendEmail({
    to: data.email,
    ...template,
  })

  // Notify admin
  await notifyAdmin('Application', {
    id: appData.id,
    name: data.full_name,
    email: data.email,
    phone: data.phone,
    plan: data.plan,
  })

  return { success: true, applicationId: appData.id }
}

export async function uploadApplicationDocument(
  applicationId: string,
  docType: string,
  file: File
) {
  const supabase = createClient()
  const adminClient = createAdminClient()

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const filename = `${applicationId}/${docType}-${Date.now()}.${ext}`

  // Upload to storage using admin client (bypasses RLS)
  const { error: uploadError } = await adminClient.storage
    .from('application-documents')
    .upload(filename, file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { success: false, error: 'Failed to upload document' }
  }

  // Get the URL
  const { data: { publicUrl } } = adminClient.storage
    .from('application-documents')
    .getPublicUrl(filename)

  // Save document record
  const { error: dbError } = await adminClient
    .from('application_documents')
    .insert({
      application_id: applicationId,
      doc_type: docType,
      file_url: publicUrl,
    } as any)

  if (dbError) {
    console.error('DB error:', dbError)
    return { success: false, error: 'Failed to save document record' }
  }

  return { success: true, url: publicUrl }
}

// =====================================================
// LEAD ACTIONS
// =====================================================

const leadSchema = z.object({
  type: z.enum(['viewing', 'contact', 'callback']),
  listing_id: z.string().uuid().optional().nullable(),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().optional(),
})

export async function createLead(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    type: formData.get('type'),
    listing_id: formData.get('listing_id') || null,
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message') || null,
  }

  const validationResult = leadSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message,
    }
  }

  const data = validationResult.data

  const { error } = await supabase.from('leads').insert({
    type: data.type,
    listing_id: data.listing_id,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    message: data.message,
  } as any)

  if (error) {
    console.error('Lead creation error:', error)
    return { success: false, error: 'Failed to submit. Please try again.' }
  }

  // Notify admin
  await notifyAdmin('Lead', {
    type: data.type,
    name: data.full_name,
    email: data.email,
    phone: data.phone,
  })

  return { success: true }
}

// =====================================================
// SELL REQUEST ACTIONS
// =====================================================

const sellRequestSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Please enter a location'),
  expected_price: z.number().optional(),
  brand: z.string().min(1, 'Please enter the brand'),
  model: z.string().min(1, 'Please enter the model'),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.number().optional(),
  condition: z.string(),
  description: z.string().optional(),
})

export async function createSellRequest(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    location: formData.get('location'),
    expected_price: formData.get('expected_price') 
      ? parseInt(formData.get('expected_price') as string) 
      : undefined,
    brand: formData.get('brand'),
    model: formData.get('model'),
    year: parseInt(formData.get('year') as string),
    mileage: formData.get('mileage') 
      ? parseInt(formData.get('mileage') as string) 
      : undefined,
    condition: formData.get('condition'),
    description: formData.get('description') || undefined,
  }

  const validationResult = sellRequestSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message,
    }
  }

  const data = validationResult.data

  const { data: sellRequest, error } = await supabase
    .from('sell_requests')
    .insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      expected_price: data.expected_price,
      details: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        condition: data.condition,
        description: data.description,
      },
      status: 'pending',
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Sell request error:', error)
    return { success: false, error: 'Failed to submit. Please try again.' }
  }

  const reqData = sellRequest as any

  // Notify admin
  await notifyAdmin('Sell Request', {
    id: reqData.id,
    name: data.full_name,
    bike: `${data.year} ${data.brand} ${data.model}`,
    price: data.expected_price,
  })

  return { success: true, sellRequestId: reqData.id }
}

// =====================================================
// SERVICE BOOKING ACTIONS
// =====================================================

const serviceBookingSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  service_type: z.enum(['minor_service', 'major_service', 'tyres', 'repairs', 'inspection']),
  preferred_date: z.string().min(1, 'Please select a date'),
  location: z.string().min(2, 'Please enter a location'),
  pickup: z.boolean(),
  notes: z.string().optional(),
})

export async function createServiceBooking(formData: FormData) {
  const supabase = createClient()

  // Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  const rawData = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    service_type: formData.get('service_type'),
    preferred_date: formData.get('preferred_date'),
    location: formData.get('location'),
    pickup: formData.get('pickup') === 'true',
    notes: formData.get('notes') || undefined,
  }

  const validationResult = serviceBookingSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message,
    }
  }

  const data = validationResult.data

  const { data: booking, error } = await supabase
    .from('service_bookings')
    .insert({
      user_id: user?.id || null,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      service_type: data.service_type,
      preferred_date: data.preferred_date,
      location: data.location,
      pickup: data.pickup,
      notes: data.notes,
      status: 'pending',
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Service booking error:', error)
    return { success: false, error: 'Failed to book service. Please try again.' }
  }

  const bookingData = booking as any

  // Send confirmation email
  const template = emailTemplates.serviceBookingConfirmation({
    fullName: data.full_name,
    serviceType: data.service_type.replace('_', ' ').toUpperCase(),
    preferredDate: data.preferred_date,
    location: data.location,
  })
  await sendEmail({
    to: data.email,
    ...template,
  })

  // Notify admin
  await notifyAdmin('Service Booking', {
    id: bookingData.id,
    name: data.full_name,
    service: data.service_type,
    date: data.preferred_date,
  })

  return { success: true, bookingId: bookingData.id }
}

// =====================================================
// FLEET LEAD ACTIONS
// =====================================================

const fleetLeadSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  fleet_size: z.number().min(1, 'Please enter the number of bikes needed'),
  locations: z.string().optional(),
  notes: z.string().optional(),
})

export async function createFleetLead(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    business_name: formData.get('business_name'),
    contact_name: formData.get('contact_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    fleet_size: parseInt(formData.get('fleet_size') as string),
    locations: formData.get('locations') || undefined,
    notes: formData.get('notes') || undefined,
  }

  const validationResult = fleetLeadSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message,
    }
  }

  const data = validationResult.data

  const { error } = await supabase.from('fleet_leads').insert({
    business_name: data.business_name,
    contact_name: data.contact_name,
    email: data.email,
    phone: data.phone,
    fleet_size: data.fleet_size,
    locations: data.locations,
    notes: data.notes,
    status: 'new',
  } as any)

  if (error) {
    console.error('Fleet lead error:', error)
    return { success: false, error: 'Failed to submit. Please try again.' }
  }

  // Notify admin
  await notifyAdmin('Fleet Lead', {
    business: data.business_name,
    contact: data.contact_name,
    email: data.email,
    fleet_size: data.fleet_size,
  })

  return { success: true }
}

// =====================================================
// FAVORITES ACTIONS
// =====================================================

export async function toggleFavorite(listingId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Please log in to save favorites' }
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)

    if (error) {
      return { success: false, error: 'Failed to remove favorite' }
    }
    
    revalidatePath('/account/favorites')
    return { success: true, favorited: false }
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        listing_id: listingId,
      } as any)

    if (error) {
      return { success: false, error: 'Failed to add favorite' }
    }

    revalidatePath('/account/favorites')
    return { success: true, favorited: true }
  }
}
