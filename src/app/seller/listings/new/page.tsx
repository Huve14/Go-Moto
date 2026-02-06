'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0, 'Mileage is required'),
  price: z.number().min(1000, 'Price must be at least R1,000'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  engineSize: z.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(1, 'Location is required'),
})

type ListingFormData = z.infer<typeof listingSchema>

const CATEGORIES = [
  'Sport Bikes',
  'Cruisers',
  'Adventure',
  'Touring',
  'Naked Bikes',
  'Dual Sport',
  'Scooters',
  'Off-Road',
  'Classic/Vintage',
]

const CONDITIONS = [
  'New',
  'Excellent',
  'Good',
  'Fair',
  'Project',
]

const MAKES = [
  'BMW',
  'Honda',
  'Kawasaki',
  'Suzuki',
  'Yamaha',
  'Ducati',
  'Triumph',
  'Harley-Davidson',
  'KTM',
  'Aprilia',
  'Royal Enfield',
  'Indian',
  'Vespa',
  'Other',
]

const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
]

export default function NewListingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [publishStatus, setPublishStatus] = useState<{ canPublish: boolean; reason?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  
  const supabase = createClient()
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      mileage: 0,
      price: 0,
    },
  })
  
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/seller/listings/new')
        return
      }
      
      setUser(user)
      
      // Check subscription (cast to any for new tables)
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(`
          *,
          listing_plans (
            name,
            max_active_listings
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'past_due'])
        .single() as { data: any; error: any }
      
      setSubscription(sub)
      
      if (!sub) {
        setPublishStatus({
          canPublish: false,
          reason: 'You need an active subscription to publish listings.',
        })
      } else {
        // Check listing limit (cast to any for new column)
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .eq('listing_status', 'published') as { count: number | null; error: any }
        
        const limit = sub.listing_plans?.max_active_listings || 0
        
        if ((count || 0) >= limit) {
          setPublishStatus({
            canPublish: false,
            reason: `You've reached your limit of ${limit} active listings. Upgrade your plan to list more bikes.`,
          })
        } else {
          setPublishStatus({ canPublish: true })
        }
      }
      
      setIsLoading(false)
    }
    
    init()
  }, [])
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    
    setImages(prev => [...prev, ...newImages].slice(0, 10))
  }
  
  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }
  
  const onSubmit = async (data: ListingFormData, action: 'draft' | 'publish') => {
    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }
    
    if (action === 'publish' && !publishStatus?.canPublish) {
      setError(publishStatus?.reason || 'Cannot publish')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      // Upload images
      const uploadedImages: { url: string; order: number }[] = []
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const ext = image.file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, image.file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)
        
        uploadedImages.push({ url: publicUrl, order: i })
        setUploadProgress(Math.round(((i + 1) / images.length) * 100))
      }
      
      // Generate slug
      const slug = `${data.make}-${data.model}-${data.year}-${Date.now()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
      
      // Create listing (cast to any for new columns)
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          owner_id: user.id,
          title: data.title,
          slug,
          make: data.make,
          model: data.model,
          year: data.year,
          mileage: data.mileage,
          price: data.price,
          category: data.category,
          condition: data.condition,
          engine_size: data.engineSize,
          fuel_type: data.fuelType,
          transmission: data.transmission,
          color: data.color,
          description: data.description,
          location: data.location,
          images: uploadedImages,
          listing_status: action === 'publish' ? 'pending_review' : 'draft',
        } as any)
        .select()
        .single() as { data: any; error: any }
      
      if (listingError) throw listingError
      
      // Create metrics record (cast to any for new table)
      await supabase.from('listing_metrics').insert({
        listing_id: listing.id,
      } as any)
      
      // Redirect to dashboard
      router.push(`/seller?created=${action === 'publish' ? 'pending' : 'draft'}`)
      
    } catch (err: any) {
      console.error('Create listing error:', err)
      setError(err.message || 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/seller" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-display font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">
            Fill in the details about your motorcycle
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Publish Status Alert */}
          {publishStatus && !publishStatus.canPublish && (
            <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      Cannot Publish
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {publishStatus.reason}
                    </p>
                    <Link href="/list-your-bike">
                      <Button variant="outline" size="sm" className="mt-2">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {error && (
            <Card className="mb-6 border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}
          
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Images */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Upload up to 10 photos. The first photo will be the main image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {i === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">Main</Badge>
                      )}
                    </div>
                  ))}
                  
                  {images.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Basic Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., 2022 BMW R1250GS Adventure - Low Miles"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Make *</Label>
                    <Select onValueChange={(v) => setValue('make', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAKES.map((make) => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.make && (
                      <p className="text-sm text-destructive">{errors.make.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      {...register('model')}
                      placeholder="e.g., R1250GS"
                    />
                    {errors.model && (
                      <p className="text-sm text-destructive">{errors.model.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      {...register('year', { valueAsNumber: true })}
                    />
                    {errors.year && (
                      <p className="text-sm text-destructive">{errors.year.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select onValueChange={(v) => setValue('category', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select onValueChange={(v) => setValue('condition', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-sm text-destructive">{errors.condition.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km) *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      {...register('mileage', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.mileage && (
                      <p className="text-sm text-destructive">{errors.mileage.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (ZAR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineSize">Engine Size (cc)</Label>
                    <Input
                      id="engineSize"
                      type="number"
                      {...register('engineSize', { valueAsNumber: true })}
                      placeholder="e.g., 1254"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select onValueChange={(v) => setValue('transmission', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="semi-auto">Semi-Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register('color')}
                      placeholder="e.g., Racing Red"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select onValueChange={(v) => setValue('location', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((prov) => (
                        <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your motorcycle, its history, any modifications, service history, etc."
                    rows={6}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Submit */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Info className="h-4 w-4" />
                  Listings are reviewed before going live (usually within 24 hours).
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploading images... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save as Draft
                  </Button>
                  
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={isSubmitting || !publishStatus?.canPublish}
                    onClick={handleSubmit((data) => onSubmit(data, 'publish'))}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Submit for Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
