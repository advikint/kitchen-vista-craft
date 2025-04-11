
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useKitchenStore } from "@/store/kitchenStore";
import { Plus, Settings, FileText, Box, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { setProjectName, resetProject } = useKitchenStore();
  const [newProjectName, setNewProjectName] = useState("New Kitchen Design");

  const handleCreateNewProject = () => {
    resetProject();
    setProjectName(newProjectName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Box className="h-8 w-8 text-kitchen-600" />
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Vista Craft</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              <FileText className="h-5 w-5 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 gap-6">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Get Started</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Project</CardTitle>
                  <CardDescription>Start designing your new kitchen from scratch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="project-name" className="text-sm font-medium">
                        Project Name
                      </label>
                      <Input
                        id="project-name"
                        placeholder="My Kitchen Design"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/editor" onClick={handleCreateNewProject} className="w-full">
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Templates Gallery</CardTitle>
                  <CardDescription>Start with a pre-designed kitchen layout</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {["L-Shaped", "U-Shaped", "Galley", "Island"].map((template) => (
                    <div
                      key={template}
                      className="border rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="aspect-video bg-gray-100 mb-2 rounded flex items-center justify-center">
                        <Box className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">{template}</p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Browse More Templates
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Recent Projects</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <Box className="h-12 w-12 text-gray-300" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Kitchen Design {i}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Last edited 3 days ago</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to="/editor" className="w-full">
                      <Button variant="outline" className="w-full">
                        Open
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              <Card className="border-dashed border-2 flex flex-col items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="text-center text-gray-500">Create New Project</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="bg-gradient-to-r from-kitchen-50 to-kitchen-100 rounded-xl p-8 mt-4">
            <div className="md:flex items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-kitchen-900 mb-2">Ready to design your dream kitchen?</h2>
                <p className="text-kitchen-700 max-w-2xl">
                  Our easy-to-use kitchen designer helps you plan your perfect space with precise measurements
                  and realistic visualizations.
                </p>
              </div>
              <Link to="/editor" onClick={resetProject}>
                <Button size="lg" className="bg-kitchen-600 hover:bg-kitchen-700">
                  Start Designing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2025 Kitchen Vista Craft. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
