# Integration Mapping Configuration Tool

A comprehensive web-based tool for mapping and managing healthcare appointment data including appointment types, purposes, doctors/providers, and locations with customizable category assignments.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Functionality
- **Excel Import/Export** - Import data from Excel templates and export complete configurations
- **Inline Mapping** - Map items instantly with dropdown selections - no extra clicks needed
- **Multi-Select Operations** - Select multiple items and apply bulk edits or deletions
- **Custom Categories** - Create and manage unlimited custom categories with configurable values
- **Real-time Updates** - Changes are saved automatically as you work
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### Data Management
- **Four Data Types**: Appointment Types, Appointment Purposes, Doctors/Providers, Locations
- **Category System**: Define custom categories (Priority, Status, Type, etc.) with comma-separated values
- **Visual Status Indicators**: Green badges for mapped items, gray for unmapped
- **Delete Protection**: Confirmation dialogs prevent accidental data loss

### Advanced Features
- **Mass Edit**: Update categories for multiple items simultaneously
- **Mass Delete**: Remove multiple items in one action
- **Reset Mappings**: Clear all mappings while keeping imported data
- **Reset Form**: Complete fresh start - clears everything
- **Progress Tracking**: See mapped vs. total counts for each data type
- **Practice Name Management**: Configure practice name for exports

## 🚀 Getting Started

### Installation

**No installation required!** This is a standalone HTML application.

1. **Download** the `integration-mapping-tool.html` file
2. **Double-click** the file to open it in your web browser
3. **Start mapping!**

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for loading external libraries)

## 📖 How to Use

### Step 1: Set Up Categories

1. Click on the **"Category Management"** tab
2. Click **"Add Category"**
3. Enter a category name (e.g., "Priority", "Status", "Type")
4. Enter comma-separated values (e.g., "High, Medium, Low")
5. Click **"Add Category"**
6. Repeat for all categories you need

### Step 2: Import Your Data

#### Option A: Use the Template
1. Click **"Export Template"** button
2. Open the downloaded Excel file
3. Fill in your data in each sheet:
   - **Appointment Type** sheet: List all appointment types
   - **Appointment Purpose** sheet: List all appointment purposes
   - **Doctor** sheet: List all doctors/providers
   - **Location** sheet: List all locations
   - **Categories** sheet: Your categories are already here
4. Save the Excel file
5. Click **"Import Integration Mapping"** and select your file

#### Option B: Create Manually
After importing or creating categories, you can manually add categories through the UI.

### Step 3: Map Your Items

1. Enter your **Practice Name** at the top
2. Navigate to any tab (Appointment Types, Purposes, Doctors, or Locations)
3. You'll see all imported items in a table
4. **Simply select category values from the dropdowns** - mapping happens instantly!
5. Green background = mapped, Gray = unmapped

### Step 4: Bulk Operations (Optional)

#### Mass Edit
1. Check the boxes next to items you want to edit
2. Click **"Map/Edit Selected"**
3. Choose category values
4. Click **"Apply to Selected"**

#### Mass Delete
1. Check the boxes next to items you want to remove
2. Click **"Delete Selected"**
3. Confirm deletion

### Step 5: Save & Export

1. Click **"Save Configuration"** to save your work (logs to browser console)
2. Click **"Export Mapping Configuration"** to download your complete mapping as an Excel file

## 📊 Excel Template Format

### Sheet Structure

| Sheet Name | Column Name | Description |
|------------|-------------|-------------|
| Appointment Type | type | List of appointment types (one per row) |
| Appointment Purpose | purpose | List of appointment purposes (one per row) |
| Doctor | doctor | List of doctors/providers (one per row) |
| Location | location | List of locations (one per row) |
| Categories | Category | Category name |
| Categories | Values | Comma-separated values for each category |

### Example Categories Sheet

| Category | Values |
|----------|--------|
| Priority | High, Medium, Low |
| Status | Active, Inactive |
| Type | Standard, Express, Emergency |

## 🎯 Use Cases

- **Healthcare Systems**: Map appointment data for EMR/EHR integration
- **Medical Practices**: Organize and categorize appointment workflows
- **Health Tech Companies**: Configure integration mappings for clients
- **Data Migration**: Prepare and map legacy data for new systems
- **System Integration**: Configure mappings between different healthcare platforms

## 🛠️ Technical Details

### Built With
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **SheetJS (xlsx)** - Excel file handling
- **Lucide React** - Icons

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Size
- Single HTML file: ~50KB (excluding external libraries)
- No dependencies to install
- Libraries loaded from CDN

## 💡 Tips & Best Practices

1. **Start with Categories**: Define all your categories before importing data
2. **Use Descriptive Names**: Make category names clear and consistent
3. **Regular Exports**: Export your configuration regularly as a backup
4. **Practice Name First**: Enter practice name before starting to map
5. **Bulk Operations**: Use mass edit for efficiency when mapping similar items
6. **Test with Sample Data**: Import a small dataset first to test your workflow

## 🔒 Data Privacy

- **All data stays local** - nothing is sent to any server
- Data is stored in your browser's memory during your session
- Close the browser tab to clear all data
- Export your configuration to save your work

## 🐛 Troubleshooting

### Import not working?
- Ensure Excel file has all required sheets
- Check that column names match exactly (case-sensitive)
- Verify data is in the correct columns

### Mappings not saving?
- Check browser console (F12) for errors
- Ensure JavaScript is enabled
- Try refreshing the page and re-importing

### Export button not responding?
- Enter a Practice Name first
- Check pop-up blocker settings
- Try a different browser

## 📝 Version History

### Version 1.0.0 (Current)
- Initial release
- Full mapping functionality
- Excel import/export
- Category management
- Bulk operations
- Inline editing

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the browser console for error messages

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Icons provided by Lucide React
- Excel functionality powered by SheetJS

---

**Made with ❤️ for healthcare data integration**

*Last Updated: 2024*
