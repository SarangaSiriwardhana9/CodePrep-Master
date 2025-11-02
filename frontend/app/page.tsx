'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Navbar } from '@/components/common';
import { useAuth } from '@/store';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-64px)] flex-col">
        <section className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Master Your Coding Interviews
                </h1>
                <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                  Practice smarter with spaced repetition. Ace your coding interviews with our intelligent learning platform powered by the SM-2 algorithm.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="px-8">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link href="/problems">
                      <Button size="lg" variant="outline" className="px-8">
                        Browse Problems
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="px-8">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="px-8">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why CodePrep Master?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Spaced Repetition</h3>
                <p className="text-muted-foreground">
                  Leverage the proven SM-2 algorithm to optimize your learning and retention
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Curated Problem Sets</h3>
                <p className="text-muted-foreground">
                  Practice with a hand-picked collection of frequently asked interview questions
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Intelligent Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your mastery, streaks, and identify weak areas with detailed analytics
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
