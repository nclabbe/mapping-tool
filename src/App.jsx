import React, { useState } from 'react';
import { Save, Upload, Download, Plus, Trash2, Edit, Settings, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  const [practiceName, setPracticeName] = useState('');
  const [categories, setCategories] = useState([]);
  const [availableAppointmentTypes, setAvailableAppointmentTypes] = useState([]);
  const [availableAppointmentPurposes, setAvailableAppointmentPurposes] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [mappedAppointmentTypes, setMappedAppointmentTypes] = useState([]);
  const [mappedAppointmentPurposes, setMappedAppointmentPurposes] = useState([]);
  const [mappedDoctors, setMappedDoctors] = useState([]);
  const [mappedLocations, setMappedLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('appointmentTypes');
  const [activeView, setActiveView] = useState('list');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showMassEditModal, setShowMassEditModal] = useState(false);
  const [massEditCategories, setMassEditCategories] = useState({});
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryValues, setNewCategoryValues] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const types = XLSX.utils.sheet_to_json(workbook.Sheets['Appointment Type']).map(row => ({ id: row.id || '', name: row.type })).filter(item => item.name);
      const purposes = XLSX.utils.sheet_to_json(workbook.Sheets['Appointment Purpose']).map(row => ({ id: row.id || '', name: row.purpose })).filter(item => item.name);
      const doctors = XLSX.utils.sheet_to_json(workbook.Sheets['Doctor']).map(row => ({ id: row.id || '', name: row.doctor })).filter(item => item.name);
      const locations = XLSX.utils.sheet_to_json(workbook.Sheets['Location']).map(row => ({ id: row.id || '', name: row.location })).filter(item => item.name);
      const cats = XLSX.utils.sheet_to_json(workbook.Sheets['Categories']);
      setAvailableAppointmentTypes(types);
      setAvailableAppointmentPurposes(purposes);
      setAvailableDoctors(doctors);
      setAvailableLocations(locations);
      setCategories(cats);
      setAlertMessage('Data imported successfully!');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Error importing file');
      setShowAlert(true);
    }
  };

  const exportTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ id: '', type: '' }]), 'Appointment Type');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ id: '', purpose: '' }]), 'Appointment Purpose');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ id: '', doctor: '' }]), 'Doctor');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ id: '', location: '' }]), 'Location');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Category: '', Values: '' }]), 'Categories');
    XLSX.writeFile(wb, 'template.xlsx');
  };

  const exportConfig = () => {
    if (!practiceName) { setAlertMessage('Enter practice name first'); setShowAlert(true); return; }
    const wb = XLSX.utils.book_new();
    const types = mappedAppointmentTypes.map(item => {
      const row = { id: item.id || '', type: item.value };
      categories.forEach(cat => { row[cat.Category] = item.categories?.[cat.Category] || ''; });
      row['Cancel/No-Show Rules'] = item.cancelNoShowRules ? 'Yes' : 'No';
      row['Booking Rule'] = item.bookingRule ? 'Yes' : 'No';
      row.notes = item.notes || '';
      return row;
    });
    const purposes = mappedAppointmentPurposes.map(item => {
      const row = { id: item.id || '', purpose: item.value };
      categories.forEach(cat => { row[cat.Category] = item.categories?.[cat.Category] || ''; });
      row['Cancel/No-Show Rules'] = item.cancelNoShowRules ? 'Yes' : 'No';
      row['Booking Rule'] = item.bookingRule ? 'Yes' : 'No';
      row.notes = item.notes || '';
      return row;
    });
    const docs = mappedDoctors.map(item => {
      const row = { id: item.id || '', doctor: item.value };
      categories.forEach(cat => { row[cat.Category] = item.categories?.[cat.Category] || ''; });
      row.notes = item.notes || '';
      return row;
    });
    const locs = mappedLocations.map(item => {
      const row = { id: item.id || '', location: item.value };
      categories.forEach(cat => { row[cat.Category] = item.categories?.[cat.Category] || ''; });
      row.notes = item.notes || '';
      return row;
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(types), 'Appointment Type');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purposes), 'Appointment Purpose');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docs), 'Doctor');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(locs), 'Location');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categories), 'Categories');
    XLSX.writeFile(wb, `${practiceName.replace(/[^a-z0-9]/gi, '_')}_config.xlsx`);
  };

  const updateMapping = (value, categoryName, newValue, itemId) => {
    const updateFn = (mapped, setMapped) => {
      const existing = mapped.find(m => m.value === value);
      if (existing) {
        setMapped(mapped.map(m => m.value === value ? { ...m, categories: { ...m.categories, [categoryName]: newValue } } : m));
      } else {
        setMapped([...mapped, { id: itemId, value, categories: { [categoryName]: newValue }, notes: '', cancelNoShowRules: false, bookingRule: false }]);
      }
    };
    if (activeTab === 'appointmentTypes') updateFn(mappedAppointmentTypes, setMappedAppointmentTypes);
    else if (activeTab === 'appointmentPurposes') updateFn(mappedAppointmentPurposes, setMappedAppointmentPurposes);
    else if (activeTab === 'doctors') updateFn(mappedDoctors, setMappedDoctors);
    else if (activeTab === 'locations') updateFn(mappedLocations, setMappedLocations);
  };

  const updateNotes = (value, notes) => {
    const updateFn = (mapped, setMapped, available) => {
      const existing = mapped.find(m => m.value === value);
      const sourceItem = available.find(item => (typeof item === 'string' ? item : item.name) === value);
      const itemId = typeof sourceItem === 'string' ? '' : (sourceItem?.id || '');
      if (existing) {
        setMapped(mapped.map(m => m.value === value ? { ...m, notes } : m));
      } else if (notes) {
        setMapped([...mapped, { id: itemId, value, categories: {}, notes, cancelNoShowRules: false, bookingRule: false }]);
      }
    };
    if (activeTab === 'appointmentTypes') updateFn(mappedAppointmentTypes, setMappedAppointmentTypes, availableAppointmentTypes);
    else if (activeTab === 'appointmentPurposes') updateFn(mappedAppointmentPurposes, setMappedAppointmentPurposes, availableAppointmentPurposes);
    else if (activeTab === 'doctors') updateFn(mappedDoctors, setMappedDoctors, availableDoctors);
    else if (activeTab === 'locations') updateFn(mappedLocations, setMappedLocations, availableLocations);
  };

  const updateCheckbox = (value, field, checked) => {
    const updateFn = (mapped, setMapped, available) => {
      const existing = mapped.find(m => m.value === value);
      const sourceItem = available.find(item => (typeof item === 'string' ? item : item.name) === value);
      const itemId = typeof sourceItem === 'string' ? '' : (sourceItem?.id || '');
      if (existing) {
        setMapped(mapped.map(m => m.value === value ? { ...m, [field]: checked } : m));
      } else {
        setMapped([...mapped, { id: itemId, value, categories: {}, notes: '', cancelNoShowRules: field === 'cancelNoShowRules' ? checked : false, bookingRule: field === 'bookingRule' ? checked : false }]);
      }
    };
    if (activeTab === 'appointmentTypes') updateFn(mappedAppointmentTypes, setMappedAppointmentTypes, availableAppointmentTypes);
    else if (activeTab === 'appointmentPurposes') updateFn(mappedAppointmentPurposes, setMappedAppointmentPurposes, availableAppointmentPurposes);
  };

  const toggleSelectItem = (itemName) => {
    setSelectedItems(prev => prev.includes(itemName) ? prev.filter(v => v !== itemName) : [...prev, itemName]);
  };

  const toggleSelectAll = () => {
    const allItems = data.available.map(item => typeof item === 'string' ? item : item.name);
    setSelectedItems(selectedItems.length === allItems.length ? [] : allItems);
  };

  const applyMassEdit = () => {
    if (selectedItems.length === 0) return;
    const updateFn = (mapped, setMapped, available) => {
      const updated = [...mapped];
      selectedItems.forEach(itemName => {
        const sourceItem = available.find(item => (typeof item === 'string' ? item : item.name) === itemName);
        const itemId = typeof sourceItem === 'string' ? '' : (sourceItem?.id || '');
        const existingIdx = updated.findIndex(m => m.value === itemName);
        if (existingIdx >= 0) {
          const updatedCats = { ...updated[existingIdx].categories };
          Object.entries(massEditCategories).forEach(([cat, val]) => {
            if (cat !== 'notes' && cat !== 'cancelNoShowRules' && cat !== 'bookingRule' && val !== '') {
              updatedCats[cat] = val;
            }
          });
          updated[existingIdx] = {
            ...updated[existingIdx],
            categories: updatedCats,
            notes: massEditCategories.notes !== undefined && massEditCategories.notes !== '' ? massEditCategories.notes : updated[existingIdx].notes || '',
            cancelNoShowRules: massEditCategories.cancelNoShowRules !== undefined ? massEditCategories.cancelNoShowRules : updated[existingIdx].cancelNoShowRules || false,
            bookingRule: massEditCategories.bookingRule !== undefined ? massEditCategories.bookingRule : updated[existingIdx].bookingRule || false
          };
        } else {
          const newCats = { ...massEditCategories };
          delete newCats.notes;
          delete newCats.cancelNoShowRules;
          delete newCats.bookingRule;
          updated.push({
            id: itemId,
            value: itemName,
            categories: newCats,
            notes: massEditCategories.notes || '',
            cancelNoShowRules: massEditCategories.cancelNoShowRules || false,
            bookingRule: massEditCategories.bookingRule || false
          });
        }
      });
      setMapped(updated);
    };
    if (activeTab === 'appointmentTypes') updateFn(mappedAppointmentTypes, setMappedAppointmentTypes, availableAppointmentTypes);
    else if (activeTab === 'appointmentPurposes') updateFn(mappedAppointmentPurposes, setMappedAppointmentPurposes, availableAppointmentPurposes);
    else if (activeTab === 'doctors') updateFn(mappedDoctors, setMappedDoctors, availableDoctors);
    else if (activeTab === 'locations') updateFn(mappedLocations, setMappedLocations, availableLocations);
    setShowMassEditModal(false);
    setSelectedItems([]);
    setMassEditCategories({});
    setAlertMessage(`Successfully updated ${selectedItems.length} item(s)`);
    setShowAlert(true);
  };

  const massDelete = () => {
    if (selectedItems.length === 0) return;
    const updateFn = (mapped, setMapped, available, setAvailable) => {
      setMapped(mapped.filter(m => !selectedItems.includes(m.value)));
      setAvailable(available.filter(item => !selectedItems.includes(typeof item === 'string' ? item : item.name)));
    };
    if (activeTab === 'appointmentTypes') updateFn(mappedAppointmentTypes, setMappedAppointmentTypes, availableAppointmentTypes, setAvailableAppointmentTypes);
    else if (activeTab === 'appointmentPurposes') updateFn(mappedAppointmentPurposes, setMappedAppointmentPurposes, availableAppointmentPurposes, setAvailableAppointmentPurposes);
    else if (activeTab === 'doctors') updateFn(mappedDoctors, setMappedDoctors, availableDoctors, setAvailableDoctors);
    else if (activeTab === 'locations') updateFn(mappedLocations, setMappedLocations, availableLocations, setAvailableLocations);
    setAlertMessage(`Successfully deleted ${selectedItems.length} item(s)`);
    setShowAlert(true);
    setSelectedItems([]);
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmDialog(true);
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
        setAlertMessage('All mappings have been reset successfully!');
        setShowAlert(true);
        setShowConfirmDialog(false);
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
        setAlertMessage('Form has been completely reset!');
        setShowAlert(true);
        setShowConfirmDialog(false);
      }
    );
  };

  const getData = () => {
    if (activeTab === 'appointmentTypes') return { available: availableAppointmentTypes, mapped: mappedAppointmentTypes, label: 'Appointment Type' };
    if (activeTab === 'appointmentPurposes') return { available: availableAppointmentPurposes, mapped: mappedAppointmentPurposes, label: 'Appointment Purpose' };
    if (activeTab === 'doctors') return { available: availableDoctors, mapped: mappedDoctors, label: 'Doctor' };
    if (activeTab === 'locations') return { available: availableLocations, mapped: mappedLocations, label: 'Location' };
    return { available: [], mapped: [], label: '' };
  };

  const data = getData();
  const showCheckboxes = activeTab === 'appointmentTypes' || activeTab === 'appointmentPurposes';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Action</h3>
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Yes, Proceed
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-gray-800 mb-4">{alertMessage}</div>
            <button onClick={() => setShowAlert(false)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">OK</button>
          </div>
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Add Category</h3>
            <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" className="w-full px-3 py-2 border rounded mb-3" />
            <textarea value={newCategoryValues} onChange={(e) => setNewCategoryValues(e.target.value)} placeholder="Values (comma-separated)" rows={3} className="w-full px-3 py-2 border rounded mb-4" />
            <div className="flex gap-3">
              <button onClick={() => {
                if (newCategoryName.trim() && newCategoryValues.trim()) {
                  setCategories([...categories, { Category: newCategoryName.trim(), Values: newCategoryValues.trim() }]);
                  setNewCategoryName('');
                  setNewCategoryValues('');
                  setShowAddCategoryModal(false);
                }
              }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add</button>
              <button onClick={() => { setShowAddCategoryModal(false); setNewCategoryName(''); setNewCategoryValues(''); }} className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showMassEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Mass Edit ({selectedItems.length} items)</h3>
            <p className="text-sm text-gray-600 mb-4">Set values for all selected items</p>
            <div className="space-y-4 mb-6">
              {categories.map(cat => (
                <div key={cat.Category}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{cat.Category}</label>
                  <select
                    value={massEditCategories[cat.Category] || ''}
                    onChange={(e) => setMassEditCategories({ ...massEditCategories, [cat.Category]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select...</option>
                    {cat.Values.split(',').map(v => (
                      <option key={v.trim()} value={v.trim()}>{v.trim()}</option>
                    ))}
                  </select>
                </div>
              ))}
              {showCheckboxes && (
                <>
                  <div className="border-t pt-4">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={massEditCategories.cancelNoShowRules || false}
                        onChange={(e) => setMassEditCategories({ ...massEditCategories, cancelNoShowRules: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Cancel/No-Show Rules
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={massEditCategories.bookingRule || false}
                        onChange={(e) => setMassEditCategories({ ...massEditCategories, bookingRule: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Booking Rule
                    </label>
                  </div>
                </>
              )}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={massEditCategories.notes || ''}
                  onChange={(e) => setMassEditCategories({ ...massEditCategories, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={applyMassEdit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply to Selected</button>
              <button onClick={() => { setShowMassEditModal(false); setMassEditCategories({}); }} className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Integration Mapping Tool</h1>
          <input value={practiceName} onChange={(e) => setPracticeName(e.target.value)} placeholder="Practice Name *" className="w-full px-3 py-2 border rounded mb-4" />
          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
              <Upload size={20} />Import
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={exportTemplate} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              <Download size={20} />Template
            </button>
            <button onClick={exportConfig} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              <Download size={20} />Export Config
            </button>
            <div className="flex-1"></div>
            <button onClick={resetMappings} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
              <X size={20} />Reset Mappings
            </button>
            <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              <Trash2 size={20} />Reset Form
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button onClick={() => setActiveView('list')} className={`px-4 py-3 font-medium ${activeView === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Mappings</button>
            <button onClick={() => setActiveView('categories')} className={`px-4 py-3 font-medium ${activeView === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2"><Settings size={18} />Categories ({categories.length})</div>
            </button>
          </div>

          {activeView === 'categories' ? (
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Manage Categories</h2>
                <button onClick={() => setShowAddCategoryModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  <Plus size={20} />Add Category
                </button>
              </div>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No categories yet</p>
                  <button onClick={() => setShowAddCategoryModal(true)} className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">Create First Category</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between mb-3">
                        <h3 className="font-semibold text-lg">{cat.Category}</h3>
                        <button onClick={() => setCategories(categories.filter((_, idx) => idx !== i))} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">Delete</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cat.Values.split(',').map((val, j) => (
                          <span key={j} className="px-3 py-1 bg-white border rounded-full text-sm">{val.trim()}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex border-b bg-gray-50 overflow-x-auto">
                <button onClick={() => { setActiveTab('appointmentTypes'); setSelectedItems([]); }} className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'appointmentTypes' ? 'border-b-2 border-green-600 text-green-600 bg-white' : 'text-gray-600'}`}>
                  Types ({mappedAppointmentTypes.length}/{availableAppointmentTypes.length})
                </button>
                <button onClick={() => { setActiveTab('appointmentPurposes'); setSelectedItems([]); }} className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'appointmentPurposes' ? 'border-b-2 border-green-600 text-green-600 bg-white' : 'text-gray-600'}`}>
                  Purposes ({mappedAppointmentPurposes.length}/{availableAppointmentPurposes.length})
                </button>
                <button onClick={() => { setActiveTab('doctors'); setSelectedItems([]); }} className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'doctors' ? 'border-b-2 border-green-600 text-green-600 bg-white' : 'text-gray-600'}`}>
                  Doctors ({mappedDoctors.length}/{availableDoctors.length})
                </button>
                <button onClick={() => { setActiveTab('locations'); setSelectedItems([]); }} className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'locations' ? 'border-b-2 border-green-600 text-green-600 bg-white' : 'text-gray-600'}`}>
                  Locations ({mappedLocations.length}/{availableLocations.length})
                </button>
              </div>

              <div className="p-6">
                {data.available.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No items imported yet</p>
                  </div>
                ) : (
                  <>
                    {selectedItems.length > 0 && (
                      <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded">
                        <span className="text-sm font-medium text-blue-800">{selectedItems.length} item(s) selected</span>
                        <div className="flex gap-2">
                          <button onClick={() => setShowMassEditModal(true)} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            <Edit size={16} />Map/Edit Selected
                          </button>
                          <button onClick={massDelete} className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                            <Trash2 size={16} />Delete Selected
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={selectedItems.length === data.available.length && data.available.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">{data.label}</th>
                            {categories.map(cat => (
                              <th key={cat.Category} className="px-4 py-3 text-left text-sm font-medium">{cat.Category}</th>
                            ))}
                            {showCheckboxes && (
                              <>
                                <th className="px-4 py-3 text-left text-sm font-medium">Cancel/No-Show</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Booking</th>
                              </>
                            )}
                            <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.available.map((item, idx) => {
                            const itemName = typeof item === 'string' ? item : item.name;
                            const itemId = typeof item === 'string' ? '' : item.id;
                            const mapping = data.mapped.find(m => m.value === itemName);
                            const isMapped = mapping !== undefined;
                            const isSelected = selectedItems.includes(itemName);
                            return (
                              <tr key={idx} className={`border-t hover:bg-gray-50 ${isMapped ? 'bg-green-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectItem(itemName)}
                                    className="w-4 h-4"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${isMapped ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                    {isMapped ? 'Mapped' : 'Unmapped'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{itemName}</td>
                                {categories.map(cat => (
                                  <td key={cat.Category} className="px-4 py-3">
                                    <select
                                      value={mapping?.categories?.[cat.Category] || ''}
                                      onChange={(e) => updateMapping(itemName, cat.Category, e.target.value, itemId)}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    >
                                      <option value="">Select...</option>
                                      {cat.Values.split(',').map(v => (
                                        <option key={v.trim()} value={v.trim()}>{v.trim()}</option>
                                      ))}
                                    </select>
                                  </td>
                                ))}
                                {showCheckboxes && (
                                  <>
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={mapping?.cancelNoShowRules || false}
                                        onChange={(e) => updateCheckbox(itemName, 'cancelNoShowRules', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={mapping?.bookingRule || false}
                                        onChange={(e) => updateCheckbox(itemName, 'bookingRule', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                    </td>
                                  </>
                                )}
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={mapping?.notes || ''}
                                    onChange={(e) => updateNotes(itemName, e.target.value)}
                                    placeholder="Add notes..."
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}