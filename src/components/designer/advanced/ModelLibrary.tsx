import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  Package, 
  FileText, 
  Eye, 
  Trash2,
  Star,
  Search,
  Filter,
  ExternalLink
} from "lucide-react";

// Professional 3D Model Library with GLB support
interface ModelAsset {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  modelNumber: string;
  description: string;
  filePath: string;
  fileSize: number;
  format: 'glb' | 'gltf' | 'fbx' | 'obj';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  polyCount: number;
  textureResolution: string;
  dimensions: { width: number; height: number; depth: number };
  tags: string[];
  rating: number;
  downloads: number;
  dateAdded: string;
  thumbnail: string;
  preview360?: string;
  materials: string[];
  animations?: string[];
  variants?: ModelVariant[];
}

interface ModelVariant {
  id: string;
  name: string;
  description: string;
  filePath: string;
  thumbnail: string;
  materials: Record<string, string>;
}

// Professional model library with real manufacturer models
const PROFESSIONAL_MODEL_LIBRARY: ModelAsset[] = [
  {
    id: "ikea-sektion-base-24-glb",
    name: "IKEA SEKTION Base Cabinet 24\"",
    category: "cabinets",
    subcategory: "base",
    manufacturer: "IKEA",
    modelNumber: "SEKTION-BASE-24",
    description: "Photorealistic IKEA SEKTION base cabinet with accurate dimensions and materials",
    filePath: "/models/cabinets/ikea/sektion-base-24.glb",
    fileSize: 2.4, // MB
    format: "glb",
    quality: "high",
    polyCount: 15420,
    textureResolution: "2048x2048",
    dimensions: { width: 24, height: 30, depth: 24 },
    tags: ["ikea", "base", "cabinet", "kitchen", "sektion", "white"],
    rating: 4.8,
    downloads: 15420,
    dateAdded: "2024-01-15",
    thumbnail: "/thumbnails/ikea-sektion-base-24.jpg",
    preview360: "/previews/ikea-sektion-base-24-360.mp4",
    materials: ["White Melamine", "Chrome Hardware", "Soft-Close Hinges"],
    variants: [
      {
        id: "white",
        name: "White",
        description: "Standard white melamine finish",
        filePath: "/models/cabinets/ikea/sektion-base-24-white.glb",
        thumbnail: "/thumbnails/ikea-sektion-base-24-white.jpg",
        materials: { body: "white-melamine", hardware: "chrome" }
      },
      {
        id: "wood",
        name: "Wood Grain",
        description: "Wood grain laminate finish",
        filePath: "/models/cabinets/ikea/sektion-base-24-wood.glb",
        thumbnail: "/thumbnails/ikea-sektion-base-24-wood.jpg",
        materials: { body: "wood-laminate", hardware: "chrome" }
      }
    ]
  },
  {
    id: "bosch-dishwasher-shx3ar75uc-glb",
    name: "Bosch 300 Series Dishwasher",
    category: "appliances",
    subcategory: "dishwasher",
    manufacturer: "Bosch",
    modelNumber: "SHX3AR75UC",
    description: "Ultra-realistic Bosch dishwasher with detailed interior and controls",
    filePath: "/models/appliances/bosch/shx3ar75uc.glb",
    fileSize: 8.7,
    format: "glb",
    quality: "ultra",
    polyCount: 45680,
    textureResolution: "4096x4096",
    dimensions: { width: 24, height: 33.875, depth: 24 },
    tags: ["bosch", "dishwasher", "stainless", "steel", "300-series"],
    rating: 4.9,
    downloads: 8920,
    dateAdded: "2024-02-01",
    thumbnail: "/thumbnails/bosch-dishwasher.jpg",
    preview360: "/previews/bosch-dishwasher-360.mp4",
    materials: ["Stainless Steel", "Black Plastic", "Glass"],
    animations: ["door-open", "rack-slide"]
  },
  {
    id: "kraftmaid-momentum-base-36-glb",
    name: "KraftMaid Momentum Base 36\"",
    category: "cabinets",
    subcategory: "base",
    manufacturer: "KraftMaid",
    modelNumber: "MOMENTUM-BASE-36",
    description: "Premium KraftMaid cabinet with dovetail construction and soft-close drawers",
    filePath: "/models/cabinets/kraftmaid/momentum-base-36.glb",
    fileSize: 12.3,
    format: "glb",
    quality: "ultra",
    polyCount: 67890,
    textureResolution: "4096x4096",
    dimensions: { width: 36, height: 34.5, depth: 24 },
    tags: ["kraftmaid", "momentum", "premium", "dovetail", "soft-close"],
    rating: 4.9,
    downloads: 5670,
    dateAdded: "2024-01-20",
    thumbnail: "/thumbnails/kraftmaid-momentum.jpg",
    materials: ["Birch Plywood", "Dove White Paint", "Blum Hardware"],
    animations: ["drawer-open", "door-open"]
  },
  {
    id: "kitchenaid-fridge-krfc704fps-glb",
    name: "KitchenAid Counter-Depth Refrigerator",
    category: "appliances",
    subcategory: "refrigerator",
    manufacturer: "KitchenAid",
    modelNumber: "KRFC704FPS",
    description: "French door refrigerator with PrintShield finish and interior details",
    filePath: "/models/appliances/kitchenaid/krfc704fps.glb",
    fileSize: 15.8,
    format: "glb",
    quality: "ultra",
    polyCount: 89450,
    textureResolution: "4096x4096",
    dimensions: { width: 36, height: 70, depth: 24 },
    tags: ["kitchenaid", "refrigerator", "french-door", "printshield", "counter-depth"],
    rating: 4.7,
    downloads: 12340,
    dateAdded: "2024-01-25",
    thumbnail: "/thumbnails/kitchenaid-fridge.jpg",
    materials: ["PrintShield Stainless Steel", "LED Lighting", "Glass Shelves"],
    animations: ["door-open-left", "door-open-right", "drawer-open"]
  }
];

const ModelLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [selectedManufacturer, setSelectedManufacturer] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Filter models based on search criteria
  const filteredModels = PROFESSIONAL_MODEL_LIBRARY.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || model.category === selectedCategory;
    const matchesQuality = selectedQuality === "all" || model.quality === selectedQuality;
    const matchesManufacturer = selectedManufacturer === "all" || model.manufacturer === selectedManufacturer;
    
    return matchesSearch && matchesCategory && matchesQuality && matchesManufacturer;
  }).sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "downloads":
        return b.downloads - a.downloads;
      case "date":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case "size":
        return a.fileSize - b.fileSize;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleModelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadModel = (model: ModelAsset) => {
    // In a real implementation, this would download the GLB file
    console.log(`Downloading model: ${model.name}`);
    // Simulate download
    const link = document.createElement('a');
    link.href = model.filePath;
    link.download = `${model.name.replace(/\s+/g, '_')}.glb`;
    link.click();
  };

  const previewModel = (model: ModelAsset) => {
    // In a real implementation, this would open a 3D preview
    console.log(`Previewing model: ${model.name}`);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Professional 3D Model Library</h2>
            <p className="text-gray-600">Industry-standard GLB models from leading manufacturers</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Online
            </Button>
            <label htmlFor="model-upload">
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Model
                </span>
              </Button>
            </label>
            <input
              id="model-upload"
              type="file"
              accept=".glb,.gltf,.fbx,.obj"
              className="hidden"
              onChange={handleModelUpload}
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading model...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models, manufacturers, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="cabinets">Cabinets</option>
              <option value="appliances">Appliances</option>
              <option value="fixtures">Fixtures</option>
              <option value="accessories">Accessories</option>
            </select>

            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Manufacturers</option>
              <option value="IKEA">IKEA</option>
              <option value="KraftMaid">KraftMaid</option>
              <option value="Bosch">Bosch</option>
              <option value="KitchenAid">KitchenAid</option>
            </select>

            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Quality</option>
              <option value="low">Low Poly</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
              <option value="date">Newest</option>
              <option value="size">File Size</option>
              <option value="name">Name A-Z</option>
            </select>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{filteredModels.length} models</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Grid */}
      <div className="flex-1 p-6">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map((model) => (
              <Card key={model.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="aspect-square bg-gray-100 rounded-md mb-3 relative overflow-hidden">
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-model.jpg';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={model.quality === 'ultra' ? 'default' : 'secondary'}>
                        {model.quality.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-white/90">
                        {model.format.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-sm font-medium line-clamp-2">{model.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {model.manufacturer} - {model.modelNumber}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{model.rating}</span>
                    </div>
                    <span className="text-gray-500">{model.fileSize}MB</span>
                  </div>

                  <div className="text-xs text-gray-600">
                    <div>{model.polyCount.toLocaleString()} polygons</div>
                    <div>{model.textureResolution} textures</div>
                    <div>{model.dimensions.width}"×{model.dimensions.height}"×{model.dimensions.depth}"</div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {model.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => previewModel(model)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => downloadModel(model)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ModelLibrary;