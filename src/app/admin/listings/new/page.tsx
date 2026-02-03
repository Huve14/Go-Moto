'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X, Plus, Bike, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import AdminSidebar from '../../components/sidebar'

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(2000).max(new Date().getFullYear() + 1),
  type: z.string().min(1, 'Type is required'),
  engine_cc: z.coerce.number().min(50).max(2000),
  mileage: z.coerce.number().min(0).optional(),
  condition: z.string().min(1, 'Condition is required'),
  description: z.string().min(20, 'Description must be at least 20 characters').optional(),
  price_weekly: z.coerce.number().min(0),
  price_monthly: z.coerce.number().min(0),
  price_cash: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['draft', 'published', 'reserved', 'sold']),
  featured: z.boolean().default(false),
  rider_tags: z.array(z.string()).optional(),
})

type ListingFormData = z.infer<typeof listingSchema>

const BRANDS = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'KTM', 'Bajaj', 'TVS', 'Hero', 'Royal Enfield', 'Piaggio', 'Vespa', 'Sym', 'NIU', 'Other']
const TYPES = ['scooter', 'motorcycle', 'electric']
const CONDITIONS = ['new', 'excellent', 'good', 'fair']
const LOCATIONS = ['johannesburg', 'pretoria', 'cape-town', 'durban', 'port-elizabeth', 'bloemfontein']

export default function NewListingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
      mileage: 0,
      deposit: 0,
    },
  })

  const title = watch('title')

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value
    setValue('title', newTitle)
    setValue('slug', generateSlug(newTitle))
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 10)) // Max 10 images
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: ListingFormData) {
    setSaving(true)

    try {
      const supabase = createClient()

      // Upload images first
      const imageUrls: string[] = []
      if (images.length > 0) {
        setUploadingImages(true)
        for (const image of images) {
          const fileName = `${Date.now()}-${image.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(fileName, image)

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('listing-images')
              .getPublicUrl(uploadData.path)
            imageUrls.push(publicUrl)
          }
        }
        setUploadingImages(false)
      }

      // Create listing
      const { data: listing, error } = await supabase
        .from('listings')
        .insert([{
          ...data,
        }] as any)
        .select()
        .single()

      if (error) throw error

      // Create image records
      if (imageUrls.length > 0 && listing) {
        const imageRecords = imageUrls.map((url, index) => ({
          listing_id: (listing as any).id,
          url,
          sort_order: index,
        }))

        await supabase.from('listing_images').insert(imageRecords as any)
      }

      router.push('/admin/listings')
    } catch (error) {
      console.error('Error creating listing:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/listings" />
        
        <main className="flex-1 p-6 lg:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" size="icon" asChild>
                  <Link href="/admin/listings">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-display font-bold">New Listing</h1>
                  <p className="text-muted-foreground">Add a new bike to inventory</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/listings">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploadingImages ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Listing
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Title</Label>
                        <Input
                          {...register('title')}
                          onChange={handleTitleChange}
                          placeholder="e.g., 2023 Honda PCX 125"
                        />
                        {errors.title && (
                          <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>URL Slug</Label>
                        <Input
                          {...register('slug')}
                          placeholder="e.g., 2023-honda-pcx-125"
                        />
                        {errors.slug && (
                          <p className="text-sm text-destructive">{errors.slug.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Brand</Label>
                        <Select onValueChange={(value) => setValue('brand', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.brand && (
                          <p className="text-sm text-destructive">{errors.brand.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Model</Label>
                        <Input {...register('model')} placeholder="e.g., PCX 125" />
                        {errors.model && (
                          <p className="text-sm text-destructive">{errors.model.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" {...register('year')} />
                        {errors.year && (
                          <p className="text-sm text-destructive">{errors.year.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select onValueChange={(value) => setValue('type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPES.map((t) => (
                              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-sm text-destructive">{errors.type.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Engine Size (cc)</Label>
                        <Input type="number" {...register('engine_cc')} />
                        {errors.engine_cc && (
                          <p className="text-sm text-destructive">{errors.engine_cc.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Mileage (km)</Label>
                        <Input type="number" {...register('mileage')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select onValueChange={(value) => setValue('condition', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map((c) => (
                              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      {...register('description')}
                      rows={6}
                      placeholder="Describe the bike, its features, condition, and any other relevant details..."
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-2">{errors.description.message}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                    <CardDescription>Upload up to 10 images. First image will be the primary image.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border overflow-hidden group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {images.length < 10 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            multiple
                          />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Listing Status</Label>
                      <Select 
                        defaultValue="draft"
                        onValueChange={(value: any) => setValue('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        onCheckedChange={(checked) => setValue('featured', !!checked)}
                      />
                      <Label htmlFor="featured" className="cursor-pointer">
                        Featured listing
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Weekly Rental (R)</Label>
                      <Input type="number" {...register('price_weekly')} />
                      {errors.price_weekly && (
                        <p className="text-sm text-destructive">{errors.price_weekly.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Rental (R)</Label>
                      <Input type="number" {...register('price_monthly')} />
                      {errors.price_monthly && (
                        <p className="text-sm text-destructive">{errors.price_monthly.message}</p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Cash Price (R)</Label>
                      <Input type="number" {...register('price_cash')} />
                      {errors.price_cash && (
                        <p className="text-sm text-destructive">{errors.price_cash.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Deposit (R)</Label>
                      <Input type="number" {...register('deposit')} />
                      {errors.deposit && (
                        <p className="text-sm text-destructive">{errors.deposit.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select onValueChange={(value) => setValue('location', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc} className="capitalize">
                            {loc.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location && (
                      <p className="text-sm text-destructive mt-2">{errors.location.message}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
