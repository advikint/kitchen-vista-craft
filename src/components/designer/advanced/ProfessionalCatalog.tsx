import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
import { Search, Filter, Star, Download, Eye, ShoppingCart } from "lucide-react";
import { useKitchenStore, CabinetType, CabinetCategory, CabinetFinish, CabinetFrontType, ApplianceType } from "@/store/kitchenStore";

const INCH_TO_CM = 2.54;

// Professional manufacturer catalog data (Prices in Indian Rupees)
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
        price: 7500,
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
      // ... (rest of IKEA cabinets) ...
      {
        id: "ikea-sektion-tall-24",
        name: "SEKTION Tall Cabinet",
        model: "SEKTION",
        manufacturer: "IKEA",
        category: "tall",
        subcategory: "pantry-tall",
        dimensions: { width: 24, height: 80, depth: 24 },
        price: 12000,
        material: "Particleboard",
        finish: "White",
        description: "Tall pantry cabinet with multiple shelves",
        features: ["5 adjustable shelves", "Soft-closing hinges", "25-year warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "Particleboard with melamine foil",
          "Hardware": "Included",
          "Assembly": "Required"
        },
        images: ["/catalog/ikea-sektion-tall.jpg"],
        rating: 4.3,
        reviews: 654,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      }
    ],
    "KraftMaid": [
      // ... (KraftMaid cabinets) ...
       {
        id: "kraftmaid-momentum-corner-base",
        name: "Momentum Corner Base Cabinet",
        model: "Momentum",
        manufacturer: "KraftMaid",
        category: "base",
        subcategory: "corner-base",
        dimensions: { width: 36, height: 34.5, depth: 24 },
        price: 28500,
        material: "Birch Plywood",
        finish: "Dove White",
        description: "Corner base cabinet with lazy susan",
        features: ["Lazy susan included", "Soft-close doors", "Lifetime warranty"],
        specifications: {
          "Load capacity": "60 lbs per shelf",
          "Material": "Birch plywood with catalyzed finish",
          "Hardware": "Blum soft-close with lazy susan",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/kraftmaid-corner-base.jpg"],
        rating: 4.5,
        reviews: 234,
        availability: "Made to Order",
        leadTime: "6-8 weeks"
      }
    ],
    "Merillat": [
      // ... (Merillat cabinets) ...
      {
        id: "merillat-classic-sink-base",
        name: "Classic Sink Base Cabinet",
        model: "Classic",
        manufacturer: "Merillat",
        category: "base",
        subcategory: "sink-base",
        dimensions: { width: 36, height: 34.5, depth: 24 },
        price: 18500,
        material: "Maple",
        finish: "Natural",
        description: "Sink base cabinet with false drawer front",
        features: ["False drawer front", "Removable shelf", "Limited lifetime warranty"],
        specifications: {
          "Load capacity": "50 lbs per shelf",
          "Material": "Maple face frame, plywood box",
          "Hardware": "Standard hinges included",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/merillat-sink-base.jpg"],
        rating: 4.2,
        reviews: 156,
        availability: "In Stock",
        leadTime: "3-4 weeks"
      }
    ],
    "Godrej": [
      // ... (Godrej cabinets including loft) ...
      {
        id: "godrej-loft-80",
        name: "Modular Loft Cabinet 80cm",
        model: "Modular Pro",
        manufacturer: "Godrej",
        type: "loft", // This field is used to determine if it's a cabinet or appliance in handleAddToProject
        category: "standard-wall", // This field maps to CabinetCategory
        frontType: "shutter",
        dimensions: { width: 80, height: 40, depth: 35 }, // Dimensions in INCHES for catalog
        price: 5200,
        material: "Marine Plywood",
        finish: "Laminate White",
        description: "Wide loft cabinet for overhead storage",
        features: ["Marine grade plywood", "Ample storage", "5-year warranty"],
        specifications: {
          "Load capacity": "25 lbs per shelf",
          "Material": "Marine plywood with laminate finish",
          "Hardware": "Standard hinges",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/godrej-modular-wall.jpg"],
        rating: 4.3,
        reviews: 120,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      }
    ],
    "Sleek": [
      // ... (Sleek cabinets) ...
      {
        id: "sleek-appliance-base-30",
        name: "Premium Appliance Base Cabinet",
        model: "Premium Series",
        manufacturer: "Sleek",
        type: "base", // This field is used to determine if it's a cabinet or appliance
        category: "appliance-base", // This field maps to CabinetCategory
        frontType: "open",
        dimensions: { width: 30, height: 34, depth: 22 }, // Dimensions in INCHES for catalog
        price: 13500,
        material: "MDF",
        finish: "Acrylic High Gloss",
        description: "Base cabinet for built-in under-counter appliances like ovens or microwaves.",
        features: ["Reinforced structure", "Ventilation considerations", "10-year warranty"],
        specifications: {
          "Material": "MDF with acrylic finish",
          "Appliance Opening": "Specify appliance dimensions for cutout",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/sleek-appliance-base.jpg"],
        rating: 4.4,
        reviews: 120,
        availability: "Made to Order",
        leadTime: "3-4 weeks"
      }
    ],
    "Hettich": [
      // ... (Hettich cabinets) ...
      {
        id: "hettich-base-pullout-spice-6",
        name: "InnoTech Base Pullout Spice Rack",
        model: "InnoTech",
        manufacturer: "Hettich",
        type: "base", // This field is used to determine if it's a cabinet or appliance
        category: "pullout", // This field maps to CabinetCategory
        frontType: "shutter",
        dimensions: { width: 6, height: 34, depth: 22 }, // Dimensions in INCHES for catalog
        price: 22000,
        material: "Plywood",
        finish: "Laminate",
        description: "Narrow base pullout cabinet for spices or bottles, full extension.",
        features: ["Full extension slides", "Soft-close mechanism", "Adjustable shelves/racks"],
        specifications: {
          "Material": "18mm plywood with laminate",
          "Hardware": "Hettich pullout system",
          "Assembly": "Pre-assembled",
          "Load Capacity": "20 kg"
        },
        images: ["/catalog/hettich-base-pullout.jpg"],
        rating: 4.7,
        reviews: 130,
        availability: "Made to Order",
        leadTime: "4-5 weeks"
      }
    ],
    "Hafele": [
      // ... (Hafele cabinets) ...
       {
        id: "hafele-fridge-tall-36",
        name: "Integrated Fridge Housing Tall Cabinet",
        model: "Appliance Housing",
        manufacturer: "Hafele",
        type: "tall", // This field is used to determine if it's a cabinet or appliance
        category: "fridge-tall", // This field maps to CabinetCategory
        frontType: "open",
        dimensions: { width: 36, height: 84, depth: 24 }, // Dimensions in INCHES for catalog
        price: 32000,
        material: "Plywood",
        finish: "Laminate",
        description: "Tall cabinet designed to house and frame a built-in refrigerator.",
        features: ["Provides built-in look", "Ventilation considerations", "Side panels included"],
        specifications: {
          "Material": "18mm plywood with laminate",
          "Appliance Opening": "Standard for 36-inch fridge, consult specs",
          "Assembly": "Professional installation required"
        },
        images: ["/catalog/hafele-fridge-tall.jpg"],
        rating: 4.5,
        reviews: 110,
        availability: "Made to Order",
        leadTime: "6-8 weeks"
      }
    ],
    "HomeLane": [
      // ... (HomeLane cabinets) ...
      {
        id: "homelane-broom-tall-18",
        name: "Broom Tall Cabinet",
        model: "Essential",
        manufacturer: "HomeLane",
        category: "tall", // This field maps to CabinetCategory
        subcategory: "broom-tall", // This field maps to CabinetCategory's more specific subcategory
        type: "tall", // This field is used to determine if it's a cabinet or appliance
        dimensions: { width: 18, height: 84, depth: 22 }, // Dimensions in INCHES for catalog
        price: 13500,
        material: "Plywood",
        finish: "Laminate",
        description: "Tall cabinet for cleaning supplies storage",
        features: ["Broom hooks", "Adjustable shelves", "5-year warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "16mm plywood with laminate",
          "Hardware": "Soft-close hinges",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/homelane-broom-tall.jpg"],
        rating: 4.0,
        reviews: 178,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      }
    ],
    "Livspace": [
      // ... (Livspace cabinets) ...
      {
        id: "livspace-oven-tall-24",
        name: "Oven Tall Cabinet",
        model: "Smart Storage",
        manufacturer: "Livspace",
        category: "tall", // This field maps to CabinetCategory
        subcategory: "oven-tall", // This field maps to CabinetCategory's more specific subcategory
        type: "tall", // This field is used to determine if it's a cabinet or appliance
        dimensions: { width: 24, height: 84, depth: 24 }, // Dimensions in INCHES for catalog
        price: 24500,
        material: "Plywood",
        finish: "Acrylic",
        description: "Tall cabinet designed for built-in oven",
        features: ["Oven housing", "Heat resistant", "Ventilation", "7-year warranty"],
        specifications: {
          "Load capacity": "80 lbs",
          "Material": "18mm plywood with acrylic finish",
          "Hardware": "Soft-close hinges",
          "Assembly": "Professional installation required"
        },
        images: ["/catalog/livspace-oven-tall.jpg"],
        rating: 4.4,
        reviews: 156,
        availability: "Made to Order",
        leadTime: "4-5 weeks"
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
        type: "dishwasher", // Changed from 'category' for consistency with how 'type' is used in handleAddToProject
        dimensions: { width: 24, height: 33.875, depth: 24 },
        price: 54500,
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
        type: "fridge", // Changed from 'category'
        dimensions: { width: 36, height: 70, depth: 24 },
        price: 243500,
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
    ],
    "IFB": [
      {
        id: "ifb-neptune-vx",
        name: "Neptune VX Dishwasher",
        model: "Neptune VX",
        manufacturer: "IFB",
        type: "dishwasher", // Changed from 'category'
        dimensions: { width: 24, height: 32, depth: 24 },
        price: 45500,
        material: "Stainless Steel",
        finish: "Stainless Steel",
        description: "12 place setting dishwasher with aqua energizer",
        features: ["Aqua energizer", "8 wash programs", "Delay start"],
        specifications: {
          "Capacity": "12 place settings",
          "Energy Rating": "5 Star",
          "Warranty": "2 years comprehensive",
          "Installation": "Built-in"
        },
        images: ["/catalog/ifb-neptune.jpg"],
        rating: 4.4,
        reviews: 1234,
        availability: "In Stock",
        leadTime: "1 week"
      }
    ],
    "LG": [
      {
        id: "lg-gl-t322rpzu",
        name: "Double Door Refrigerator",
        model: "GL-T322RPZU",
        manufacturer: "LG",
        type: "fridge", // Changed from 'category'
        dimensions: { width: 24, height: 65, depth: 24 },
        price: 35500,
        material: "Steel",
        finish: "Shiny Steel",
        description: "308L double door refrigerator with smart inverter",
        features: ["Smart Inverter Compressor", "Multi Air Flow", "Moist 'N' Fresh"],
        specifications: {
          "Capacity": "308 Liters",
          "Energy Rating": "3 Star",
          "Warranty": "1 year product + 10 years compressor",
          "Installation": "Freestanding"
        },
        images: ["/catalog/lg-refrigerator.jpg"],
        rating: 4.2,
        reviews: 2156,
        availability: "In Stock",
        leadTime: "3-5 days"
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
  // ... (CatalogItem JSX remains the same)
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
        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center">
            {item.dimensions.width}"W × {item.dimensions.height}"H × {item.dimensions.depth}"D
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">₹{item.price.toLocaleString('en-IN')}</span>
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
          
          <div className="space-y-1">
            {item.features.slice(0, 2).map((feature: string, index: number) => (
              <div key={index} className="text-xs text-gray-600 flex items-center">
                <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>
        
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all"); // Changed name to avoid conflict
  const [selectedManufacturer, setSelectedManufacturer] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const allItems = useMemo(() => {
    const items: any[] = [];
    // Flatten cabinets
    Object.entries(PROFESSIONAL_CATALOG.cabinets).forEach(([manufacturer, products]) => {
        products.forEach((product: any) => {
            // For cabinets, 'type' is like 'base', 'wall', 'tall'.
            // 'category' in catalog is like 'standard-base', which maps to store's CabinetCategory.
            items.push({
                ...product,
                itemClassification: 'cabinet', // Differentiator for items array
                // 'type' already exists in catalog data for cabinets (e.g. "base", "wall", "loft")
                // 'category' in catalog data for cabinets is the specific subcategory (e.g. "standard-base")
            });
        });
    });
    // Flatten appliances
    Object.entries(PROFESSIONAL_CATALOG.appliances).forEach(([manufacturer, products]) => {
        products.forEach((product: any) => {
            // For appliances, catalog 'type' is like 'dishwasher', 'fridge'.
            items.push({
                ...product,
                itemClassification: 'appliance', // Differentiator for items array
                // 'type' already exists in catalog data for appliances (e.g. "dishwasher")
            });
        });
    });
    return items;
  }, []);

  const manufacturers = useMemo(() => {
    const mfgs = new Set<string>();
    allItems.forEach(item => mfgs.add(item.manufacturer));
    return Array.from(mfgs).sort();
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let filtered = allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      // selectedCategoryFilter can be 'all', 'cabinets', 'appliances'
      const matchesCategoryFilter = selectedCategoryFilter === "all" || item.itemClassification === selectedCategoryFilter;

      const matchesManufacturer = selectedManufacturer === "all" || item.manufacturer === selectedManufacturer;
      
      let matchesPrice = true;
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        matchesPrice = item.price >= min && (max ? item.price <= max : true);
      }
      
      return matchesSearch && matchesCategoryFilter && matchesManufacturer && matchesPrice;
    });

    filtered.sort((a, b) => {
      // ... (sorting logic remains the same) ...
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "name": default: return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [allItems, searchTerm, selectedCategoryFilter, selectedManufacturer, priceRange, sortBy]);

  const handleAddToProject = (item: any) => {
    console.log("[ProfessionalCatalog] handleAddToProject called with item:", item); // ADDED THIS LINE

    const store = useKitchenStore.getState();
    const position = { x: 50 + Math.random()*50, y: 50 + Math.random()*50 }; // Default position + random offset
    const rotation = 0;

    const cabinetTypesList: CabinetType[] = ['base', 'wall', 'tall', 'specialty', 'loft'];
    const applianceTypesList: ApplianceType[] = ['sink', 'stove', 'fridge', 'dishwasher', 'oven', 'microwave', 'hood'];

    // 'item.type' from catalog should now directly match CabinetType or ApplianceType
    if (cabinetTypesList.includes(item.type as CabinetType)) {
      const catalogDimensions = item.dimensions || {};
      const cabinetData = {
        // name: item.name || "Unnamed Cabinet", // Not in Omit<Cabinet, 'id'>
        // model: item.model || "", // Not in Omit<Cabinet, 'id'>
        // manufacturer: item.manufacturer || "", // Not in Omit<Cabinet, 'id'>
        type: item.type as CabinetType,
         // 'category' from catalog is like 'standard-base', maps to store's CabinetCategory
        category: item.category as CabinetCategory,
        frontType: (item.frontType || 'shutter') as CabinetFrontType,
        material: item.material || "Generic",
        finish: (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('acrylic')) ? 'acrylic' :
                (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('veneer')) ? 'veneer' :
                (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('matte')) ? 'matte' :
                (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('gloss')) ? 'gloss' :
                'laminate' as CabinetFinish,
        color: (item.color || (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('white')) ? '#FFFFFF' : '#F0F0F0') as string,
        position,
        rotation,
        width: Math.round((catalogDimensions.width || 60) * INCH_TO_CM),
        height: Math.round((catalogDimensions.height || 30) * INCH_TO_CM),
        depth: Math.round((catalogDimensions.depth || 24) * INCH_TO_CM),
        drawers: item.drawers,
      };
      store.addCabinet(cabinetData);
    } else if (applianceTypesList.includes(item.type as ApplianceType)) {
      const catalogDimensions = item.dimensions || {};
      const applianceData = {
        // name: item.name || "Unnamed Appliance", // Not in Omit<Appliance, 'id'|'isColliding'>
        // model: item.model || "", // Not in Omit<Appliance, 'id'|'isColliding'>
        type: item.type as ApplianceType,
        color: (item.color || (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('stainless')) ? '#C0C0C0' :
               (item.finish && typeof item.finish === 'string' && item.finish.toLowerCase().includes('black')) ? '#333333' :
               '#D3D3D3') as string,
        position,
        rotation,
        width: Math.round((catalogDimensions.width || 24) * INCH_TO_CM),
        height: Math.round((catalogDimensions.height || 34) * INCH_TO_CM),
        depth: Math.round((catalogDimensions.depth || 24) * INCH_TO_CM),
        brand: item.manufacturer,
      };
      store.addAppliance(applianceData);
    } else {
      console.warn("[ProfessionalCatalog] Unknown item type from catalog for adding to project:", item.type, item);
    }
  };

  const handleViewDetails = (item: any) => {
    console.log("[ProfessionalCatalog] Viewing details for item:", item);
    // Future: Implement a modal or side panel to show all item details from PROFESSIONAL_CATALOG entry.
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Professional Catalog</h2>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products, manufacturers, models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cabinet">Cabinets</SelectItem> {/* Changed value to 'cabinet' to match itemClassification */}
              <SelectItem value="appliance">Appliances</SelectItem> {/* Changed value to 'appliance' */}
            </SelectContent>
          </Select>
          <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
            <SelectTrigger><SelectValue placeholder="Manufacturer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {manufacturers.map(mfg => (<SelectItem key={mfg} value={mfg}>{mfg}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger><SelectValue placeholder="Price Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-10000">₹0 - ₹10,000</SelectItem>
              <SelectItem value="10000-25000">₹10,000 - ₹25,000</SelectItem>
              <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
              <SelectItem value="50000">₹50,000+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">{filteredItems.length} products found</span>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Professional Grade</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-300px)]"> {/* Adjusted height for typical screen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <CatalogItem key={item.id} item={item} onAddToProject={handleAddToProject} onViewDetails={handleViewDetails} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ProfessionalCatalog;