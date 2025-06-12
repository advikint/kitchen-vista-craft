import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Star, Download, Eye, ShoppingCart } from "lucide-react";

// Professional manufacturer catalog data
const PROFESSIONAL_CATALOG = {
  cabinets: {
    "IKEA": [
      {
        id: "ikea-sektion-base-24",
        name: "SEKTION Base Cabinet",
        model: "SEKTION",
        manufacturer: "IKEA",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 24, height: 30, depth: 24 },
        price: 89,
        material: "Particleboard",
        finish: "White",
        description: "Base cabinet with door and adjustable shelf",
        features: ["Adjustable shelf", "Soft-closing hinges", "25-year warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "Particleboard with melamine foil",
          "Hardware": "Included",
          "Assembly": "Required"
        },
        images: ["/catalog/ikea-sektion-base.jpg"],
        rating: 4.2,
        reviews: 1247,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      },
      {
        id: "ikea-sektion-wall-30",
        name: "SEKTION Wall Cabinet",
        model: "SEKTION",
        manufacturer: "IKEA",
        category: "wall",
        subcategory: "standard-wall",
        dimensions: { width: 30, height: 30, depth: 15 },
        price: 65,
        material: "Particleboard",
        finish: "White",
        description: "Wall cabinet with door and adjustable shelf",
        features: ["Adjustable shelf", "Soft-closing hinges", "25-year warranty"],
        specifications: {
          "Load capacity": "30 lbs per shelf",
          "Material": "Particleboard with melamine foil",
          "Hardware": "Included",
          "Assembly": "Required"
        },
        images: ["/catalog/ikea-sektion-wall.jpg"],
        rating: 4.1,
        reviews: 892,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      }
    ],
    "KraftMaid": [
      {
        id: "kraftmaid-momentum-base-36",
        name: "Momentum Base Cabinet",
        model: "Momentum",
        manufacturer: "KraftMaid",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 36, height: 34.5, depth: 24 },
        price: 245,
        material: "Birch Plywood",
        finish: "Dove White",
        description: "Premium base cabinet with full-extension drawers",
        features: ["Full-extension soft-close drawers", "Lifetime warranty", "Dovetail construction"],
        specifications: {
          "Load capacity": "75 lbs per drawer",
          "Material": "Birch plywood with catalyzed finish",
          "Hardware": "Blum soft-close",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/kraftmaid-momentum.jpg"],
        rating: 4.7,
        reviews: 543,
        availability: "Made to Order",
        leadTime: "6-8 weeks"
      }
    ],
    "Merillat": [
      {
        id: "merillat-classic-base-30",
        name: "Classic Base Cabinet",
        model: "Classic",
        manufacturer: "Merillat",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 30, height: 34.5, depth: 24 },
        price: 189,
        material: "Maple",
        finish: "Natural",
        description: "Solid wood face frame cabinet with adjustable shelves",
        features: ["Solid wood face frame", "Adjustable shelves", "Limited lifetime warranty"],
        specifications: {
          "Load capacity": "50 lbs per shelf",
          "Material": "Maple face frame, plywood box",
          "Hardware": "Standard hinges included",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/merillat-classic.jpg"],
        rating: 4.4,
        reviews: 321,
        availability: "In Stock",
        leadTime: "3-4 weeks"
      }
    ]
  },
  appliances: {
    "Bosch": [
      {
        id: "bosch-shx3ar75uc",
        name: "300 Series Dishwasher",
        model: "SHX3AR75UC",
        manufacturer: "Bosch",
        category: "dishwasher",
        dimensions: { width: 24, height: 33.875, depth: 24 },
        price: 649,
        material: "Stainless Steel",
        finish: "Stainless Steel",
        description: "Ultra-quiet dishwasher with flexible 3rd rack",
        features: ["44 dBA quiet operation", "Flexible 3rd rack", "AutoAir dry"],
        specifications: {
          "Capacity": "16 place settings",
          "Energy Star": "Yes",
          "Warranty": "1 year parts and labor",
          "Installation": "Built-in"
        },
        images: ["/catalog/bosch-dishwasher.jpg"],
        rating: 4.6,
        reviews: 2341,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      }
    ],
    "KitchenAid": [
      {
        id: "kitchenaid-krfc704fps",
        name: "Counter-Depth Refrigerator",
        model: "KRFC704FPS",
        manufacturer: "KitchenAid",
        category: "fridge",
        dimensions: { width: 36, height: 70, depth: 24 },
        price: 2899,
        material: "Stainless Steel",
        finish: "PrintShield Stainless",
        description: "23.8 cu. ft. counter-depth French door refrigerator",
        features: ["PrintShield finish", "Interior water dispenser", "Produce preserver"],
        specifications: {
          "Capacity": "23.8 cu. ft.",
          "Energy Star": "Yes",
          "Warranty": "1 year parts and labor",
          "Installation": "Freestanding"
        },
        images: ["/catalog/kitchenaid-fridge.jpg"],
        rating: 4.3,
        reviews: 1876,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      }
    ]
  }
};

