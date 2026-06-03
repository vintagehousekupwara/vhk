export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-brand-bg pt-32 pb-24 px-6 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-brand-secondary">
        <h1 className="font-serif text-3xl md:text-5xl text-brand-text mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-brand-muted text-sm md:text-base leading-relaxed">
          <p><strong>Effective Date:</strong> June 2026</p>
          
          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, phone number, and physical address when you make a room reservation, place a food order, or communicate with us.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to process your transactions, send you OTPs via EmailJS for secure checkout, provide customer service, and communicate with you about your orders and bookings.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">3. Data Storage and Security</h2>
          <p>Your data is securely stored using Google Firebase infrastructure. While we implement safeguards designed to protect your information, no security system is impenetrable and due to the inherent nature of the Internet, we cannot guarantee that data is absolutely safe from intrusion by others.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">4. Third-Party Services</h2>
          <p>We utilize third-party services including Google Firebase (for database management and authentication) and EmailJS (for automated transactional emails). These services have their own privacy policies governing data handling.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">5. Software Development Vendor</h2>
          <p>This platform was developed by <strong>H Studio</strong>. The developer does not have active access to, does not process, and does not sell or distribute your personal data. All data is managed directly by the administration of The Vintage House Kupwara.</p>

          <h2 className="font-serif text-2xl text-brand-text mt-8 mb-4">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact the hotel administration directly.</p>
        </div>
      </div>
    </main>
  );
}