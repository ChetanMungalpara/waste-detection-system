import './globals.css';

export const metadata = {
  title: 'EcoSort | Circular Economy Dashboard',
  description: 'AI-Driven Smart Waste Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}