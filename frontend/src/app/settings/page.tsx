import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Bell, Shield, CreditCard, Globe } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout 
      title="Settings" 
      description="Manage your account preferences and company settings"
    >
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" defaultValue="Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john@sampletech.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+971 50 123 4567" />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  title: 'Email Notifications',
                  description: 'Receive updates about your companies via email',
                  enabled: true
                },
                {
                  title: 'SMS Notifications', 
                  description: 'Get urgent updates via SMS',
                  enabled: false
                },
                {
                  title: 'Push Notifications',
                  description: 'Browser and mobile app notifications',
                  enabled: true
                },
                {
                  title: 'Weekly Summary',
                  description: 'Weekly progress reports via email',
                  enabled: true
                }
              ].map((setting) => (
                <div key={setting.title} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <Button 
                    variant={setting.enabled ? "default" : "outline"}
                    size="sm"
                  >
                    {setting.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Sessions</p>
                  <p className="text-sm text-gray-600">Manage active login sessions</p>
                </div>
                <Button variant="outline" size="sm">
                  View Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Company Preferences
            </CardTitle>
            <CardDescription>
              Default settings for new company formations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="default_free_zone">Default Free Zone</Label>
                <select 
                  id="default_free_zone" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue="IFZA"
                >
                  <option value="IFZA">IFZA - International Free Zone Authority</option>
                  <option value="DIFC">DIFC - Dubai International Financial Centre</option>
                  <option value="ADGM">ADGM - Abu Dhabi Global Market</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default_currency">Default Currency</Label>
                <select 
                  id="default_currency" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue="AED"
                >
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
