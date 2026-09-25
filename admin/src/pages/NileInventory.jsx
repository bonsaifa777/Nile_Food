import Inventory from './Inventory';

const NILE_CATEGORIES = [
  'Commission', 'Employee Salary', 'House Rent', 'Maintenance', 'New material',
  'Material Rent', 'Tax', 'Electric Bill', 'Water Bill', 'Other', 'Employees food'
];

const NILE_UNITS = ['Monthly', '3-Month', 'Salary', 'Size', 'Other'];

export default function NileInventory() {
  return (
    <Inventory
      apiBase="/api/nile-inventory"
      title="Nile Inventory Management"
      badgeLabel="Nile Inventory"
      tableTitle="Nile Inventory Items"
      reportTitle="Nile Inventory Reports"
      categories={NILE_CATEGORIES}
      units={NILE_UNITS}
    />
  );
}