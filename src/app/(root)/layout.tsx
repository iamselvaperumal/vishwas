export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className='relative flex min-h-screen flex-col'>
        <div className='flex-1 flex-grow'>{children}</div>
      </main>
    </>
  )
}
