import Link from "next/link";

interface PublicQuotePageProps {
  params: Promise<{ publicQuoteId: string }>;
}

export default async function PublicQuotePage({
  params,
}: PublicQuotePageProps) {
  const { publicQuoteId } = await params;

  // This is a public route - no authentication required
  // In a real app, you'd fetch the quote data using the publicQuoteId

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Solar System Proposal
              </h1>
              <p className="text-gray-600">Quote ID: {publicQuoteId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Valid until:</p>
              <p className="font-medium">April 15, 2024</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-medium">John Smith</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Installation Address</p>
              <p className="font-medium">123 Main Street, Anytown, ST 12345</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quote Date</p>
              <p className="font-medium">March 15, 2024</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">System Type</p>
              <p className="font-medium">Grid-Tied Solar</p>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">12.5 kW</p>
              <p className="text-sm text-gray-600">System Size</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔋</span>
              </div>
              <p className="text-2xl font-bold text-green-600">18,750 kWh</p>
              <p className="text-sm text-gray-600">Annual Production</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">$2,250</p>
              <p className="text-sm text-gray-600">Annual Savings</p>
            </div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Equipment Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Item
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2">
                    <div className="font-medium">
                      SolarTech 450W Solar Panel
                    </div>
                    <div className="text-sm text-gray-500">
                      High-efficiency monocrystalline
                    </div>
                  </td>
                  <td className="px-4 py-2">28</td>
                  <td className="px-4 py-2">$275</td>
                  <td className="px-4 py-2 font-medium">$7,700</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <div className="font-medium">PowerMax 12.5kW Inverter</div>
                    <div className="text-sm text-gray-500">
                      String inverter with monitoring
                    </div>
                  </td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">$2,800</td>
                  <td className="px-4 py-2 font-medium">$2,800</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <div className="font-medium">Roof Mounting System</div>
                    <div className="text-sm text-gray-500">
                      Rails, clamps, and hardware
                    </div>
                  </td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">$1,500</td>
                  <td className="px-4 py-2 font-medium">$1,500</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <div className="font-medium">Installation & Permits</div>
                    <div className="text-sm text-gray-500">
                      Professional installation and permitting
                    </div>
                  </td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">$3,500</td>
                  <td className="px-4 py-2 font-medium">$3,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Investment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>System Cost</span>
              <span>$15,500</span>
            </div>
            <div className="flex justify-between">
              <span>Federal Tax Credit (30%)</span>
              <span className="text-green-600">-$4,650</span>
            </div>
            <div className="flex justify-between">
              <span>State Incentive</span>
              <span className="text-green-600">-$1,000</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Net Investment</span>
              <span>$9,850</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Cost per Watt</span>
              <span>$0.79/W (after incentives)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Accept This Proposal
            </button>
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Request Changes
            </button>
            <button className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">
              Download PDF
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Questions? Contact us at (555) 123-4567 or info@solarcorp.com
          </p>
        </div>
      </main>
    </div>
  );
}
