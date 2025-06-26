import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Calendar,
  BarChart3,
  FileText,
  Zap,
  CheckCircle,
  Phone,
  CogIcon,
  SunDim,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="w-full mx-auto py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
              The features you need to efficiently manage your solar business
            </h2>
            <p className="max-w-[900px] mx-auto text-center text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              From initial customer contact to final installation, Our online
              based software will help your solar business become more efficient
              so you can focus on the core of your business.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          <Card className="border-gray-200">
            <CardHeader>
              <Users className="h-10 w-10 text-orange-500" />
              <CardTitle className="text-gray-900">Lead Management</CardTitle>
              <CardDescription className="text-gray-600">
                Capture and nurture solar leads from multiple sources with
                automated follow-ups and lead scoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Multi-channel lead capture
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automated lead qualification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Solar-specific lead scoring
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <Calendar className="h-10 w-10 text-orange-500" />
              <CardTitle className="text-gray-900">Project Tracking</CardTitle>
              <CardDescription className="text-gray-600">
                Monitor every installation from site survey to final inspection
                with milestone tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Installation timeline management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Permit tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Inspection scheduling
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CogIcon className="h-10 w-10 text-orange-500" />
              <CardTitle className="text-gray-900">Manage Equipment</CardTitle>
              <CardDescription className="text-gray-600">
                Keep track of solar equipment and product specifications to
                ensure quality installations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Product Datasheet
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI Data Extraction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Product comparison tools
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <SunDim className="h-10 w-10 text-orange-500" />
              <CardTitle className="text-gray-900">
                Google Soalr API Integration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Seamlessly integrate with Google Solar API to access real-time
                data and insights for your solar projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time solar data access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Solar iriadiance data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Solar configuration modelling
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <Zap className="h-10 w-10 text-orange-500" />
              <CardTitle className="text-gray-900">Automation</CardTitle>
              <CardDescription className="text-gray-600">
                Automate repetitive tasks and data entry to save time and reduce
                errors in your solar business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Parse and extract data from PDFs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Task automation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Custom workflows
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <Phone className="h-10 w-10 text-orange-500" />
              <CardTitle className="text-gray-900">
                Customer Communication
              </CardTitle>
              <CardDescription className="text-gray-600">
                Keep customers informed throughout the installation process with
                automated updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SMS & email notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Seamless team collaboration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Progress updates
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
