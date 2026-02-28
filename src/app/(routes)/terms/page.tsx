import Link from "next/link"
import React, { FC } from "react"

const Page: FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto grow px-4 py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Terms and Conditions</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Last updated: February 27, 2026
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            {`By accessing and using JobFinder (the "App"), you agree to comply with and be bound by
            these terms and conditions. If you do not agree, please do not use the App.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. Account and Sign-In</h2>
          <p>
            {`To use JobFinder, you must sign in with a supported provider account (currently Google
            or GitHub). You are responsible for
            maintaining the confidentiality of your account credentials and for all activities
            under your account.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Service Description</h2>
          <p>
            JobFinder is a personal job discovery and tracking tool. It aggregates public job
            listings from external sources and lets users track statuses like applied and not
            relevant.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Job Listings and External Links</h2>
          <p>
            {`JobFinder collects job listings using Serper and displays them to users. We strive
            to provide accurate and up-to-date information, but we do not guarantee that all
            job listings are complete, current, or free of errors.`}
          </p>
          <p className="mt-3">
            Listings and application links are controlled by third parties and may change or become
            unavailable at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Acceptable Use</h2>
          <p>You agree not to misuse the service, including by:</p>
          <ul className="list-disc pl-6">
            <li>Attempting unauthorized access to accounts, APIs, or infrastructure</li>
            <li>Interfering with app availability, reliability, or security</li>
            <li>Using the service in violation of applicable law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Your Data and Account Actions</h2>
          <p>
            Status updates and preferences you set in JobFinder are stored to provide your dashboard
            experience. You may contact us to request deletion of your account data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">7. Disclaimers</h2>
          <p>
            {`The App is provided "as-is" without any warranties, express or implied, including
            but not limited to accuracy, reliability, or suitability for a particular purpose.
            JobFinder does not guarantee employment or interview opportunities from listed jobs.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">8. Limitation of Liability</h2>
          <p>
            {`In no event shall JobFinder be liable for any damages, including loss of data,
            profits, or business interruption, arising from your use of the App or reliance on
            job listings, even if we have been advised of the possibility of such damages.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">9. Suspension or Termination</h2>
          <p>
            We may suspend or terminate access to JobFinder at any time if needed for security,
            maintenance, legal compliance, or Terms violations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">10. Changes to the Service or Terms</h2>
          <p>
            {`JobFinder may update, modify, or remove features at any time. We may also update these
            Terms by posting a revised version on this page.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">11. Governing Law</h2>
          <p>
            {`These terms are governed by the laws of the State of California, USA. Any disputes
            shall be resolved under the exclusive jurisdiction of the courts located in San
            Francisco, California.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">12. Contact</h2>
          <p>
            Questions about these Terms can be sent to{" "}
            <a className="underline" href="mailto:hello@colinfran.com?subject=JobFinder%20Support">
              hello@colinfran.com
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="p-4">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} JobFinder. All rights reserved.</p>
          <Link className="underline" href="/">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default Page
