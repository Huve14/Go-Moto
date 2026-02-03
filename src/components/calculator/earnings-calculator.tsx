'use client'

import { useState, useMemo } from 'react'
import { Calculator, TrendingUp, Fuel, CreditCard, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, cn } from '@/lib/utils'

interface EarningsCalculatorProps {
  weeklyPayment?: number
  className?: string
}

// Platform earning estimates (R/week based on hours)
const PLATFORM_RATES = {
  uber_eats: { low: 150, high: 200 }, // per hour
  mr_d: { low: 140, high: 190 },
  bolt_food: { low: 145, high: 195 },
  sixty60: { low: 160, high: 210 },
}

// Fuel consumption estimates (L/100km)
const FUEL_EFFICIENCY = {
  scooter: 2.5,
  motorcycle: 3.5,
  electric: 0, // No fuel
}

const FUEL_PRICE_PER_LITER = 23.5 // Current SA fuel price estimate

export function EarningsCalculator({
  weeklyPayment = 500,
  className,
}: EarningsCalculatorProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [platform, setPlatform] = useState<keyof typeof PLATFORM_RATES>('uber_eats')
  const [bikeType, setBikeType] = useState<keyof typeof FUEL_EFFICIENCY>('scooter')
  const [kmPerWeek, setKmPerWeek] = useState(500)

  const calculations = useMemo(() => {
    const rates = PLATFORM_RATES[platform]
    const earningsLow = hoursPerWeek * rates.low
    const earningsHigh = hoursPerWeek * rates.high

    const fuelEfficiency = FUEL_EFFICIENCY[bikeType]
    const fuelCost = bikeType === 'electric' 
      ? kmPerWeek * 0.5 // Electricity cost estimate
      : (kmPerWeek / 100) * fuelEfficiency * FUEL_PRICE_PER_LITER

    const netLow = earningsLow - weeklyPayment - fuelCost
    const netHigh = earningsHigh - weeklyPayment - fuelCost

    return {
      earningsLow,
      earningsHigh,
      fuelCost,
      weeklyPayment,
      netLow,
      netHigh,
    }
  }, [hoursPerWeek, platform, bikeType, kmPerWeek, weeklyPayment])

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Earnings Calculator
        </CardTitle>
        <CardDescription>
          Estimate your weekly earnings and see how much you could take home
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <Label>Delivery Platform</Label>
          <Select
            value={platform}
            onValueChange={(v) => setPlatform(v as keyof typeof PLATFORM_RATES)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uber_eats">Uber Eats</SelectItem>
              <SelectItem value="mr_d">Mr D Food</SelectItem>
              <SelectItem value="bolt_food">Bolt Food</SelectItem>
              <SelectItem value="sixty60">Sixty60</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bike Type */}
        <div className="space-y-2">
          <Label>Bike Type</Label>
          <Select
            value={bikeType}
            onValueChange={(v) => setBikeType(v as keyof typeof FUEL_EFFICIENCY)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scooter">Scooter (Most fuel efficient)</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
              <SelectItem value="electric">Electric (No fuel)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hours Per Week */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Hours per week</Label>
            <span className="text-sm font-medium">{hoursPerWeek} hours</span>
          </div>
          <Slider
            value={[hoursPerWeek]}
            onValueChange={([v]) => setHoursPerWeek(v)}
            min={10}
            max={70}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Part-time</span>
            <span>Full-time</span>
            <span>Hustle mode</span>
          </div>
        </div>

        {/* Distance Per Week */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Estimated km per week</Label>
            <span className="text-sm font-medium">{kmPerWeek} km</span>
          </div>
          <Slider
            value={[kmPerWeek]}
            onValueChange={([v]) => setKmPerWeek(v)}
            min={100}
            max={1500}
            step={50}
          />
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4 border-t">
          {/* Estimated Earnings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Estimated Weekly Earnings</span>
            </div>
            <span className="font-semibold text-green-600">
              {formatCurrency(calculations.earningsLow)} - {formatCurrency(calculations.earningsHigh)}
            </span>
          </div>

          {/* Fuel Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Fuel className="h-4 w-4" />
              <span>Fuel/Electricity Cost</span>
            </div>
            <span className="font-semibold text-red-500">
              - {formatCurrency(calculations.fuelCost)}
            </span>
          </div>

          {/* Weekly Payment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Weekly Bike Payment</span>
            </div>
            <span className="font-semibold text-red-500">
              - {formatCurrency(calculations.weeklyPayment)}
            </span>
          </div>

          {/* Net Earnings */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-semibold">Projected Net Weekly</span>
            </div>
            <span
              className={cn(
                'text-xl font-bold',
                calculations.netLow > 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrency(calculations.netLow)} - {formatCurrency(calculations.netHigh)}
            </span>
          </div>

          {/* Monthly Projection */}
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <p className="text-sm text-center text-muted-foreground">
              Monthly projection: <span className="font-semibold text-foreground">
                {formatCurrency(calculations.netLow * 4)} - {formatCurrency(calculations.netHigh * 4)}
              </span>
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          * Estimates based on average platform rates and may vary. Actual earnings depend on 
          demand, location, and individual performance.
        </p>
      </CardContent>
    </Card>
  )
}
