// Quota management constants
export const LAWS = [
  {
    id: 'PD-1586',
    name: 'PD-1586 (Environmental Impact Assessment)',
    fullName: 'Presidential Decree No. 1586 - Environmental Impact Statement System'
  },
  {
    id: 'RA-6969',
    name: 'RA-6969 (Toxic Substances Control)',
    fullName: 'Republic Act No. 6969 - Toxic Substances and Hazardous and Nuclear Wastes Control Act'
  },
  {
    id: 'RA-8749',
    name: 'RA-8749 (Clean Air Act)',
    fullName: 'Republic Act No. 8749 - Philippine Clean Air Act'
  },
  {
    id: 'RA-9275',
    name: 'RA-9275 (Clean Water Act)',
    fullName: 'Republic Act No. 9275 - Philippine Clean Water Act'
  },
  {
    id: 'RA-9003',
    name: 'RA-9003 (Solid Waste Management)',
    fullName: 'Republic Act No. 9003 - Ecological Solid Waste Management Act'
  }
];

export const MONTHS = [
  { value: 1, label: 'January', short: 'Jan', quarter: 1 },
  { value: 2, label: 'February', short: 'Feb', quarter: 1 },
  { value: 3, label: 'March', short: 'Mar', quarter: 1 },
  { value: 4, label: 'April', short: 'Apr', quarter: 2 },
  { value: 5, label: 'May', short: 'May', quarter: 2 },
  { value: 6, label: 'June', short: 'Jun', quarter: 2 },
  { value: 7, label: 'July', short: 'Jul', quarter: 3 },
  { value: 8, label: 'August', short: 'Aug', quarter: 3 },
  { value: 9, label: 'September', short: 'Sep', quarter: 3 },
  { value: 10, label: 'October', short: 'Oct', quarter: 4 },
  { value: 11, label: 'November', short: 'Nov', quarter: 4 },
  { value: 12, label: 'December', short: 'Dec', quarter: 4 }
];

export const QUARTERS = [
  { value: 1, label: 'Quarter 1', months: [1, 2, 3], monthsLabel: 'January - March' },
  { value: 2, label: 'Quarter 2', months: [4, 5, 6], monthsLabel: 'April - June' },
  { value: 3, label: 'Quarter 3', months: [7, 8, 9], monthsLabel: 'July - September' },
  { value: 4, label: 'Quarter 4', months: [10, 11, 12], monthsLabel: 'October - December' }
];

export const QUOTA_COLORS = {
  normal: {
    background: 'bg-gradient-to-r from-sky-600 to-sky-700',
    border: 'border-sky-300',
    text: 'text-sky-600'
  },
  met: {
    background: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    border: 'border-emerald-300',
    text: 'text-emerald-600'
  },
  exceeded: {
    background: 'bg-gradient-to-r from-green-500 to-green-600',
    border: 'border-green-400',
    text: 'text-green-600'
  }
};

export const DEFAULT_QUOTA_TARGET = 25;

export const QUOTA_STATUS = {
  PENDING: 'pending',
  MET: 'met',
  EXCEEDED: 'exceeded'
};

export const getQuotaStatus = (accomplished, target) => {
  if (accomplished >= target) {
    return accomplished > target ? QUOTA_STATUS.EXCEEDED : QUOTA_STATUS.MET;
  }
  return QUOTA_STATUS.PENDING;
};

export const getQuotaColor = (status) => {
  switch (status) {
    case QUOTA_STATUS.MET:
      return QUOTA_COLORS.met;
    case QUOTA_STATUS.EXCEEDED:
      return QUOTA_COLORS.exceeded;
    default:
      return QUOTA_COLORS.normal;
  }
};

export const formatQuotaDisplay = (accomplished, target) => {
  const percentage = target > 0 ? Math.round((accomplished / target) * 100) : 0;
  return {
    display: `${accomplished}/${target}`,
    percentage: `${percentage}%`,
    exceeded: accomplished > target,
    exceededAmount: Math.max(0, accomplished - target)
  };
};

// Helper functions
export const getMonthsInQuarter = (quarter) => {
  const quarterObj = QUARTERS.find(q => q.value === quarter);
  return quarterObj ? quarterObj.months : [];
};

export const getQuarterFromMonth = (month) => {
  const monthObj = MONTHS.find(m => m.value === month);
  return monthObj ? monthObj.quarter : null;
};

export const isCurrentMonth = (year, month) => {
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1;
};

export const isPastMonth = (year, month) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;
  return false;
};

export const getMonthName = (month) => {
  const monthObj = MONTHS.find(m => m.value === month);
  return monthObj ? monthObj.label : '';
};

export default {
  LAWS,
  MONTHS,
  QUARTERS,
  QUOTA_COLORS,
  DEFAULT_QUOTA_TARGET,
  QUOTA_STATUS,
  getQuotaStatus,
  getQuotaColor,
  formatQuotaDisplay,
  getMonthsInQuarter,
  getQuarterFromMonth,
  isCurrentMonth,
  isPastMonth,
  getMonthName
};
