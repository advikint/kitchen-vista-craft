
import { useKitchenStore } from "@/store/kitchenStore";
import CabinetPropertiesPanel from "./CabinetPropertiesPanel";
import DoorPropertiesPanel from "./DoorPropertiesPanel";
import WindowPropertiesPanel from "./WindowPropertiesPanel";
import AppliancePropertiesPanel from "./AppliancePropertiesPanel";

const PropertiesPanel = () => {
  const { selectedItemId, cabinets, doors, windows, appliances } = useKitchenStore();
  
  const selectedCabinet = selectedItemId ? cabinets.find(cabinet => cabinet.id === selectedItemId) : null;
  const selectedDoor = selectedItemId ? doors.find(door => door.id === selectedItemId) : null;
  const selectedWindow = selectedItemId ? windows.find(window => window.id === selectedItemId) : null;
  const selectedAppliance = selectedItemId ? appliances.find(appliance => appliance.id === selectedItemId) : null;

  if (!selectedItemId) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <div>
          <h3 className="font-medium text-lg mb-2">No Item Selected</h3>
          <p className="text-gray-500 text-sm">
            Select an item in the designer to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  // Return the appropriate properties panel based on the selected item type
  if (selectedCabinet) {
    return <CabinetPropertiesPanel cabinet={selectedCabinet} />;
  }
  
  if (selectedDoor) {
    return <DoorPropertiesPanel door={selectedDoor} />;
  }
  
  if (selectedWindow) {
    return <WindowPropertiesPanel window={selectedWindow} />;
  }
  
  if (selectedAppliance) {
    return <AppliancePropertiesPanel appliance={selectedAppliance} />;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <p className="text-gray-500">Item ID: {selectedItemId}</p>
    </div>
  );
};

export default PropertiesPanel;
