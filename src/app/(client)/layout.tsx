import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
if (typeof window !== 'undefined') {
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    console.log('History push:', args);
    return originalPushState.apply(this, args);
  };
  
  window.addEventListener('popstate', (event) => {
    console.log('Popstate:', window.location.pathname);
  });
}
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
}