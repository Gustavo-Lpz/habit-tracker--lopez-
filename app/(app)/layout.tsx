import NavBar from '@/components/NavBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="bg-gray-50 min-h-screen pt-16">
        <div className="max-w-5xl mx-auto px-16 py-8">
          {children}
        </div>
      </main>
    </>
  )
}
