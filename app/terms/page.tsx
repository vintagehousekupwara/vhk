import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-brand-bg pt-32 pb-24 px-6 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-brand-secondary">
        <h1 className="font-serif text-3xl md:text-5xl text-brand-text mb-8">Terms and Conditions</h1>
        
        <div className="space-y-6 text-brand-muted text-sm md:text-base leading-relaxed">
          <p><strong>Last Updated:</strong> June 2026</p>
          
          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using The Vintage House Kupwara website, booking rooms, or ordering food, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">2. Room Bookings and Cancellations</h2>
          <p>All room bookings are subject to availability. The hotel reserves the right to cancel or modify reservations where it appears that a customer has engaged in fraudulent or inappropriate activity.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">3. Food Orders and Delivery</h2>
          <p>Food orders are subject to kitchen capacity and delivery radius limits. The hotel reserves the right to reject orders. Pincodes must strictly match the selected state parameters to ensure delivery capability.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">4. Limitation of Liability</h2>
          <p>The Vintage House Kupwara shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the services and products offered on this site.</p>

          {/* CRITICAL DEVELOPER SAFE HARBOR CLAUSE */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
            <h2 className="font-serif text-xl text-gray-800 mb-3">5. Developer Disclaimer & Safe Harbor</h2>
            <p className="text-gray-600 text-sm">
              This website application was designed, developed, and deployed by an independent third-party agency, <strong>H Studio</strong> (<a href="mailto:officialhaadi81@gmail.com" className="text-brand-primary hover:underline">officialhaadi81@gmail.com</a>). 
              <br /><br />
              By using this website, all users, administrators, and the business owners (The Vintage House Kupwara) explicitly agree that <strong>H Studio</strong> functions solely as a software vendor. H Studio, its developers, and affiliates hold absolutely zero liability for:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600 text-sm">
              <li>Data breaches resulting from administrative negligence or weak passwords.</li>
              <li>Financial transactions, pricing errors, or undelivered goods/services.</li>
              <li>The quality, safety, or legality of the food, rooms, or services provided by the hotel.</li>
              <li>Server downtimes or third-party service failures (e.g., Firebase, EmailJS).</li>
            </ul>
            <p className="text-gray-600 text-sm mt-3">
              All operational, legal, and financial responsibilities rest entirely with the management of The Vintage House Kupwara.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}