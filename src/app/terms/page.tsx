import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions - Go-Moto',
  description: 'Go-Moto terms and conditions for bike rental, rent-to-own, and purchase services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold mb-4">Terms & Conditions</h1>
          <p className="text-gray-300">Last updated: January 2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            These Terms and Conditions ("Terms") govern your use of Go-Moto (Pty) Ltd's 
            ("Go-Moto", "we", "us", or "our") website and services, including bike rental, 
            rent-to-own, and purchase arrangements. By using our services, you agree to 
            these Terms.
          </p>

          <h2>2. Definitions</h2>
          <ul>
            <li><strong>"Bike"</strong> means any motorcycle, scooter, or electric bike provided by Go-Moto</li>
            <li><strong>"Customer"</strong> means any individual or entity entering into an agreement with Go-Moto</li>
            <li><strong>"Agreement"</strong> means the specific rental, rent-to-own, or purchase contract</li>
            <li><strong>"Deposit"</strong> means the upfront security payment required</li>
          </ul>

          <h2>3. Eligibility</h2>
          <p>To use our services, you must:</p>
          <ul>
            <li>Be at least 18 years old</li>
            <li>Hold a valid South African ID or permit to work in South Africa</li>
            <li>Hold a valid motorcycle license (Code A, A1, or learner's permit)</li>
            <li>Provide accurate and complete information in your application</li>
            <li>Not be blacklisted or have outstanding judgments against you</li>
          </ul>

          <h2>4. Application Process</h2>
          <p>
            All applications are subject to approval at our sole discretion. We may request 
            additional documentation and conduct verification checks. Approval is not 
            guaranteed, and we reserve the right to decline any application without 
            providing reasons.
          </p>

          <h2>5. Rental Terms</h2>
          <h3>5.1 Payment</h3>
          <ul>
            <li>Payments are due weekly in advance</li>
            <li>Deposits are required before bike collection</li>
            <li>Late payments may incur additional fees</li>
            <li>Failure to pay may result in bike retrieval and contract termination</li>
          </ul>

          <h3>5.2 Use of the Bike</h3>
          <p>You agree to:</p>
          <ul>
            <li>Use the bike only for lawful purposes</li>
            <li>Not modify the bike without written consent</li>
            <li>Keep the bike secure when not in use</li>
            <li>Not allow unauthorized persons to use the bike</li>
            <li>Report any accidents, theft, or damage immediately</li>
            <li>Maintain the bike in good condition</li>
          </ul>

          <h3>5.3 Maintenance</h3>
          <p>
            For rental and rent-to-own plans, routine maintenance is included. This covers 
            oil changes, brake pads, filters, and minor repairs. Major repairs due to 
            accidents, negligence, or misuse are the customer's responsibility.
          </p>

          <h2>6. Rent-to-Own Terms</h2>
          <p>
            Under rent-to-own arrangements, ownership transfers to you only after all 
            payments are complete and the full contract term has been fulfilled. Until 
            then, the bike remains Go-Moto property.
          </p>

          <h2>7. Insurance</h2>
          <p>
            Basic third-party insurance is included with rental plans. Comprehensive 
            insurance is recommended but optional. You are responsible for any insurance 
            excess in case of claims. We strongly recommend additional personal accident 
            cover.
          </p>

          <h2>8. Termination</h2>
          <h3>8.1 By Customer</h3>
          <p>
            You may terminate a rental agreement with 2 weeks' written notice. Early 
            termination of rent-to-own agreements may result in forfeiture of accumulated 
            equity.
          </p>

          <h3>8.2 By Go-Moto</h3>
          <p>We may terminate agreements immediately if you:</p>
          <ul>
            <li>Fail to make payments for more than 14 days</li>
            <li>Breach any term of the agreement</li>
            <li>Provide false or misleading information</li>
            <li>Use the bike for illegal purposes</li>
            <li>Cause damage to the bike through negligence</li>
          </ul>

          <h2>9. Liability</h2>
          <p>
            Go-Moto is not liable for any indirect, incidental, or consequential damages 
            arising from the use of our bikes or services. Our liability is limited to the 
            fees paid by you. You agree to indemnify Go-Moto against any claims arising 
            from your use of the bike.
          </p>

          <h2>10. Recovery of Bikes</h2>
          <p>
            If you breach these Terms or your agreement, we reserve the right to recover 
            the bike immediately without prior notice. Recovery costs will be charged to 
            you. You authorize us to enter any premises where the bike may be located for 
            recovery purposes.
          </p>

          <h2>11. Disputes</h2>
          <p>
            Any disputes shall first be addressed through negotiation. If unresolved, 
            disputes shall be submitted to arbitration in accordance with South African 
            law. The arbitration shall take place in Johannesburg.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Material changes will be communicated 
            to customers. Continued use of our services after changes constitutes 
            acceptance of the modified Terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of South Africa. The 
            Consumer Protection Act and National Credit Act apply where applicable.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions about these Terms, contact us at:
          </p>
          <ul>
            <li>Email: legal@gomoto.co.za</li>
            <li>Phone: +27 12 345 6789</li>
            <li>Address: 123 Commissioner Street, Johannesburg CBD, 2001</li>
          </ul>

          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining 
            provisions shall continue in full force and effect.
          </p>
        </div>
      </div>
    </div>
  )
}
