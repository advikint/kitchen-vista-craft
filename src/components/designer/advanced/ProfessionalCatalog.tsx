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
      {
        id: "ikea-sektion-wall-30",
        name: "SEKTION Wall Cabinet",
        model: "SEKTION",
        manufacturer: "IKEA",
        category: "wall",
        subcategory: "standard-wall",
        dimensions: { width: 30, height: 30, depth: 15 },
        price: 5500,
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
      },
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
      {
        id: "kraftmaid-momentum-base-36",
        name: "Momentum Base Cabinet",
        model: "Momentum",
        manufacturer: "KraftMaid",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 36, height: 34.5, depth: 24 },
        price: 20500,
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
      },
      {
        id: "kraftmaid-momentum-wall-30",
        name: "Momentum Wall Cabinet",
        model: "Momentum",
        manufacturer: "KraftMaid",
        category: "wall",
        subcategory: "standard-wall",
        dimensions: { width: 30, height: 30, depth: 12 },
        price: 15500,
        material: "Birch Plywood",
        finish: "Dove White",
        description: "Premium wall cabinet with soft-close doors",
        features: ["Soft-close hinges", "Lifetime warranty", "Dovetail construction"],
        specifications: {
          "Load capacity": "50 lbs per shelf",
          "Material": "Birch plywood with catalyzed finish",
          "Hardware": "Blum soft-close",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/kraftmaid-momentum-wall.jpg"],
        rating: 4.6,
        reviews: 387,
        availability: "Made to Order",
        leadTime: "6-8 weeks"
      },
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
      {
        id: "merillat-classic-base-30",
        name: "Classic Base Cabinet",
        model: "Classic",
        manufacturer: "Merillat",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 30, height: 34.5, depth: 24 },
        price: 15800,
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
      },
      {
        id: "merillat-classic-wall-24",
        name: "Classic Wall Cabinet",
        model: "Classic",
        manufacturer: "Merillat",
        category: "wall",
        subcategory: "standard-wall",
        dimensions: { width: 24, height: 30, depth: 12 },
        price: 12500,
        material: "Maple",
        finish: "Natural",
        description: "Solid wood face frame wall cabinet",
        features: ["Solid wood face frame", "Adjustable shelf", "Limited lifetime warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "Maple face frame, plywood box",
          "Hardware": "Standard hinges included",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/merillat-classic-wall.jpg"],
        rating: 4.3,
        reviews: 198,
        availability: "In Stock",
        leadTime: "3-4 weeks"
      },
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
      {
        id: "godrej-modular-base-24",
        name: "Modular Base Cabinet",
        model: "Modular Pro",
        manufacturer: "Godrej",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 24, height: 34, depth: 22 },
        price: 8500,
        material: "Marine Plywood",
        finish: "Laminate White",
        description: "Premium modular base cabinet with soft-close mechanism",
        features: ["Marine grade plywood", "Soft-close hinges", "5-year warranty"],
        specifications: {
          "Load capacity": "45 lbs per shelf",
          "Material": "Marine plywood with laminate finish",
          "Hardware": "Hettich soft-close",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/godrej-modular-base.jpg"],
        rating: 4.4,
        reviews: 892,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      },
      {
        id: "godrej-modular-wall-30",
        name: "Modular Wall Cabinet",
        model: "Modular Pro",
        manufacturer: "Godrej",
        category: "wall",
        subcategory: "standard-wall",
        dimensions: { width: 30, height: 30, depth: 12 },
        price: 6500,
        material: "Marine Plywood",
        finish: "Laminate White",
        description: "Premium modular wall cabinet with glass door option",
        features: ["Marine grade plywood", "Glass door option", "5-year warranty"],
        specifications: {
          "Load capacity": "35 lbs per shelf",
          "Material": "Marine plywood with laminate finish",
          "Hardware": "Hettich soft-close",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/godrej-modular-wall.jpg"],
        rating: 4.3,
        reviews: 567,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      },
      {
        id: "godrej-modular-tall-18",
        name: "Modular Tall Cabinet",
        model: "Modular Pro",
        manufacturer: "Godrej",
        category: "tall",
        subcategory: "pantry-tall",
        dimensions: { width: 18, height: 84, depth: 22 },
        price: 16500,
        material: "Marine Plywood",
        finish: "Laminate White",
        description: "Tall pantry cabinet with multiple compartments",
        features: ["6 adjustable shelves", "Soft-close hinges", "5-year warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "Marine plywood with laminate finish",
          "Hardware": "Hettich soft-close",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/godrej-modular-tall.jpg"],
        rating: 4.5,
        reviews: 423,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      }
    ],
    "Sleek": [
      {
        id: "sleek-premium-base-30",
        name: "Premium Base Cabinet",
        model: "Premium Series",
        manufacturer: "Sleek",
        category: "base",
        subcategory: "drawer-base",
        dimensions: { width: 30, height: 34, depth: 22 },
        price: 12500,
        material: "MDF",
        finish: "Acrylic High Gloss",
        description: "Premium base cabinet with 3 drawers",
        features: ["3 soft-close drawers", "Acrylic finish", "10-year warranty"],
        specifications: {
          "Load capacity": "50 lbs per drawer",
          "Material": "MDF with acrylic finish",
          "Hardware": "Blum Tandem Plus",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/sleek-premium-base.jpg"],
        rating: 4.6,
        reviews: 734,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      },
      {
        id: "sleek-premium-wall-36",
        name: "Premium Wall Cabinet",
        model: "Premium Series",
        manufacturer: "Sleek",
        category: "wall",
        subcategory: "glass-wall",
        dimensions: { width: 36, height: 30, depth: 12 },
        price: 9500,
        material: "MDF",
        finish: "Acrylic High Gloss",
        description: "Premium wall cabinet with frosted glass doors",
        features: ["Frosted glass doors", "LED strip ready", "10-year warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "MDF with acrylic finish",
          "Hardware": "Soft-close hinges",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/sleek-premium-wall.jpg"],
        rating: 4.5,
        reviews: 456,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      },
      {
        id: "sleek-cooktop-base-36",
        name: "Cooktop Base Cabinet",
        model: "Premium Series",
        manufacturer: "Sleek",
        category: "base",
        subcategory: "cooktop-base",
        dimensions: { width: 36, height: 34, depth: 22 },
        price: 14500,
        material: "MDF",
        finish: "Acrylic High Gloss",
        description: "Specialized base cabinet for cooktop installation",
        features: ["Heat resistant top", "Ventilation slots", "10-year warranty"],
        specifications: {
          "Load capacity": "60 lbs",
          "Material": "MDF with acrylic finish",
          "Hardware": "Soft-close hinges",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/sleek-cooktop-base.jpg"],
        rating: 4.4,
        reviews: 298,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      },
      {
        id: "sleek-microwave-wall-30",
        name: "Microwave Wall Cabinet",
        model: "Premium Series",
        manufacturer: "Sleek",
        category: "wall",
        subcategory: "microwave-wall",
        dimensions: { width: 30, height: 18, depth: 15 },
        price: 11500,
        material: "MDF",
        finish: "Acrylic High Gloss",
        description: "Wall cabinet designed for built-in microwave",
        features: ["Microwave shelf", "Ventilation", "10-year warranty"],
        specifications: {
          "Load capacity": "70 lbs",
          "Material": "MDF with acrylic finish",
          "Hardware": "Soft-close hinges",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/sleek-microwave-wall.jpg"],
        rating: 4.3,
        reviews: 187,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      }
    ],
    "Hettich": [
      {
        id: "hettich-modular-base-24",
        name: "Modular Base Cabinet",
        model: "InnoTech",
        manufacturer: "Hettich",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 24, height: 34, depth: 22 },
        price: 18500,
        material: "Plywood",
        finish: "Laminate",
        description: "German engineered modular base cabinet",
        features: ["InnoTech drawer system", "Soft-close", "Lifetime warranty"],
        specifications: {
          "Load capacity": "80 lbs per drawer",
          "Material": "18mm plywood with laminate",
          "Hardware": "Hettich InnoTech",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/hettich-modular-base.jpg"],
        rating: 4.8,
        reviews: 456,
        availability: "Made to Order",
        leadTime: "4-5 weeks"
      },
      {
        id: "hettich-corner-wall-24",
        name: "Corner Wall Cabinet",
        model: "InnoTech",
        manufacturer: "Hettich",
        category: "wall",
        subcategory: "corner-wall",
        dimensions: { width: 24, height: 30, depth: 12 },
        price: 16500,
        material: "Plywood",
        finish: "Laminate",
        description: "Corner wall cabinet with rotating shelves",
        features: ["Rotating shelves", "Soft-close", "Lifetime warranty"],
        specifications: {
          "Load capacity": "40 lbs per shelf",
          "Material": "18mm plywood with laminate",
          "Hardware": "Hettich rotating mechanism",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/hettich-corner-wall.jpg"],
        rating: 4.7,
        reviews: 234,
        availability: "Made to Order",
        leadTime: "4-5 weeks"
      },
      {
        id: "hettich-pantry-tall-18",
        name: "Pantry Tall Cabinet",
        model: "InnoTech",
        manufacturer: "Hettich",
        category: "tall",
        subcategory: "pantry-tall",
        dimensions: { width: 18, height: 84, depth: 24 },
        price: 32500,
        material: "Plywood",
        finish: "Laminate",
        description: "Full-height pantry with pull-out shelves",
        features: ["Pull-out shelves", "Soft-close", "Lifetime warranty"],
        specifications: {
          "Load capacity": "60 lbs per shelf",
          "Material": "18mm plywood with laminate",
          "Hardware": "Hettich pull-out system",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/hettich-pantry-tall.jpg"],
        rating: 4.9,
        reviews: 189,
        availability: "Made to Order",
        leadTime: "4-5 weeks"
      }
    ],
    "Hafele": [
      {
        id: "hafele-magic-corner-36",
        name: "Magic Corner Cabinet",
        model: "Magic Corner",
        manufacturer: "Hafele",
        category: "base",
        subcategory: "magic-corner",
        dimensions: { width: 36, height: 34, depth: 24 },
        price: 45500,
        material: "Plywood",
        finish: "Laminate",
        description: "Corner cabinet with magic corner pull-out system",
        features: ["Magic corner mechanism", "Full access", "German engineering"],
        specifications: {
          "Load capacity": "80 lbs total",
          "Material": "18mm plywood with laminate",
          "Hardware": "Hafele Magic Corner",
          "Assembly": "Professional installation required"
        },
        images: ["/catalog/hafele-magic-corner.jpg"],
        rating: 4.9,
        reviews: 156,
        availability: "Made to Order",
        leadTime: "6-8 weeks"
      },
      {
        id: "hafele-wine-rack-12",
        name: "Wine Rack Cabinet",
        model: "Wine Storage",
        manufacturer: "Hafele",
        category: "specialty",
        subcategory: "wine-rack",
        dimensions: { width: 12, height: 84, depth: 24 },
        price: 38500,
        material: "Solid Wood",
        finish: "Natural Oak",
        description: "Tall wine storage cabinet with temperature control",
        features: ["Temperature control", "UV protection", "Holds 48 bottles"],
        specifications: {
          "Capacity": "48 wine bottles",
          "Material": "Solid oak with natural finish",
          "Hardware": "Soft-close hinges",
          "Assembly": "Professional installation required"
        },
        images: ["/catalog/hafele-wine-rack.jpg"],
        rating: 4.8,
        reviews: 89,
        availability: "Made to Order",
        leadTime: "8-10 weeks"
      },
      {
        id: "hafele-appliance-tall-24",
        name: "Appliance Tall Cabinet",
        model: "Appliance Housing",
        manufacturer: "Hafele",
        category: "tall",
        subcategory: "appliance-tall",
        dimensions: { width: 24, height: 84, depth: 24 },
        price: 28500,
        material: "Plywood",
        finish: "Laminate",
        description: "Tall cabinet for built-in appliances",
        features: ["Appliance housing", "Ventilation", "Adjustable shelves"],
        specifications: {
          "Load capacity": "100 lbs",
          "Material": "18mm plywood with laminate",
          "Hardware": "Soft-close hinges",
          "Assembly": "Professional installation required"
        },
        images: ["/catalog/hafele-appliance-tall.jpg"],
        rating: 4.6,
        reviews: 134,
        availability: "Made to Order",
        leadTime: "6-8 weeks"
      }
    ],
    "HomeLane": [
      {
        id: "homelane-modular-base-30",
        name: "Modular Base Cabinet",
        model: "Essential",
        manufacturer: "HomeLane",
        category: "base",
        subcategory: "standard-base",
        dimensions: { width: 30, height: 34, depth: 22 },
        price: 9500,
        material: "Plywood",
        finish: "Laminate",
        description: "Affordable modular base cabinet",
        features: ["Soft-close hinges", "Adjustable shelves", "5-year warranty"],
        specifications: {
          "Load capacity": "50 lbs per shelf",
          "Material": "16mm plywood with laminate",
          "Hardware": "Standard soft-close",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/homelane-modular-base.jpg"],
        rating: 4.2,
        reviews: 567,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      },
      {
        id: "homelane-open-shelf-36",
        name: "Open Shelf Cabinet",
        model: "Essential",
        manufacturer: "HomeLane",
        category: "wall",
        subcategory: "open-shelf",
        dimensions: { width: 36, height: 30, depth: 12 },
        price: 6500,
        material: "Plywood",
        finish: "Laminate",
        description: "Open shelf wall cabinet for display",
        features: ["Open design", "Adjustable shelves", "5-year warranty"],
        specifications: {
          "Load capacity": "30 lbs per shelf",
          "Material": "16mm plywood with laminate",
          "Hardware": "Wall mounting brackets",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/homelane-open-shelf.jpg"],
        rating: 4.1,
        reviews: 234,
        availability: "In Stock",
        leadTime: "1-2 weeks"
      },
      {
        id: "homelane-broom-tall-18",
        name: "Broom Tall Cabinet",
        model: "Essential",
        manufacturer: "HomeLane",
        category: "tall",
        subcategory: "broom-tall",
        dimensions: { width: 18, height: 84, depth: 22 },
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
      {
        id: "livspace-pullout-base-24",
        name: "Pullout Base Cabinet",
        model: "Smart Storage",
        manufacturer: "Livspace",
        category: "base",
        subcategory: "pullout",
        dimensions: { width: 24, height: 34, depth: 22 },
        price: 16500,
        material: "Plywood",
        finish: "Acrylic",
        description: "Base cabinet with full pullout drawers",
        features: ["Full pullout", "Soft-close", "Smart storage", "7-year warranty"],
        specifications: {
          "Load capacity": "60 lbs per drawer",
          "Material": "18mm plywood with acrylic finish",
          "Hardware": "Blum Tandem Plus",
          "Assembly": "Pre-assembled"
        },
        images: ["/catalog/livspace-pullout-base.jpg"],
        rating: 4.5,
        reviews: 345,
        availability: "In Stock",
        leadTime: "2-3 weeks"
      },
      {
        id: "livspace-carousel-corner-36",
        name: "Carousel Corner Cabinet",
        model: "Smart Storage",
        manufacturer: "Livspace",
        category: "base",
        subcategory: "carousel",
        dimensions: { width: 36, height: 34, depth: 24 },
        price: 35500,
        material: "Plywood",
        finish: "Acrylic",
        description: "Corner cabinet with rotating carousel system",
        features: ["360° rotation", "Easy access", "Smart storage", "7-year warranty"],
        specifications: {
          "Load capacity": "70 lbs total",
          "Material": "18mm plywood with acrylic finish",
          "Hardware": "Carousel mechanism",
          "Assembly": "Professional installation required"
        },
        images: ["/catalog/livspace-carousel-corner.jpg"],
        rating: 4.7,
        reviews: 198,
        availability: "Made to Order",
        leadTime: "4-5 weeks"
      },
      {
        id: "livspace-oven-tall-24",
        name: "Oven Tall Cabinet",
        model: "Smart Storage",
        manufacturer: "Livspace",
        category: "tall",
        subcategory: "oven-tall",
        dimensions: { width: 24, height: 84, depth: 24 },
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
        category: "dishwasher",
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
        category: "fridge",
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
        category: "dishwasher",
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
        category: "fridge",
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
    // TODO: Implement logic to add the selected item to the kitchen design (e.g., update Zustand store)
    // Implementation would add item to the kitchen design
  };

  const handleViewDetails = (item: any) => {
    // TODO: Implement logic to display detailed information for the selected item (e.g., open a modal or navigate to a detail page)
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
              <SelectItem value="0-10000">₹0 - ₹10,000</SelectItem>
              <SelectItem value="10000-25000">₹10,000 - ₹25,000</SelectItem>
              <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
              <SelectItem value="50000">₹50,000+</SelectItem>
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