interface CatalogItemProps {
  item: any;
  onAddToProject: (item: any) => void;
  onViewDetails: (item: any) => void;
}

const CatalogItem = ({ item, onAddToProject, onViewDetails }: CatalogItemProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
            <CardDescription className="text-xs">{item.manufacturer} - {item.model}</CardDescription>
          </div>
          <Badge variant={item.availability === "In Stock" ? "default" : "secondary"} className="text-xs">
            {item.availability}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Product image placeholder */}
        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center">
            {item.dimensions.width}"W × {item.dimensions.height}"H × {item.dimensions.depth}"D
          </div>
        </div>
        
        {/* Product details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">${item.price}</span>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{item.rating}</span>
              <span className="text-xs text-gray-500">({item.reviews})</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            <div>{item.material} - {item.finish}</div>
            <div>Lead time: {item.leadTime}</div>
          </div>
          
          {/* Key features */}
          <div className="space-y-1">
            {item.features.slice(0, 2).map((feature: string, index: number) => (
              <div key={index} className="text-xs text-gray-600 flex items-center">
                <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => onViewDetails(item)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onAddToProject(item)}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfessionalCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedManufacturer, setSelectedManufacturer] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Flatten catalog for searching and filtering
  const allItems = useMemo(() => {
    const items: any[] = [];
    Object.entries(PROFESSIONAL_CATALOG).forEach(([type, manufacturers]) => {
      Object.entries(manufacturers).forEach(([manufacturer, products]) => {
        products.forEach((product: any) => {
          items.push({ ...product, type });
        });
      });
    });
    return items;
  }, []);

  // Get unique manufacturers
  const manufacturers = useMemo(() => {
    const mfgs = new Set<string>();
    allItems.forEach(item => mfgs.add(item.manufacturer));
    return Array.from(mfgs).sort();
  }, [allItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
      const matchesManufacturer = selectedManufacturer === "all" || item.manufacturer === selectedManufacturer;
      
      let matchesPrice = true;
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        matchesPrice = item.price >= min && (max ? item.price <= max : true);
      }
      
      return matchesSearch && matchesCategory && matchesManufacturer && matchesPrice;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allItems, searchTerm, selectedCategory, selectedManufacturer, priceRange, sortBy]);

  const handleAddToProject = (item: any) => {
    console.log("Adding to project:", item);
    // Implementation would add item to the kitchen design
  };

  const handleViewDetails = (item: any) => {
    console.log("Viewing details:", item);
    // Implementation would show detailed product information
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Professional Catalog</h2>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products, manufacturers, models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cabinets">Cabinets</SelectItem>
              <SelectItem value="appliances">Appliances</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
            <SelectTrigger>
              <SelectValue placeholder="Manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {manufacturers.map(mfg => (
                <SelectItem key={mfg} value={mfg}>{mfg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-100">$0 - $100</SelectItem>
              <SelectItem value="100-500">$100 - $500</SelectItem>
              <SelectItem value="500-1000">$500 - $1,000</SelectItem>
              <SelectItem value="1000">$1,000+</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Results */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            {filteredItems.length} products found
          </span>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Professional Grade</span>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <CatalogItem
                key={item.id}
                item={item}
                onAddToProject={handleAddToProject}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ProfessionalCatalog;