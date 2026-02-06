import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Go-Moto',
  description: 'Go-Moto privacy policy explaining how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-br from-background to-muted text-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            Go-Moto (Pty) Ltd ("we", "us", or "our") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>We collect personal information that you voluntarily provide to us, including:</p>
          <ul>
            <li>Name, email address, phone number</li>
            <li>South African ID number and date of birth</li>
            <li>Physical address</li>
            <li>Employment information</li>
            <li>Bank account details (for payment purposes)</li>
            <li>Driver's license information</li>
            <li>Photographs and documents you upload</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you access our website, we may automatically collect:</p>
          <ul>
            <li>IP address and browser type</li>
            <li>Device information</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website address</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process rental applications and agreements</li>
            <li>Verify your identity and eligibility</li>
            <li>Communicate with you about your account</li>
            <li>Process payments and manage billing</li>
            <li>Provide customer support</li>
            <li>Schedule and manage bike services</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Comply with legal obligations</li>
            <li>Improve our services</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Service providers who assist our operations</li>
            <li>Payment processors</li>
            <li>Insurance providers</li>
            <li>Government authorities when required by law</li>
            <li>Professional advisors (lawyers, accountants)</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your 
            personal information, including encryption, access controls, and secure servers. 
            However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the 
            purposes outlined in this policy, unless a longer retention period is required 
            by law (such as tax, accounting, or legal requirements).
          </p>

          <h2>7. Your Rights</h2>
          <p>Under the Protection of Personal Information Act (POPIA), you have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Withdraw consent for marketing communications</li>
            <li>Lodge a complaint with the Information Regulator</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>
            Our website uses cookies and similar technologies to enhance your experience. 
            You can control cookies through your browser settings. Essential cookies are 
            required for the website to function properly.
          </p>

          <h2>9. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible 
            for the privacy practices of these external sites.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 18 years of age. We do not 
            knowingly collect personal information from children.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of 
            significant changes by posting the new policy on our website and updating the 
            "Last updated" date.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your rights, 
            please contact our Information Officer:
          </p>
          <ul>
            <li>Email: privacy@gomoto.co.za</li>
            <li>Phone: +27 12 345 6789</li>
            <li>Address: 123 Commissioner Street, Johannesburg CBD, 2001</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
