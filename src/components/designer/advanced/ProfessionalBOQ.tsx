import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKitchenStore } from "@/store/kitchenStore";
import { 
  FileText, 
  Download, 
  Calculator, 
  DollarSign, 
  Package, 
  Wrench,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface BOQItem {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  leadTime: string;
  notes?: string;
  status: 'pending' | 'ordered' | 'delivered' | 'installed';
}

interface LaborItem {
  id: string;
  task: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
  skill: 'basic' | 'intermediate' | 'expert';
  phase: string;
}

const ProfessionalBOQ = () => {
  const { cabinets, appliances, walls, doors, windows } = useKitchenStore();
  const [selectedTab, setSelectedTab] = useState("materials");
  const [markupPercentage, setMarkupPercentage] = useState(20);
  const [taxPercentage, setTaxPercentage] = useState(18); // GST in India
  const [contingencyPercentage, setContingencyPercentage] = useState(10);

  // Generate comprehensive BOQ from kitchen design
  const generateComprehensiveBOQ = useMemo(() => {
    const boqItems: BOQItem[] = [];
    const laborItems: LaborItem[] = [];

    // Cabinet materials and hardware
    cabinets.forEach((cabinet, index) => {
      // Cabinet box
      boqItems.push({
        id: `cabinet-box-${index}`,
        category: "Cabinetry",
        subcategory: "Cabinet Boxes",
        description: `${cabinet.type} Cabinet Box`,
        specification: `${cabinet.width}"W x ${cabinet.height}"H x ${cabinet.depth}"D, ${cabinet.material}, ${cabinet.finish}`,
        quantity: 1,
        unit: "EA",
        unitPrice: calculateCabinetPrice(cabinet),
        totalPrice: calculateCabinetPrice(cabinet),
        supplier: "Cabinet Manufacturer",
        leadTime: "4-6 weeks",
        status: 'pending'
      });

      // Cabinet doors/drawers
      if (cabinet.frontType === 'shutter') {
        boqItems.push({
          id: `cabinet-doors-${index}`,
          category: "Cabinetry",
          subcategory: "Doors & Fronts",
          description: "Cabinet Doors",
          specification: `${cabinet.material} doors, ${cabinet.finish} finish`,
          quantity: 2,
          unit: "EA",
          unitPrice: 3800,
          totalPrice: 7600,
          supplier: "Door Manufacturer",
          leadTime: "3-4 weeks",
          status: 'pending'
        });
      }

      // Hardware
      boqItems.push({
        id: `cabinet-hardware-${index}`,
        category: "Hardware",
        subcategory: "Cabinet Hardware",
        description: "Cabinet Hardware Set",
        specification: "Hinges, handles, drawer slides",
        quantity: 1,
        unit: "SET",
        unitPrice: 2900,
        totalPrice: 2900,
        supplier: "Hardware Supplier",
        leadTime: "1-2 weeks",
        status: 'pending'
      });

      // Labor for cabinet installation
      laborItems.push({
        id: `cabinet-install-${index}`,
        task: "Cabinet Installation",
        description: `Install ${cabinet.type} cabinet`,
        hours: 2,
        rate: 5400,
        total: 10800,
        skill: 'intermediate',
        phase: "Cabinet Installation"
      });
    });

    // Appliances
    appliances.forEach((appliance, index) => {
      boqItems.push({
        id: `appliance-${index}`,
        category: "Appliances",
        subcategory: appliance.type,
        description: `${appliance.type.charAt(0).toUpperCase() + appliance.type.slice(1)}`,
        specification: `${appliance.width}"W x ${appliance.height}"H x ${appliance.depth}"D`,
        quantity: 1,
        unit: "EA",
        unitPrice: getAppliancePrice(appliance.type),
        totalPrice: getAppliancePrice(appliance.type),
        supplier: "Appliance Dealer",
        leadTime: "2-3 weeks",
        status: 'pending'
      });

      // Installation labor
      laborItems.push({
        id: `appliance-install-${index}`,
        task: "Appliance Installation",
        description: `Install ${appliance.type}`,
        hours: getApplianceInstallHours(appliance.type),
        rate: 6200,
        total: getApplianceInstallHours(appliance.type) * 6200,
        skill: 'expert',
        phase: "Appliance Installation"
      });
    });

    // Countertops (estimated based on cabinet layout)
    const countertopArea = cabinets
      .filter(c => c.type === 'base')
      .reduce((total, cabinet) => total + (cabinet.width * cabinet.depth) / 144, 0); // Convert to sq ft

    if (countertopArea > 0) {
      boqItems.push({
        id: "countertops",
        category: "Surfaces",
        subcategory: "Countertops",
        description: "Kitchen Countertops",
        specification: "Quartz countertops, 3cm thick, eased edge",
        quantity: Math.ceil(countertopArea),
        unit: "SF",
        unitPrice: 7100,
        totalPrice: Math.ceil(countertopArea) * 7100,
        supplier: "Stone Fabricator",
        leadTime: "3-4 weeks",
        status: 'pending'
      });

      laborItems.push({
        id: "countertop-install",
        task: "Countertop Installation",
        description: "Template, fabricate, and install countertops",
        hours: 8,
        rate: 7100,
        total: 56800,
        skill: 'expert',
        phase: "Countertop Installation"
      });
    }

    // Electrical work
    const electricalOutlets = cabinets.length + appliances.length;
    boqItems.push({
      id: "electrical",
      category: "Electrical",
      subcategory: "Outlets & Wiring",
      description: "Electrical Work",
      specification: "GFCI outlets, under-cabinet lighting, appliance circuits",
      quantity: electricalOutlets,
      unit: "EA",
      unitPrice: 10400,
      totalPrice: electricalOutlets * 10400,
      supplier: "Electrical Contractor",
      leadTime: "1-2 weeks",
      status: 'pending'
    });

    laborItems.push({
      id: "electrical-labor",
      task: "Electrical Installation",
      description: "Install outlets, lighting, and appliance circuits",
      hours: 12,
      rate: 7900,
      total: 94800,
      skill: 'expert',
      phase: "Electrical Work"
    });

    // Plumbing (if sink present)
    const hasSink = appliances.some(a => a.type === 'sink');
    if (hasSink) {
      boqItems.push({
        id: "plumbing",
        category: "Plumbing",
        subcategory: "Rough & Finish",
        description: "Plumbing Work",
        specification: "Supply lines, drain, shut-off valves",
        quantity: 1,
        unit: "LS",
        unitPrice: 37500,
        totalPrice: 37500,
        supplier: "Plumbing Contractor",
        leadTime: "1 week",
        status: 'pending'
      });

      laborItems.push({
        id: "plumbing-labor",
        task: "Plumbing Installation",
        description: "Install supply lines and drainage",
        hours: 6,
        rate: 7100,
        total: 42600,
        skill: 'expert',
        phase: "Plumbing Work"
      });
    }

    return { materials: boqItems, labor: laborItems };
  }, [cabinets, appliances]);

  // Helper functions (Prices in Indian Rupees)
  const calculateCabinetPrice = (cabinet: any) => {
    const basePrice = {
      'base': 15000,
      'wall': 10000,
      'tall': 23000,
      'specialty': 29000
    }[cabinet.type] || 15000;

    const sizeMultiplier = (cabinet.width * cabinet.height) / 720; // Base size 24"x30"
    const finishMultiplier = {
      'laminate': 1.0,
      'veneer': 1.3,
      'acrylic': 1.5,
      'matte': 1.2,
      'gloss': 1.4
    }[cabinet.finish] || 1.0;

    return Math.round(basePrice * sizeMultiplier * finishMultiplier);
  };

  const getAppliancePrice = (type: string) => {
    const prices = {
      'sink': 29000,
      'stove': 100000,
      'fridge': 210000,
      'dishwasher': 54000,
      'oven': 150000,
      'microwave': 33000,
      'hood': 37000
    };
    return prices[type as keyof typeof prices] || 42000;
  };

  const getApplianceInstallHours = (type: string) => {
    const hours = {
      'sink': 3,
      'stove': 2,
      'fridge': 1,
      'dishwasher': 4,
      'oven': 3,
      'microwave': 2,
      'hood': 4
    };
    return hours[type as keyof typeof hours] || 2;
  };

  // Calculate totals
  const materialTotal = generateComprehensiveBOQ.materials.reduce((sum, item) => sum + item.totalPrice, 0);
  const laborTotal = generateComprehensiveBOQ.labor.reduce((sum, item) => sum + item.total, 0);
  const subtotal = materialTotal + laborTotal;
  const markup = subtotal * (markupPercentage / 100);
  const tax = (subtotal + markup) * (taxPercentage / 100);
  const contingency = subtotal * (contingencyPercentage / 100);
  const grandTotal = subtotal + markup + tax + contingency;

  // Export functions
  const exportToCSV = () => {
    const headers = ["Category", "Description", "Specification", "Qty", "Unit", "Unit Price", "Total", "Supplier", "Lead Time"];
    const rows = generateComprehensiveBOQ.materials.map(item => [
      item.category,
      item.description,
      item.specification,
      item.quantity,
      item.unit,
      item.unitPrice,
      item.totalPrice,
      item.supplier,
      item.leadTime
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kitchen-boq.csv";
    a.click();
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export functionality. This would typically involve using a library like jsPDF or react-pdf to generate the document content based on the BOQ data.
    // Implementation would generate PDF report
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Professional Bill of Quantities</h2>
            <p className="text-gray-600">Comprehensive project estimation and tracking</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Materials</p>
                  <p className="text-2xl font-bold">₹{materialTotal.toLocaleString('en-IN')}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Labor</p>
                  <p className="text-2xl font-bold">₹{laborTotal.toLocaleString('en-IN')}</p>
                </div>
                <Wrench className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{generateComprehensiveBOQ.materials.length}</p>
                </div>
                <Calculator className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Grand Total</p>
                  <p className="text-2xl font-bold">₹{grandTotal.toLocaleString('en-IN')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Requirements</CardTitle>
                <CardDescription>Detailed breakdown of all materials needed</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Specification</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateComprehensiveBOQ.materials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-sm text-gray-600">{item.specification}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>₹{item.unitPrice.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="font-medium">₹{item.totalPrice.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Badge variant={
                              item.status === 'pending' ? 'secondary' :
                              item.status === 'ordered' ? 'default' :
                              item.status === 'delivered' ? 'outline' : 'default'
                            }>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Labor Requirements</CardTitle>
                <CardDescription>Detailed breakdown of all labor tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Skill Level</TableHead>
                        <TableHead>Phase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateComprehensiveBOQ.labor.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.task}</TableCell>
                          <TableCell className="text-sm text-gray-600">{item.description}</TableCell>
                          <TableCell>{item.hours}</TableCell>
                          <TableCell>₹{item.rate.toLocaleString('en-IN')}/hr</TableCell>
                          <TableCell className="font-medium">₹{item.total.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            <Badge variant={
                              item.skill === 'basic' ? 'secondary' :
                              item.skill === 'intermediate' ? 'default' : 'destructive'
                            }>
                              {item.skill}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.phase}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Materials Subtotal:</span>
                    <span className="font-medium">₹{materialTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor Subtotal:</span>
                    <span className="font-medium">₹{laborTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Markup ({markupPercentage}%):</span>
                    <span className="font-medium">₹{markup.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({taxPercentage}%):</span>
                    <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contingency ({contingencyPercentage}%):</span>
                    <span className="font-medium">₹{contingency.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Markup Percentage</label>
                    <Input
                      type="number"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GST Percentage</label>
                    <Input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contingency Percentage</label>
                    <Input
                      type="number"
                      value={contingencyPercentage}
                      onChange={(e) => setContingencyPercentage(Number(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Estimated project phases and durations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { phase: "Design & Planning", duration: "1-2 weeks", status: "completed" },
                    { phase: "Permits & Approvals", duration: "2-3 weeks", status: "in-progress" },
                    { phase: "Material Ordering", duration: "4-6 weeks", status: "pending" },
                    { phase: "Demolition", duration: "1 week", status: "pending" },
                    { phase: "Electrical & Plumbing Rough-in", duration: "1 week", status: "pending" },
                    { phase: "Cabinet Installation", duration: "2-3 days", status: "pending" },
                    { phase: "Countertop Installation", duration: "1 day", status: "pending" },
                    { phase: "Appliance Installation", duration: "1-2 days", status: "pending" },
                    { phase: "Final Inspection", duration: "1 day", status: "pending" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {item.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : item.status === 'in-progress' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{item.phase}</p>
                          <p className="text-sm text-gray-600">{item.duration}</p>
                        </div>
                      </div>
                      <Badge variant={
                        item.status === 'completed' ? 'default' :
                        item.status === 'in-progress' ? 'secondary' : 'outline'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalBOQ;