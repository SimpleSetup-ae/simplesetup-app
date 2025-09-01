// Temporarily disable auth check for testing
export default async function DashboardPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your companies and formation workflows</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Companies</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-500">Active formations</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
          <p className="text-sm text-gray-500">Pending workflows</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500">Issued licenses</p>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No companies yet. Create your first company to get started!</p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Company
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
