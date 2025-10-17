/**
 * Integration Mapping Configuration Tool
 * 
 * A comprehensive tool for mapping healthcare appointment data including:
 * - Appointment Types, Purposes, Doctors/Providers, and Locations
 * - Custom category management with configurable values
 * - Excel import/export functionality
 * - Bulk editing and deletion capabilities
 * - Real-time inline mapping with instant feedback
 * - Notes field for all mappings
 * 
 * @version 1.1.0
 */

import React, { useState } from 'react';
import { Save, Upload, Download, Plus, Trash2, Edit, Settings, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AppointmentMappingForm() {
  // Practice configuration
  const [practiceName, setPracticeName] = useState('');
  const [practiceNameSaved, setPracticeNameSaved] = useState(false);
  const [practiceNameError, setPracticeNameError] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  
  // UI state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [activeTab, setActiveTab] = useState('appointmentTypes');
  const [activeView, setActiveView] = useState('list');
  
  // Data state - Available items (imported from Excel)
  const [availableAppointmentTypes, setAvailableAppointmentTypes] = useState([]);
  const [availableAppointmentPurposes, setAvailableAppointmentPurposes] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  
  // Data state - Mapped items (with category assignments)
  const [mappedAppointmentTypes, setMappedAppointmentTypes] = useState([]);
  const [mappedAppointmentPurposes, setMappedAppointmentPurposes] = useState([]);
  const [mappedDoctors, setMappedDoctors] = useState([]);
  const [mappedLocations, setMappedLocations] = useState([]);
  
  // Categories configuration
  const [categories, setCategories] = useState([]);
  
  // Selection and editing state
  const [selectedItems, setSelectedItems] = useState([]);
  const [showMassEditModal, setShowMassEditModal] = useState(false);
  const [massEditCategories, setMassEditCategories] = useState({});
  
  // Category management modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryValues, setNewCategoryValues] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const newAppointmentTypes = XLSX.utils.sheet_to_json(workbook.Sheets['Appointment Type'])
        .map(row => row.type).filter(Boolean);
      const newAppointmentPurposes = XLSX.utils.sheet_to_json(workbook.Sheets['Appointment Purpose'])
        .map(row => row.purpose).filter(Boolean);
      const newDoctors = XLSX.utils.sheet_to_json(workbook.Sheets['Doctor'])
        .map(row => row.doctor).filter(Boolean);
      const newLocations = XLSX.utils.sheet_to_json(workbook.Sheets['Location'])
        .map(row => row.location).filter(Boolean);
      const newCategories = XLSX.utils.sheet_to_json(workbook.Sheets['Categories']);

      setAvailableAppointmentTypes(newAppointmentTypes);
      setAvailableAppointmentPurposes(newAppointmentPurposes);
      setAvailableDoctors(newDoctors);
      setAvailableLocations(newLocations);
      setCategories(newCategories);

      showAlertPopup('Data imported successfully!');
    } catch (error) {
      showAlertPopup('Error importing file. Please ensure it matches the template format.');
    }
  };

  const exportTemplate = () => {
    const wb = XLSX.utils.book_new();

    const typeSheet = XLSX.utils.json_to_sheet([{ type: '' }]);
    const purposeSheet = XLSX.utils.json_to_sheet([{ purpose: '' }]);
    const doctorSheet = XLSX.utils.json_to_sheet([{ doctor: '' }]);
    const locationSheet = XLSX.utils.json_to_sheet([{ location: '' }]);
    const categorySheet = XLSX.utils.json_to_sheet([{ Category: '', Values: '' }]);

    XLSX.utils.book_append_sheet(wb, typeSheet, 'Appointment Type');
    XLSX.utils.book_append_sheet(wb, purposeSheet, 'Appointment Purpose');
    XLSX.utils.book_append_sheet(wb, doctorSheet, 'Doctor');
    XLSX.utils.book_append_sheet(wb, locationSheet, 'Location');
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');

    const fileName = 'appointment_import_template.xlsx';
    XLSX.writeFile(wb, fileName);
    showAlertPopup('Empty template exported! Fill in the data and import it back to start mapping.');
  };

  const exportMappingConfiguration = () => {
    if (!practiceName) {
      showAlertPopup('Please enter a practice name before exporting');
      return;
    }

    const wb = XLSX.utils.book_new();

    const mappedTypesData = mappedAppointmentTypes.map(item => {
      const row = { type: item.value };
      categories.forEach(cat => {
        row[cat.Category] = item.categories?.[cat.Category] || '';
      });
      row.notes = item.notes || '';
      return row;
    });
    const typeSheet = XLSX.utils.json_to_sheet(mappedTypesData);
    
    const mappedPurposesData = mappedAppointmentPurposes.map(item => {
      const row = { purpose: item.value };
      categories.forEach(cat => {
        row[cat.Category] = item.categories?.[cat.Category] || '';
      });
      row.notes = item.notes || '';
      return row;
    });
    const purposeSheet = XLSX.utils.json_to_sheet(mappedPurposesData);
    
    const mappedDoctorsData = mappedDoctors.map(item => {
      const row = { doctor: item.value };
      categories.forEach(cat => {
        row[cat.Category] = item.categories?.[cat.Category] || '';
      });
      row.notes = item.notes || '';
      return row;
    });
    const doctorSheet = XLSX.utils.json_to_sheet(mappedDoctorsData);
    
    const mappedLocationsData = mappedLocations.map(item => {
      const row = { location: item.value };
      categories.forEach(cat => {
        row[cat.Category] = item.categories?.[cat.Category] || '';
      });
      row.notes = item.notes || '';
      return row;
    });
    const locationSheet = XLSX.utils.json_to_sheet(mappedLocationsData);
    
    const categorySheet = XLSX.utils.json_to_sheet(categories);

    XLSX.utils.book_append_sheet(wb, typeSheet, 'Appointment Type');
    XLSX.utils.book_append_sheet(wb, purposeSheet, 'Appointment Purpose');
    XLSX.utils.book_append_sheet(wb, doctorSheet, 'Doctor');
    XLSX.utils.book_append_sheet(wb, locationSheet, 'Location');
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');

    const fileName = `${practiceName.replace(/[^a-z0-9]/gi, '_')}_mapping_config.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    const totalMappings = mappedAppointmentTypes.length + mappedAppointmentPurposes.length + 
                          mappedDoctors.length + mappedLocations.length;
    showAlertPopup(`Mapping configuration exported successfully!\nFile: ${fileName}\nTotal mappings: ${totalMappings}`);
  };

  const showAlertPopup = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const getCategoryOptions = (categoryName) => {
    const category = categories.find(c => c.Category === categoryName);
    return category ? category.Values.split(',').map(v => v.trim()) : [];
  };

  const toggleSelectItem = (value) => {
    setSelectedItems(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleSelectAll = () => {
    const currentData = getCurrentData();
    const allItems = [...currentData.available];
    if (selectedItems.length === allItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItems);
    }
  };

  const openMassEdit = () => {
    if (selectedItems.length === 0) {
      showAlertPopup('Please select at least one item to edit');
      return;
    }
    setMassEditCategories({});
    setShowMassEditModal(true);
  };

  const applyMassEdit = () => {
    if (selectedItems.length === 0) {
      showAlertPopup('No items selected');
      return;
    }

    let currentMapped = [];
    switch(activeTab) {
      case 'appointmentTypes':
        currentMapped = [...mappedAppointmentTypes];
        break;
      case 'appointmentPurposes':
        currentMapped = [...mappedAppointmentPurposes];
        break;
      case 'doctors':
        currentMapped = [...mappedDoctors];
        break;
      case 'locations':
        currentMapped = [...mappedLocations];
        break;
      default:
        break;
    }

    selectedItems.forEach(value => {
      const existingIndex = currentMapped.findIndex(m => m.value === value);
      
      if (existingIndex >= 0) {
        const updatedCategories = { ...currentMapped[existingIndex].categories };
        Object.entries(massEditCategories).forEach(([cat, val]) => {
          if (cat !== 'notes' && val !== '') {
            updatedCategories[cat] = val;
          }
        });
        currentMapped[existingIndex] = {
          ...currentMapped[existingIndex],
          categories: updatedCategories,
          notes: massEditCategories.notes !== undefined && massEditCategories.notes !== '' 
            ? massEditCategories.notes 
            : currentMapped[existingIndex].notes || ''
        };
      } else {
        const newCategories = { ...massEditCategories };
        delete newCategories.notes;
        currentMapped.push({
          value: value,
          categories: newCategories,
          notes: massEditCategories.notes || ''
        });
      }
    });

    switch(activeTab) {
      case 'appointmentTypes':
        setMappedAppointmentTypes(currentMapped);
        break;
      case 'appointmentPurposes':
        setMappedAppointmentPurposes(currentMapped);
        break;
      case 'doctors':
        setMappedDoctors(currentMapped);
        break;
      case 'locations':
        setMappedLocations(currentMapped);
        break;
      default:
        break;
    }

    setShowMassEditModal(false);
    setSelectedItems([]);
    showAlertPopup(`Successfully mapped/updated ${selectedItems.length} item(s)`);
  };

  const massDelete = () => {
    if (!selectedItems || selectedItems.length === 0) {
      showAlertPopup('Please select at least one item to delete');
      return;
    }

    const itemCount = selectedItems.length;

    showConfirmation(
      `Are you sure you want to delete ${itemCount} selected item(s)? This will remove them from the list.`,
      () => {
        if (activeTab === 'appointmentTypes') {
          setMappedAppointmentTypes(mappedAppointmentTypes.filter(m => !selectedItems.includes(m.value)));
          setAvailableAppointmentTypes(availableAppointmentTypes.filter(v => !selectedItems.includes(v)));
        } else if (activeTab === 'appointmentPurposes') {
          setMappedAppointmentPurposes(mappedAppointmentPurposes.filter(m => !selectedItems.includes(m.value)));
          setAvailableAppointmentPurposes(availableAppointmentPurposes.filter(v => !selectedItems.includes(v)));
        } else if (activeTab === 'doctors') {
          setMappedDoctors(mappedDoctors.filter(m => !selectedItems.includes(m.value)));
          setAvailableDoctors(availableDoctors.filter(v => !selectedItems.includes(v)));
        } else if (activeTab === 'locations') {
          setMappedLocations(mappedLocations.filter(m => !selectedItems.includes(m.value)));
          setAvailableLocations(availableLocations.filter(v => !selectedItems.includes(v)));
        }

        setSelectedItems([]);
        showAlertPopup(`Successfully deleted ${itemCount} item(s)`);
      }
    );
  };

  const deleteMapping = (value) => {
    showConfirmation(
      `Are you sure you want to delete "${value}"? This will remove it from the list.`,
      () => {
        switch(activeTab) {
          case 'appointmentTypes':
            setMappedAppointmentTypes(mappedAppointmentTypes.filter(m => m.value !== value));
            setAvailableAppointmentTypes(availableAppointmentTypes.filter(v => v !== value));
            break;
          case 'appointmentPurposes':
            setMappedAppointmentPurposes(mappedAppointmentPurposes.filter(m => m.value !== value));
            setAvailableAppointmentPurposes(availableAppointmentPurposes.filter(v => v !== value));
            break;
          case 'doctors':
            setMappedDoctors(mappedDoctors.filter(m => m.value !== value));
            setAvailableDoctors(availableDoctors.filter(v => v !== value));
            break;
          case 'locations':
            setMappedLocations(mappedLocations.filter(m => m.value !== value));
            setAvailableLocations(availableLocations.filter(v => v !== value));
            break;
          default:
            break;
        }
      }
    );
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      showAlertPopup('Please enter a category name');
      return;
    }
    if (!newCategoryValues.trim()) {
      showAlertPopup('Please enter at least one category value');
      return;
    }
    if (categories.find(c => c.Category === newCategoryName.trim())) {
      showAlertPopup('A category with this name already exists');
      return;
    }

    const newCategory = {
      Category: newCategoryName.trim(),
      Values: newCategoryValues.trim()
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryValues('');
    setShowAddCategoryModal(false);
    showAlertPopup(`Category "${newCategory.Category}" added successfully!`);
  };

  const deleteCategory = (categoryName) => {
    showConfirmation(
      `Are you sure you want to delete the category "${categoryName}"? This will remove it from all mappings.`,
      () => {
        setCategories(categories.filter(c => c.Category !== categoryName));
        
        const removeCategoryFromMappings = (mappings) => {
          return mappings.map(item => {
            const newCategories = { ...item.categories };
            delete newCategories[categoryName];
            return { ...item, categories: newCategories };
          });
        };

        setMappedAppointmentTypes(removeCategoryFromMappings(mappedAppointmentTypes));
        setMappedAppointmentPurposes(removeCategoryFromMappings(mappedAppointmentPurposes));
        setMappedDoctors(removeCategoryFromMappings(mappedDoctors));
        setMappedLocations(removeCategoryFromMappings(mappedLocations));

        showAlertPopup(`Category "${categoryName}" deleted successfully!`);
      }
    );
  };

  const editCategoryValues = (categoryName, currentValues) => {
    const newValues = prompt(`Edit values for "${categoryName}" (comma-separated):`, currentValues);
    if (newValues !== null && newValues.trim() !== '') {
      setCategories(categories.map(c => 
        c.Category === categoryName 
          ? { ...c, Values: newValues.trim() }
          : c
      ));
      showAlertPopup(`Category "${categoryName}" values updated successfully!`);
    }
  };

  const saveAllConfiguration = () => {
    if (!practiceName) {
      setPracticeNameError(true);
      setTimeout(() => setPracticeNameError(false), 3000);
      showAlertPopup('Practice Name is required! Please enter a practice name before saving.');
      return;
    }

    const config = {
      practiceName,
      mappedAppointmentTypes,
      mappedAppointmentPurposes,
      mappedDoctors,
      mappedLocations,
      categories
    };
    
    const totalMappings = mappedAppointmentTypes.length + mappedAppointmentPurposes.length + 
                          mappedDoctors.length + mappedLocations.length;
    
    console.log('Saved Configuration:', config);
    
    setConfigSaved(true);
    setPracticeNameError(false);
    setTimeout(() => setConfigSaved(false), 5000);
    showAlertPopup(`✓ Configuration saved successfully!\n\nPractice Name: ${practiceName}\nTotal Mappings: ${totalMappings}\n  - Appointment Types: ${mappedAppointmentTypes.length}\n  - Appointment Purposes: ${mappedAppointmentPurposes.length}\n  - Doctors/Providers: ${mappedDoctors.length}\n  - Locations: ${mappedLocations.length}`);
  };

  const resetMappings = () => {
    showConfirmation(
      'Are you sure you want to reset all mappings? This will clear all category assignments but keep your imported data and categories.',
      () => {
        setMappedAppointmentTypes([]);
        setMappedAppointmentPurposes([]);
        setMappedDoctors([]);
        setMappedLocations([]);
        setSelectedItems([]);
        showAlertPopup('All mappings have been reset successfully!');
      }
    );
  };

  const resetForm = () => {
    showConfirmation(
      'Are you sure you want to reset the entire form? This will clear ALL data including imported items, mappings, and categories. This action cannot be undone!',
      () => {
        setPracticeName('');
        setAvailableAppointmentTypes([]);
        setAvailableAppointmentPurposes([]);
        setAvailableDoctors([]);
        setAvailableLocations([]);
        setMappedAppointmentTypes([]);
        setMappedAppointmentPurposes([]);
        setMappedDoctors([]);
        setMappedLocations([]);
        setCategories([]);
        setSelectedItems([]);
        setPracticeNameSaved(false);
        setPracticeNameError(false);
        setConfigSaved(false);
        showAlertPopup('Form has been completely reset!');
      }
    );
  };

  const getCurrentData = () => {
    switch(activeTab) {
      case 'appointmentTypes':
        return { 
          available: availableAppointmentTypes, 
          mapped: mappedAppointmentTypes,
          title: 'Appointment Types',
          label: 'Appointment Type'
        };
      case 'appointmentPurposes':
        return { 
          available: availableAppointmentPurposes, 
          mapped: mappedAppointmentPurposes,
          title: 'Appointment Purposes',
          label: 'Appointment Purpose'
        };
      case 'doctors':
        return { 
          available: availableDoctors, 
          mapped: mappedDoctors,
          title: 'Doctors/Providers',
          label: 'Doctor/Provider'
        };
      case 'locations':
        return { 
          available: availableLocations, 
          mapped: mappedLocations,
          title: 'Locations',
          label: 'Location'
        };
      default:
        return { available: [], mapped: [], title: '', label: '' };
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
	{showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Action</h3>
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="whitespace-pre-line text-gray-800 mb-4">
              {alertMessage}
            </div>
            <button
              onClick={closeAlert}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showMassEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Mass Map/Edit ({selectedItems.length} items)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set category values for all selected items. This will create mappings for unmapped items and update existing ones.
            </p>
            <div className="space-y-4 mb-6">
              {categories.map(category => (
                <div key={category.Category}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {category.Category}
                  </label>
                  <select
                    value={massEditCategories[category.Category] || ''}
                    onChange={(e) => setMassEditCategories({ 
                      ...massEditCategories, 
                      [category.Category]: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select value...</option>
                    {getCategoryOptions(category.Category).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={massEditCategories.notes || ''}
                  onChange={(e) => setMassEditCategories({ 
                    ...massEditCategories, 
                    notes: e.target.value 
                  })}
                  placeholder="Add notes for all selected items..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing notes unchanged</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={applyMassEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply to Selected
              </button>
              <button
                onClick={() => setShowMassEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Add New Category
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Priority, Type, Status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Values * (comma-separated)
              </label>
              <textarea
                value={newCategoryValues}
                onChange={(e) => setNewCategoryValues(e.target.value)}
                placeholder="e.g., High, Medium, Low"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addCategory}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Category
              </button>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryValues('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Integration Mapping Configuration
          </h1>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Practice Name *
            </label>
            <input
              type="text"
              value={practiceName}
              onChange={(e) => {
                setPracticeName(e.target.value);
                setPracticeNameSaved(false);
                setPracticeNameError(false);
              }}
              onBlur={() => {
                if (practiceName) {
                  setPracticeNameSaved(true);
                  setTimeout(() => setPracticeNameSaved(false), 3000);
                }
              }}
              placeholder="Enter practice name (used in export filename)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                practiceNameError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {practiceNameSaved && (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <span>✓</span>
                <span>Practice name saved: {practiceName}</span>
              </div>
            )}
            {practiceNameError && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span>
                <span>Practice Name is required!</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload size={20} />
              Import Integration Mapping
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={exportTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Download size={20} />
              Export Template
            </button>
            <button
              onClick={exportMappingConfiguration}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Download size={20} />
              Export Mapping Configuration
            </button>
            <div className="flex-1"></div>
            <button
              onClick={resetMappings}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <X size={20} />
              Reset Mappings
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 size={20} />
              Reset Form
            </button>
            <button
              onClick={saveAllConfiguration}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save size={20} />
              Save Configuration
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => {
                setActiveView('list');
                setSelectedItems([]);
              }}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeView === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Item Mappings
            </button>
            <button
              onClick={() => setActiveView('categories')}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeView === 'categories'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings size={18} />
                Category Management ({categories.length})
              </div>
            </button>
          </div>

          {activeView === 'categories' ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Manage Categories</h2>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Category
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No categories defined yet</p>
                  <p className="text-gray-400 text-sm mb-6">Categories help you organize and classify your mappings</p>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus size={20} />
                    Create Your First Category
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">{category.Category}</h3>
                          <p className="text-sm text-gray-600">
                            {category.Values.split(',').length} value(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCategoryValues(category.Category, category.Values)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCategory(category.Category)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.Values.split(',').map((val, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
                            {val.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex border-b overflow-x-auto bg-gray-50">
                <button
                  onClick={() => {
                    setActiveTab('appointmentTypes');
                    setSelectedItems([]);
                  }}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'appointmentTypes'
                      ? 'border-b-2 border-green-600 text-green-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Appointment Types
                  <span className="ml-2 text-sm">({mappedAppointmentTypes.length}/{availableAppointmentTypes.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('appointmentPurposes');
                    setSelectedItems([]);
                  }}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'appointmentPurposes'
                      ? 'border-b-2 border-green-600 text-green-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Appointment Purposes
                  <span className="ml-2 text-sm">({mappedAppointmentPurposes.length}/{availableAppointmentPurposes.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('doctors');
                    setSelectedItems([]);
                  }}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'doctors'
                      ? 'border-b-2 border-green-600 text-green-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Doctors/Providers
                  <span className="ml-2 text-sm">({mappedDoctors.length}/{availableDoctors.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setSelectedItems([]);
                  }}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'locations'
                      ? 'border-b-2 border-green-600 text-green-600 bg-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Locations
                  <span className="ml-2 text-sm">({mappedLocations.length}/{availableLocations.length})</span>
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">{currentData.title}</h2>
                  {selectedItems.length > 0 && (
                    <div className="flex gap-2">
                      <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        {selectedItems.length} selected
                      </span>
                      <button
                        onClick={openMassEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Edit size={18} />
                        Map/Edit Selected
                      </button>
                      <button
                        onClick={massDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                        Delete Selected
                      </button>
                    </div>
                  )}
                </div>

                {currentData.available.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No items imported yet</p>
                    <p className="text-gray-400 text-sm">Import data using the button above to get started</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === currentData.available.length && currentData.available.length > 0}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{currentData.label}</th>
                          {categories.map(category => (
                            <th key={category.Category} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              {category.Category}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.available.map((value, index) => {
                          const existingMapping = currentData.mapped.find(m => m.value === value);
                          const isMapped = existingMapping !== undefined;
                          
                          return (
                            <tr 
                              key={index} 
                              className={`border-t border-gray-200 hover:bg-gray-100 transition-colors ${
                                selectedItems.includes(value) ? 'bg-blue-50' : ''
                              } ${isMapped ? 'bg-green-50' : ''}`}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(value)}
                                  onChange={() => toggleSelectItem(value)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-3">
                                {isMapped ? (
                                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-md text-xs font-medium">
                                    Mapped
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md text-xs font-medium">
                                    Unmapped
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-800">{value}</td>
                              {categories.map(category => (
                                <td key={category.Category} className="px-4 py-3">
                                  <select
                                    value={existingMapping?.categories?.[category.Category] || ''}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      if (existingMapping) {
                                        const updatedCategories = { ...existingMapping.categories, [category.Category]: newValue };
                                        switch(activeTab) {
                                          case 'appointmentTypes':
                                            setMappedAppointmentTypes(mappedAppointmentTypes.map(m => 
                                              m.value === value ? { ...m, categories: updatedCategories } : m
                                            ));
                                            break;
                                          case 'appointmentPurposes':
                                            setMappedAppointmentPurposes(mappedAppointmentPurposes.map(m => 
                                              m.value === value ? { ...m, categories: updatedCategories } : m
                                            ));
                                            break;
                                          case 'doctors':
                                            setMappedDoctors(mappedDoctors.map(m => 
                                              m.value === value ? { ...m, categories: updatedCategories } : m
                                            ));
                                            break;
                                          case 'locations':
                                            setMappedLocations(mappedLocations.map(m => 
                                              m.value === value ? { ...m, categories: updatedCategories } : m
                                            ));
                                            break;
                                          default:
                                            break;
                                        }
                                      } else {
                                        const newMapping = {
                                          value: value,
                                          categories: { [category.Category]: newValue },
                                          notes: ''
                                        };
                                        switch(activeTab) {
                                          case 'appointmentTypes':
                                            setMappedAppointmentTypes([...mappedAppointmentTypes, newMapping]);
                                            break;
                                          case 'appointmentPurposes':
                                            setMappedAppointmentPurposes([...mappedAppointmentPurposes, newMapping]);
                                            break;
                                          case 'doctors':
                                            setMappedDoctors([...mappedDoctors, newMapping]);
                                            break;
                                          case 'locations':
                                            setMappedLocations([...mappedLocations, newMapping]);
                                            break;
                                          default:
                                            break;
                                        }
                                      }
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select...</option>
                                    {getCategoryOptions(category.Category).map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={existingMapping?.notes || ''}
                                  onChange={(e) => {
                                    const newNote = e.target.value;
                                    if (existingMapping) {
                                      switch(activeTab) {
                                        case 'appointmentTypes':
                                          setMappedAppointmentTypes(mappedAppointmentTypes.map(m => 
                                            m.value === value ? { ...m, notes: newNote } : m
                                          ));
                                          break;
                                        case 'appointmentPurposes':
                                          setMappedAppointmentPurposes(mappedAppointmentPurposes.map(m => 
                                            m.value === value ? { ...m, notes: newNote } : m
                                          ));
                                          break;
                                        case 'doctors':
                                          setMappedDoctors(mappedDoctors.map(m => 
                                            m.value === value ? { ...m, notes: newNote } : m
                                          ));
                                          break;
                                        case 'locations':
                                          setMappedLocations(mappedLocations.map(m => 
                                            m.value === value ? { ...m, notes: newNote } : m
                                          ));
                                          break;
                                        default:
                                          break;
                                      }
                                    } else if (newNote) {
                                      const newMapping = {
                                        value: value,
                                        categories: {},
                                        notes: newNote
                                      };
                                      switch(activeTab) {
                                        case 'appointmentTypes':
                                          setMappedAppointmentTypes([...mappedAppointmentTypes, newMapping]);
                                          break;
                                        case 'appointmentPurposes':
                                          setMappedAppointmentPurposes([...mappedAppointmentPurposes, newMapping]);
                                          break;
                                        case 'doctors':
                                          setMappedDoctors([...mappedDoctors, newMapping]);
                                          break;
                                        case 'locations':
                                          setMappedLocations([...mappedLocations, newMapping]);
                                          break;
                                        default:
                                          break;
                                      }
                                    }
                                  }}
                                  placeholder="Add notes..."
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => deleteMapping(value)}
                                  className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {configSaved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-green-800 font-medium mb-2">✓ Configuration saved successfully!</div>
            <div className="text-sm text-green-700">
              <div>Practice Name: <strong>{practiceName}</strong></div>
              <div className="mt-1">Total Mappings: <strong>{mappedAppointmentTypes.length + mappedAppointmentPurposes.length + mappedDoctors.length + mappedLocations.length}</strong></div>
              <div className="ml-4 mt-1">
                <div>• Appointment Types: {mappedAppointmentTypes.length}</div>
                <div>• Appointment Purposes: {mappedAppointmentPurposes.length}</div>
                <div>• Doctors/Providers: {mappedDoctors.length}</div>
                <div>• Locations: {mappedLocations.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}