import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, MessageCircle } from 'lucide-react'

const navigation = {
  bikes: [
    { name: 'Browse Inventory', href: '/inventory' },
    { name: 'Scooters', href: '/inventory?type=scooter' },
    { name: 'Motorcycles', href: '/inventory?type=motorcycle' },
    { name: 'Electric', href: '/inventory?type=electric' },
  ],
  services: [
    { name: 'Pricing', href: '/pricing' },
    { name: 'Rent-to-Own', href: '/apply' },
    { name: 'Book Service', href: '/service' },
    { name: 'Fleet Solutions', href: '/fleet' },
  ],
  sellers: [
    { name: 'List Your Bike', href: '/list-your-bike' },
    { name: 'Seller Pricing', href: '/pricing' },
    { name: 'Seller Dashboard', href: '/seller' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'POPIA Compliance', href: '/popia' },
  ],
  social: [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'YouTube', href: '#', icon: Youtube },
  ],
}

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20Go-Moto%2C%20I%20have%20a%20question`

  return (
    <footer className="bg-card border-t" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      
      {/* WhatsApp CTA Strip */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 text-primary-foreground hover:text-primary-foreground transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-lg font-semibold">
              Chat with us on WhatsApp
            </span>
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">GM</span>
              </div>
              <span className="font-display text-xl font-semibold text-foreground">Go-Moto</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              The operating system for bike ownership & earning. Rent, buy, or rent-to-own 
              bikes and scooters for delivery, commuting, or fleet operations in South Africa.
            </p>
            <p className="text-sm font-semibold text-primary">
              "Ride more. Earn more. Stay on the road."
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Bikes</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.bikes.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Services</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.services.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-3 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">For Sellers</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.sellers.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs leading-5 text-muted-foreground">
              &copy; {new Date().getFullYear()} Go-Moto (Pty) Ltd. All rights reserved.
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              Operating in Johannesburg, Cape Town, Durban, Pretoria & nationwide.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
