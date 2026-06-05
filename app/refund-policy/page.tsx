import React from "react";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-gray-800">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#153932] mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-[#DE9C3A] uppercase tracking-widest text-sm font-bold">
            The Vintage House Kupwara
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white shadow-xl p-8 md:p-12 border-t-4 border-[#153932]">
          
          {/* SECTION 1: CRITICAL MANAGEMENT PROTECTION CLAUSE */}
          <section className="mb-10 bg-red-50/50 p-6 border-l-4 border-[#153932] rounded-r">
            <h2 className="text-xl font-serif font-semibold mb-4 text-[#153932]">
              1. Management Protection & Right of Refusal
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed text-sm">
              <strong>Disclaimer of Liability:</strong> By executing a booking or reservation with The Vintage House Kupwara, the guest expressly acknowledges and agrees that the hotel, its owners, investors, operators, and management reserve the absolute and unquestionable right to deny, withhold, or refuse refunds under any circumstances.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              While general cancellation timelines are provided in this document as standard operational guidelines, all bookings are strictly subject to management approval. The establishment and its proprietors are <strong>not legally bound, obligated, or mandated</strong> to issue refunds—whether partial or full—for cancellations, late arrivals, no-shows, or unforeseen events affecting the guest. Any and all financial reimbursements or booking credits are granted solely at the discretionary goodwill of the management.
            </p>
          </section>

          {/* SECTION 2: STANDARD CANCELLATION GUIDELINES */}
          <section className="mb-10">
            <h2 className="text-xl font-serif font-semibold mb-4 text-[#153932]">
              2. Standard Cancellation Guidelines
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed text-sm">
              Subject to Section 1, the following standard policies generally apply to room reservations:
            </p>
            <ul className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[#DE9C3A] mt-1">▪</span>
                <div>
                  <strong className="text-gray-900 block mb-1">Free Cancellation Rates:</strong> 
                  Reservations booked under a "Free Cancellation" rate may be eligible for a full refund, provided the cancellation request is formally received within the property's specified timeframe (typically 24 to 72 hours prior to the scheduled 14:00 check-in time).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#DE9C3A] mt-1">▪</span>
                <div>
                  <strong className="text-gray-900 block mb-1">Non-Refundable Rates:</strong> 
                  Rooms secured at a discounted non-refundable rate are strictly final sale. Under no circumstances will cancellations, modifications, or early departures for these bookings be eligible for financial reimbursement.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#DE9C3A] mt-1">▪</span>
                <div>
                  <strong className="text-gray-900 block mb-1">Partial/Penalty Refunds:</strong> 
                  Late cancellations (requests made within 24 hours of the scheduled check-in) or a "no-show" will uniformly result in a penalty fee equivalent to the first night's room rate plus applicable taxes. Any remaining balance from prepaid multi-night stays may be refunded at management's discretion.
                </div>
              </li>
            </ul>
          </section>

          {/* SECTION 3: EXCEPTIONS & FORCE MAJEURE */}
          <section className="mb-10">
            <h2 className="text-xl font-serif font-semibold mb-4 text-[#153932]">
              3. Exceptions & Force Majeure
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              In the event of a documented Force Majeure occurrence (e.g., severe natural disasters, government-mandated travel bans, or civil unrest), management may, upon written request and presentation of verifiable documentation, review refund requests for strict non-refundable rates. This review process does not guarantee a refund.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              If a refund is denied, guests are encouraged to consult their credit card provider—as many premium banking institutions offer built-in travel cancellation protection—or file a claim directly through their independent travel insurance provider.
            </p>
          </section>

          {/* SECTION 4: PROCEDURES FOR REQUESTING A REFUND */}
          <section className="mb-10">
            <h2 className="text-xl font-serif font-semibold mb-4 text-[#153932]">
              4. Procedures for Modification or Cancellation
            </h2>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong className="text-gray-900">Direct Bookings:</strong> Guests who booked directly via The Vintage House Kupwara website, phone line, or email must refer to their confirmation email for exact deadlines. To request a cancellation, guests must contact the property directly via phone or email. 
              </p>
              <p>
                <strong className="text-gray-900">Third-Party Agency Bookings:</strong> If a reservation was secured through an Online Travel Agency (OTA) or third-party platform (including, but not limited to, Expedia, Booking.com, MakeMyTrip, or Agoda), the guest must process the cancellation strictly through that platform's interface. The Vintage House Kupwara cannot modify or refund payments collected by a third-party intermediary.
              </p>
            </div>
          </section>

          {/* SECTION 5: REFUND PROCESSING TIMELINES */}
          <section>
            <h2 className="text-xl font-serif font-semibold mb-4 text-[#153932]">
              5. Refund Processing Timelines
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Upon explicit written approval of a refund by hotel management, the authorized amount will be credited back to the original method of payment. Processing generally requires <strong>7 to 14 business days</strong> to reflect in the guest's account. However, depending on the banking institution, billing cycle, or international clearing times, funds may take up to <strong>30 to 45 days</strong> to appear. The Vintage House Kupwara is not responsible for delays caused by third-party banking networks.
            </p>
          </section>

          <hr className="my-10 border-gray-200" />

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">
              For questions regarding this policy, please contact us prior to finalizing your booking.
            </p>
            <Link href="/contact">
              <button className="bg-[#DE9C3A] text-[#153932] px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#153932] hover:text-white transition-all duration-300">
                Contact Management
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}