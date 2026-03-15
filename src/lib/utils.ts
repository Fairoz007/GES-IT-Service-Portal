import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('en-US', defaultOptions);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(d);
}

// Currency formatting
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Status color utilities
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'On Hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'Approved': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Available': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Assigned': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Maintenance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Retired': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'Disposed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'Suspended': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

// Priority icon colors
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'Low': 'text-green-500',
    'Medium': 'text-yellow-500',
    'High': 'text-orange-500',
    'Critical': 'text-red-500',
  };
  return colors[priority] || 'text-gray-500';
}

// SLA calculation
export function getSLAStatus(deadline: string, status: string): 'ok' | 'warning' | 'overdue' {
  if (status === 'Closed' || status === 'Resolved') return 'ok';
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) return 'overdue';
  if (hoursRemaining < 4) return 'warning';
  return 'ok';
}

// Generate QR code data URL for assets
export function generateQRCodeData(assetCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(assetCode)}`;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Export to CSV
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Generate PDF (mock - would use a library like jsPDF in production)
export function generatePDF(title: string, content: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${formatDateTime(new Date())}</p>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate MAC address
export function isValidMACAddress(mac: string): boolean {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

// Format MAC address
export function formatMACAddress(mac: string): string {
  const cleaned = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  return cleaned.match(/.{1,2}/g)?.join(':') || mac;
}
