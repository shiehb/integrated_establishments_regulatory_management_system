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

export const QUARTERS = [
  { value: 1, label: 'Q1 (Jan-Mar)', months: 'January - March' },
  { value: 2, label: 'Q2 (Apr-Jun)', months: 'April - June' },
  { value: 3, label: 'Q3 (Jul-Sep)', months: 'July - September' },
  { value: 4, label: 'Q4 (Oct-Dec)', months: 'October - December' }
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
    background: 'bg-gradient-to-r from-amber-500 to-amber-600',
    border: 'border-amber-400',
    text: 'text-amber-600'
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

export default {
  LAWS,
  QUARTERS,
  QUOTA_COLORS,
  DEFAULT_QUOTA_TARGET,
  QUOTA_STATUS,
  getQuotaStatus,
  getQuotaColor,
  formatQuotaDisplay
};
