export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          type: string
          brand: string
          model: string
          year: number
          engine_cc: number
          mileage: number | null
          condition: string
          price_cash: number
          price_weekly: number
          price_monthly: number
          deposit: number
          location: string
          status: string
          rider_tags: string[] | null
          featured: boolean
          specs: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          type: string
          brand: string
          model: string
          year: number
          engine_cc: number
          mileage?: number | null
          condition: string
          price_cash: number
          price_weekly: number
          price_monthly: number
          deposit: number
          location: string
          status?: string
          rider_tags?: string[] | null
          featured?: boolean
          specs?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          type?: string
          brand?: string
          model?: string
          year?: number
          engine_cc?: number
          mileage?: number | null
          condition?: string
          price_cash?: number
          price_weekly?: number
          price_monthly?: number
          deposit?: number
          location?: string
          status?: string
          rider_tags?: string[] | null
          featured?: boolean
          specs?: Json | null
          created_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          url?: string
          sort_order?: number
          created_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          listing_id?: string
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string
          location: string
          platform: string | null
          income_range: string | null
          plan: string
          preferred_listing_id: string | null
          status: string
          internal_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone: string
          location: string
          platform?: string | null
          income_range?: string | null
          plan: string
          preferred_listing_id?: string | null
          status?: string
          internal_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          location?: string
          platform?: string | null
          income_range?: string | null
          plan?: string
          preferred_listing_id?: string | null
          status?: string
          internal_notes?: string | null
          created_at?: string
        }
      }
      application_documents: {
        Row: {
          id: string
          application_id: string
          doc_type: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          doc_type: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          doc_type?: string
          file_url?: string
          created_at?: string
        }
      }
      application_events: {
        Row: {
          id: string
          application_id: string
          from_status: string | null
          to_status: string
          actor_id: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          from_status?: string | null
          to_status: string
          actor_id?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          from_status?: string | null
          to_status?: string
          actor_id?: string | null
          note?: string | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          type: string
          listing_id: string | null
          full_name: string
          email: string
          phone: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          listing_id?: string | null
          full_name: string
          email: string
          phone: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          listing_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          message?: string | null
          created_at?: string
        }
      }
      sell_requests: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          location: string
          expected_price: number | null
          details: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          location: string
          expected_price?: number | null
          details: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          location?: string
          expected_price?: number | null
          details?: Json
          status?: string
          created_at?: string
        }
      }
      sell_request_images: {
        Row: {
          id: string
          sell_request_id: string
          url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          sell_request_id: string
          url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          sell_request_id?: string
          url?: string
          sort_order?: number
          created_at?: string
        }
      }
      service_bookings: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string
          service_type: string
          preferred_date: string
          location: string
          pickup: boolean
          notes: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone: string
          service_type: string
          preferred_date: string
          location: string
          pickup?: boolean
          notes?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          service_type?: string
          preferred_date?: string
          location?: string
          pickup?: boolean
          notes?: string | null
          status?: string
          created_at?: string
        }
      }
      fleet_leads: {
        Row: {
          id: string
          business_name: string
          contact_name: string
          email: string
          phone: string
          fleet_size: number
          locations: string | null
          notes: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          business_name: string
          contact_name: string
          email: string
          phone: string
          fleet_size: number
          locations?: string | null
          notes?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          contact_name?: string
          email?: string
          phone?: string
          fleet_size?: number
          locations?: string | null
          notes?: string | null
          status?: string
          created_at?: string
        }
      }
      cms_content: {
        Row: {
          key: string
          data: Json
          updated_at: string
        }
        Insert: {
          key: string
          data: Json
          updated_at?: string
        }
        Update: {
          key?: string
          data?: Json
          updated_at?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience types
export type Profile = Tables<'profiles'>
export type Listing = Tables<'listings'>
export type ListingImage = Tables<'listing_images'>
export type Favorite = Tables<'favorites'>
export type Application = Tables<'applications'>
export type ApplicationDocument = Tables<'application_documents'>
export type ApplicationEvent = Tables<'application_events'>
export type Lead = Tables<'leads'>
export type SellRequest = Tables<'sell_requests'>
export type SellRequestImage = Tables<'sell_request_images'>
export type ServiceBooking = Tables<'service_bookings'>
export type FleetLead = Tables<'fleet_leads'>
export type CmsContent = Tables<'cms_content'>
export type Setting = Tables<'settings'>

// Extended types with relations
export type ListingWithImages = Listing & {
  listing_images: ListingImage[]
}

export type ApplicationWithDocuments = Application & {
  application_documents: ApplicationDocument[]
  application_events: ApplicationEvent[]
  preferred_listing?: Listing | null
}
