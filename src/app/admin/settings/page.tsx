'use client'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, Save, Building2, Mail, Phone, MapPin, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
import AdminSidebar from '../components/sidebar'

interface SiteSettings {
  id?: string
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  contact_whatsapp: string
  address: string
  city: string
  operating_hours: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  tiktok_url: string
  meta_title: string
  meta_description: string
}

const defaultSettings: SiteSettings = {
  site_name: 'Go-Moto',
  site_description: 'The Operating System for Bike Ownership & Earning',
  contact_email: 'hello@gomoto.co.za',
  contact_phone: '+27 11 123 4567',
  contact_whatsapp: '+27 82 123 4567',
  address: '123 Main Street, Sandton',
  city: 'Johannesburg',
  operating_hours: 'Mon-Fri: 8am-5pm, Sat: 9am-1pm',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  tiktok_url: '',
  meta_title: 'Go-Moto | Premium Bike Rental & Sales in South Africa',
  meta_description: 'Rent or buy quality motorcycles and scooters for gig economy work, personal use, or fleet operations. Flexible plans, full support, and competitive pricing.',
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if ((profile as any)?.role !== 'admin') {
        router.push('/account')
        return
      }

      // Get settings
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'site')
        .single()

      if (data) {
        setSettings({ ...defaultSettings, ...((data as any).value || {}) })
      }
      setLoading(false)
    }

    loadSettings()
  }, [router])

  async function saveSettings() {
    setSaving(true)
    setMessage('')

    const supabase = createClient()
    
    // Upsert settings
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'site',
        value: settings,
        updated_at: new Date().toISOString()
      } as any)
    
    if (error) {
      setMessage('Error saving settings')
    } else {
      setMessage('Settings saved successfully')
    }

    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  function updateSetting(key: keyof SiteSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/settings" />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your site configuration
              </p>
            </div>
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {message}
            </div>
          )}

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Basic site information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Site Name</Label>
                      <Input
                        value={settings.site_name}
                        onChange={(e) => updateSetting('site_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Operating Hours</Label>
                      <Input
                        value={settings.operating_hours}
                        onChange={(e) => updateSetting('operating_hours', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Site Description</Label>
                    <Textarea
                      value={settings.site_description}
                      onChange={(e) => updateSetting('site_description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>
                    How customers can reach you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => updateSetting('contact_email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={settings.contact_phone}
                        onChange={(e) => updateSetting('contact_phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input
                        value={settings.contact_whatsapp}
                        onChange={(e) => updateSetting('contact_whatsapp', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={settings.city}
                        onChange={(e) => updateSetting('city', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={settings.address}
                      onChange={(e) => updateSetting('address', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Media Links
                  </CardTitle>
                  <CardDescription>
                    Connect your social profiles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Facebook URL</Label>
                      <Input
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={settings.facebook_url}
                        onChange={(e) => updateSetting('facebook_url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram URL</Label>
                      <Input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={settings.instagram_url}
                        onChange={(e) => updateSetting('instagram_url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter URL</Label>
                      <Input
                        type="url"
                        placeholder="https://twitter.com/..."
                        value={settings.twitter_url}
                        onChange={(e) => updateSetting('twitter_url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>TikTok URL</Label>
                      <Input
                        type="url"
                        placeholder="https://tiktok.com/@..."
                        value={settings.tiktok_url}
                        onChange={(e) => updateSetting('tiktok_url', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    SEO Settings
                  </CardTitle>
                  <CardDescription>
                    Search engine optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input
                      value={settings.meta_title}
                      onChange={(e) => updateSetting('meta_title', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 50-60 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={settings.meta_description}
                      onChange={(e) => updateSetting('meta_description', e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 150-160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
