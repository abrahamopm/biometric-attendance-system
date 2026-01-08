/**
 * CSV Export Utility
 * Handles exporting data to CSV format with proper escaping and formatting
 */

interface ExportOptions {
    filename: string;
    headers: string[];
    data: any[][];
    includeTimestamp?: boolean;
}

/**
 * Escapes a value for CSV format
 * Handles commas, quotes, and newlines
 */
export const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

/**
 * Exports data to a CSV file and triggers download
 */
export const exportToCSV = ({ filename, headers, data, includeTimestamp = true }: ExportOptions): void => {
    // Build CSV content
    const csvRows = [
        headers.map(escapeCSV).join(','),
        ...data.map(row => row.map(escapeCSV).join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Add BOM for Excel compatibility with UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with optional timestamp
    const sanitizedFilename = filename
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 50);
    
    const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    link.download = `${sanitizedFilename}${timestamp}.csv`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Export attendance records to CSV
 */
export const exportAttendanceCSV = (
    records: any[],
    eventName: string = 'attendance'
): void => {
    const headers = ['Student', 'Status', 'Date', 'Time', 'Confidence Score'];
    
    const data = records.map(record => [
        record.student_username || record.student || 'Unknown',
        record.status || 'N/A',
        record.date || 'N/A',
        record.time || 'N/A',
        record.confidence_score ? `${(record.confidence_score * 100).toFixed(2)}%` : 'N/A'
    ]);
    
    exportToCSV({
        filename: `${eventName}_attendance`,
        headers,
        data
    });
};

/**
 * Export daily report to CSV
 */
export const exportDailyReportCSV = (
    records: any[],
    date: string = new Date().toISOString().split('T')[0]
): void => {
    const headers = ['Name', 'Status', 'Check-in Time', 'Check-out Time', 'Department'];
    
    const data = records.map(record => [
        record.name || record.student_username || 'Unknown',
        record.status || 'N/A',
        record.checkInTime || record.time || 'N/A',
        record.checkOutTime || 'N/A',
        record.department || 'N/A'
    ]);
    
    exportToCSV({
        filename: `daily_report_${date}`,
        headers,
        data
    });
};

/**
 * Export user list to CSV
 */
export const exportUsersCSV = (users: any[]): void => {
    const headers = ['Username', 'Email', 'Role', 'Phone', 'Created At'];
    
    const data = users.map(user => [
        user.username || 'N/A',
        user.email || 'N/A',
        user.role || 'N/A',
        user.phone || 'N/A',
        user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
    ]);
    
    exportToCSV({
        filename: 'users_export',
        headers,
        data
    });
};
