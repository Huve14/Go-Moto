import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Bike } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { Button } from '@/components/ui/button'

async function getUserFavorites(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('favorites')
    .select('*, listings(*, listing_images(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data || []) as any[]
}

export default async function FavoritesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const favorites = await getUserFavorites(user.id)

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Saved Bikes</h1>
              <p className="text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? 'bike' : 'bikes'} saved
              </p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No saved bikes yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Browse our inventory and click the heart icon to save bikes you're interested in.
            </p>
            <Button asChild>
              <Link href="/inventory">
                <Bike className="h-4 w-4 mr-2" />
                Browse Bikes
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <ListingCard
                key={fav.id}
                listing={fav.listings}
                isFavorited={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
