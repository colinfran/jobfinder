import Link from "next/link"
import React, { FC } from "react"

const Page: FC = async () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto grow px-4 py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Terms and Conditions</h1>

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
            {`To use JobFinder, you must sign in with a GitHub account. You are responsible for
            maintaining the confidentiality of your account credentials and for all activities
            under your account.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Job Listings</h2>
          <p>
            {`JobFinder collects job listings using Serper and displays them to users. We strive
            to provide accurate and up-to-date information, but we do not guarantee that all
            job listings are complete, current, or free of errors.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Marking Job Applications</h2>
          <p>
            {`Users can mark whether they have applied to a job or not. This information is
            for personal tracking only and will not be shared with third parties without your
            consent.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Disclaimers</h2>
          <p>
            {`The App is provided "as-is" without any warranties, express or implied, including
            but not limited to accuracy, reliability, or suitability for a particular purpose.
            JobFinder does not guarantee employment or interview opportunities from listed jobs.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Limitation of Liability</h2>
          <p>
            {`In no event shall JobFinder be liable for any damages, including loss of data,
            profits, or business interruption, arising from your use of the App or reliance on
            job listings, even if we have been advised of the possibility of such damages.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">7. Changes to Content</h2>
          <p>
            {`JobFinder may update, modify, or remove content and features at any time without
            prior notice. While we strive for accuracy, we do not guarantee that all information
            displayed is current or error-free.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">8. Governing Law</h2>
          <p>
            {`These terms are governed by the laws of the State of California, USA. Any disputes
            shall be resolved under the exclusive jurisdiction of the courts located in San
            Francisco, California.`}
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
