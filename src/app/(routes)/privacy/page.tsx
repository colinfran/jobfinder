import Link from "next/link"
import React, { FC } from "react"

const Page: FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto grow px-4 py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Last updated: February 27, 2026
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            JobFinder collects only the information needed to authenticate users, provide the
            dashboard, and operate the service.
          </p>

          <h3 className="mt-4 text-xl font-semibold">1.1 Account Information</h3>
          <p>
            When you sign in with Google or GitHub, we receive profile information from that
            provider.
          </p>
          <ul className="list-disc pl-6">
            <li>Name and profile image (if provided by the provider)</li>
            <li>Email address</li>
            <li>Provider account identifier</li>
          </ul>

          <h3 className="mt-4 text-xl font-semibold">1.2 App Data You Create</h3>
          <p>
            We store your app-specific data, including job status actions (such as applied and not
            relevant) and your last selected dashboard topic.
          </p>

          <h3 className="mt-4 text-xl font-semibold">1.3 Technical and Usage Data</h3>
          <p>
            We may collect operational telemetry such as page usage, request logs, and diagnostics
            to monitor reliability and improve performance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. How We Use Information</h2>
          <ul className="list-disc pl-6">
            <li>Authenticate users and maintain sessions</li>
            <li>Display and personalize the dashboard experience</li>
            <li>Store your job tracking actions and preferences</li>
            <li>Maintain, secure, and improve the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Data Sharing and Third Parties</h2>
          <p>We do not sell your personal information.</p>
          <p className="mt-3">We rely on third-party services to operate JobFinder, including:</p>
          <ul className="list-disc pl-6">
            <li>Authentication providers (Google and GitHub)</li>
            <li>Infrastructure and hosting providers</li>
            <li>Search/data providers used to discover job listings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Data Security</h2>
          <p>
            We take reasonable measures to protect your personal information from unauthorized
            access or disclosure. However, no method of transmission over the internet or electronic
            storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Retention and Deletion</h2>
          <p>
            We retain account and app data while your account is active or as needed for legitimate
            operational or legal purposes. You may request account or data deletion by contacting
            us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, or delete
            certain personal information. Contact us to make a request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">7. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will post updates on this page and
            revise the date above.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">8. Contact Us</h2>
          <p>
            {"If you have questions about this Privacy Policy or your data, contact us at "}
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
