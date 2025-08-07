export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-display-lg font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find concerts, workshops, conferences and more happening near you
          </p>
          
          {/* Search Bar - Placeholder for now */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Placeholder */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-display-sm font-bold mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Music', 'Technology', 'Sports', 'Arts'].map((category) => (
              <div
                key={category}
                className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
              >
                <div className="w-6 h-6 rounded bg-primary-500 mb-2" />
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section - Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-display-sm font-bold">Featured Events</h2>
            <a href="/events" className="text-primary-600 hover:text-primary-700 font-medium">
              View All Events →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="aspect-video bg-gray-200 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Event {i} Image</span>
                </div>
                <h3 className="font-semibold mb-2">Sample Event {i}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  This is a placeholder for event description...
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary-600">₹500</span>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
