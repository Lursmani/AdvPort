import Header from "@/components/Header";

export default function Page() {
  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
        <div className="flex-1">
          <Header />
        </div>
      </div>
    </main>
  );
}
