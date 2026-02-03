'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { BIKE_TYPES, BIKE_BRANDS, CONDITIONS, RIDER_TAGS, LOCATIONS } from '@/types/constants'
import { formatCurrency } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

// Sheet component for mobile filters
function Sheet_({
  children,
  ...props
}: React.ComponentProps<typeof Sheet>) {
  return <Sheet {...props}>{children}</Sheet>
}

const SheetContent_ = SheetContent
const SheetHeader_ = SheetHeader
const SheetTitle_ = SheetTitle
const SheetDescription_ = SheetDescription
const SheetTrigger_ = SheetTrigger

export function ListingFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 when filters change
      if (name !== 'page') {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`, { scroll: false })
  }

  const toggleTag = (tag: string) => {
    const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateFilter('tags', newTags.join(','))
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  // Get current filter values
  const currentType = searchParams.get('type') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentCondition = searchParams.get('condition') || ''
  const currentLocation = searchParams.get('location') || ''
  const currentSort = searchParams.get('sort') || 'newest'
  const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const currentMinPrice = parseInt(searchParams.get('minPrice') || '0')
  const currentMaxPrice = parseInt(searchParams.get('maxPrice') || '5000')

  const hasActiveFilters = currentType || currentBrand || currentCondition || 
    currentLocation || currentTags.length > 0 || currentMinPrice > 0 || currentMaxPrice < 5000

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={currentType || 'all'} onValueChange={(v) => updateFilter('type', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {BIKE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select value={currentBrand || 'all'} onValueChange={(v) => updateFilter('brand', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {BIKE_BRANDS.map((brand) => (
              <SelectItem key={brand.value} value={brand.value}>
                {brand.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label>Condition</Label>
        <Select value={currentCondition || 'all'} onValueChange={(v) => updateFilter('condition', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            {CONDITIONS.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={currentLocation || 'all'} onValueChange={(v) => updateFilter('location', v === 'all' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATIONS.map((location) => (
              <SelectItem key={location.value} value={location.value}>
                {location.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Weekly Price Range</Label>
        <Slider
          min={0}
          max={5000}
          step={100}
          value={[currentMinPrice, currentMaxPrice]}
          onValueChange={([min, max]) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('minPrice', min.toString())
            params.set('maxPrice', max.toString())
            params.delete('page')
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
          }}
          className="py-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(currentMinPrice)}</span>
          <span>{formatCurrency(currentMaxPrice)}</span>
        </div>
      </div>

      {/* Rider Tags */}
      <div className="space-y-3">
        <Label>Rider Tags</Label>
        <div className="space-y-2">
          {RIDER_TAGS.map((tag) => (
            <div key={tag.value} className="flex items-center space-x-2">
              <Checkbox
                id={tag.value}
                checked={currentTags.includes(tag.value)}
                onCheckedChange={() => toggleTag(tag.value)}
              />
              <Label
                htmlFor={tag.value}
                className="text-sm font-normal cursor-pointer"
              >
                {tag.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Top Bar - Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bikes..."
            className="pl-10"
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => {
              const value = e.target.value
              // Debounce search
              const timeout = setTimeout(() => {
                updateFilter('search', value)
              }, 300)
              return () => clearTimeout(timeout)
            }}
          />
        </div>

        {/* Sort */}
        <Select value={currentSort} onValueChange={(v) => updateFilter('sort', v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile Filter Button */}
        <Sheet_>
          <SheetTrigger_ asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </SheetTrigger_>
          <SheetContent_ side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader_>
              <SheetTitle_>Filters</SheetTitle_>
              <SheetDescription_>
                Narrow down your search
              </SheetDescription_>
            </SheetHeader_>
            <div className="mt-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <FilterContent />
            </div>
          </SheetContent_>
        </Sheet_>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentType && (
            <Badge variant="secondary" className="gap-1">
              {BIKE_TYPES.find((t) => t.value === currentType)?.label}
              <button onClick={() => updateFilter('type', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentBrand && (
            <Badge variant="secondary" className="gap-1">
              {BIKE_BRANDS.find((b) => b.value === currentBrand)?.label}
              <button onClick={() => updateFilter('brand', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentCondition && (
            <Badge variant="secondary" className="gap-1">
              {CONDITIONS.find((c) => c.value === currentCondition)?.label}
              <button onClick={() => updateFilter('condition', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentLocation && (
            <Badge variant="secondary" className="gap-1">
              {currentLocation}
              <button onClick={() => updateFilter('location', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {RIDER_TAGS.find((t) => t.value === tag)?.label}
              <button onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Desktop Sidebar Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </div>
  )
}
