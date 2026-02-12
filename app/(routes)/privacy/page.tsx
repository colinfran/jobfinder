import Link from "next/link"
import React, { FC } from "react"

const Page: FC = async () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto grow px-4 py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            At JobFinder, we prioritize your privacy. We collect only the information necessary to
            provide our service and improve your experience. This includes:
          </p>

          <h3 className="mt-4 text-xl font-semibold">1.1 Account Information</h3>
          <p>
            When you sign in with GitHub, we collect information from your GitHub account including:
          </p>
          <ul className="list-disc pl-6">
            <li>GitHub username</li>
            <li>GitHub ID</li>
            <li>Profile image</li>
            <li>Email address (if available)</li>
          </ul>
          <p>
            This information is used to create and manage your JobFinder account and provide a
            personalized experience.
          </p>

          <h3 className="mt-4 text-xl font-semibold">1.2 Job Application Tracking</h3>
          <p>
            JobFinder allows you to mark whether you have applied to a job or not. This information
            is stored for your personal tracking only and is not shared with third parties without
            your consent.
          </p>

          <h3 className="mt-4 text-xl font-semibold">1.3 Website Usage Data</h3>
          <p>
            We may collect anonymous usage data such as page views, session duration, and
            interactions to analyze and improve the performance of the App. This data does not
            identify individual users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6">
            <li>To provide and maintain your account</li>
            <li>To display job listings and allow application tracking</li>
            <li>To improve the App’s performance and features</li>
            <li>To communicate important updates related to your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Data Security</h2>
          <p>
            We take reasonable measures to protect your personal information from unauthorized
            access or disclosure. However, no method of transmission over the internet or electronic
            storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete the information we collect about you. To
            exercise any of these rights, please contact us using the information below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time to reflect changes in our practices
            or for legal or operational reasons. Any updates will be posted on this page with an
            updated revision date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Contact Us</h2>
          <p>
            {
              "If you have questions or concerns about this privacy policy or how your information is handled, please contact us at "
            }
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
