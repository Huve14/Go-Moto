export interface Plan {
  id: string
  name: string
  description: string
  price_weekly: number
  price_monthly: number
  deposit: number
  features: string[]
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for new riders getting started with delivery',
    price_weekly: 450,
    price_monthly: 1800,
    deposit: 2500,
    features: [
      'Entry-level bike or scooter',
      'Basic maintenance included',
      'Roadside assistance',
      'Flexible weekly payments',
      'No credit check required',
      'Swap bike if unavailable',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious riders maximizing their earnings',
    price_weekly: 650,
    price_monthly: 2600,
    deposit: 3500,
    features: [
      'Premium bike selection',
      'Full maintenance included',
      'Priority roadside assistance',
      'Delivery box included',
      'Insurance coverage option',
      'Swap bike anytime',
      'Dedicated support line',
    ],
    popular: true,
  },
  {
    id: 'fleet',
    name: 'Fleet',
    description: 'Bulk pricing for businesses running multiple riders',
    price_weekly: 550,
    price_monthly: 2200,
    deposit: 2000,
    features: [
      'Volume discounts',
      'Mixed fleet options',
      'Full maintenance included',
      'Fleet management dashboard',
      'Dedicated account manager',
      'Priority bike replacements',
      'Custom branding options',
      'Consolidated billing',
    ],
  },
]

export const RIDER_TAGS = [
  { value: 'best_for_ubereats', label: 'Best for UberEats' },
  { value: 'best_for_mrd', label: 'Best for Mr D' },
  { value: 'best_for_bolt', label: 'Best for Bolt Food' },
  { value: 'best_for_sixty60', label: 'Best for Sixty60' },
  { value: 'fuel_efficient', label: 'Fuel Efficient' },
  { value: 'low_maintenance', label: 'Low Maintenance' },
  { value: 'delivery_box_included', label: 'Delivery Box Included' },
  { value: 'commuter_friendly', label: 'Commuter Friendly' },
  { value: 'beginner_friendly', label: 'Beginner Friendly' },
] as const

export const BIKE_TYPES = [
  { value: 'scooter', label: 'Scooter' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'electric', label: 'Electric' },
] as const

export const BIKE_BRANDS = [
  { value: 'honda', label: 'Honda' },
  { value: 'yamaha', label: 'Yamaha' },
  { value: 'suzuki', label: 'Suzuki' },
  { value: 'sym', label: 'SYM' },
  { value: 'kymco', label: 'Kymco' },
  { value: 'bigboy', label: 'Big Boy' },
  { value: 'gomoto', label: 'Go-Moto' },
  { value: 'jonway', label: 'Jonway' },
  { value: 'other', label: 'Other' },
] as const

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
] as const

export const LISTING_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
] as const

export const APPLICATION_STATUSES = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'docs_required', label: 'Documents Required' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'scheduled_pickup', label: 'Scheduled Pickup' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
] as const

export const SERVICE_TYPES = [
  { value: 'minor_service', label: 'Minor Service', description: 'Oil change, filter check, basic inspection' },
  { value: 'major_service', label: 'Major Service', description: 'Full service with parts replacement' },
  { value: 'tyres', label: 'Tyres', description: 'Tyre replacement or repair' },
  { value: 'repairs', label: 'Repairs', description: 'General repairs and fixes' },
  { value: 'inspection', label: 'Inspection', description: 'Pre-purchase or roadworthy inspection' },
] as const

export const PLATFORMS = [
  { value: 'uber_eats', label: 'Uber Eats' },
  { value: 'mr_d', label: 'Mr D Food' },
  { value: 'bolt_food', label: 'Bolt Food' },
  { value: 'sixty60', label: 'Sixty60' },
  { value: 'multiple', label: 'Multiple Platforms' },
  { value: 'none', label: 'Not a delivery rider' },
] as const

export const INCOME_RANGES = [
  { value: 'under_5000', label: 'Under R5,000/month' },
  { value: '5000_10000', label: 'R5,000 - R10,000/month' },
  { value: '10000_15000', label: 'R10,000 - R15,000/month' },
  { value: '15000_20000', label: 'R15,000 - R20,000/month' },
  { value: 'over_20000', label: 'Over R20,000/month' },
] as const

export const LOCATIONS = [
  { value: 'johannesburg', label: 'Johannesburg' },
  { value: 'cape-town', label: 'Cape Town' },
  { value: 'durban', label: 'Durban' },
  { value: 'pretoria', label: 'Pretoria' },
  { value: 'port-elizabeth', label: 'Port Elizabeth' },
  { value: 'bloemfontein', label: 'Bloemfontein' },
  { value: 'east-london', label: 'East London' },
  { value: 'polokwane', label: 'Polokwane' },
  { value: 'nelspruit', label: 'Nelspruit' },
  { value: 'kimberley', label: 'Kimberley' },
] as const

export const DOCUMENT_TYPES = [
  { value: 'id_document', label: 'ID Document' },
  { value: 'proof_of_address', label: 'Proof of Address' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'platform_screenshot', label: 'Platform Earnings Screenshot' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'other', label: 'Other Document' },
] as const

export const APPLICATION_REQUIRED_DOCUMENTS = [
  { type: 'id_document', label: 'ID Document', required: true },
  { type: 'proof_of_address', label: 'Proof of Address', required: true },
  { type: 'bank_statement', label: 'Bank Statement (3 months)', required: false },
  { type: 'platform_screenshot', label: 'Platform Earnings Screenshot', required: false },
] as const
