import { 
  UtensilsCrossed, Store, Factory, Stethoscope, Hotel, 
  GraduationCap, Landmark, Hammer, Truck, Tractor, 
  Anchor, Zap, Radio, Building2, Shield, Home, 
  Briefcase, Scale, TrendingUp, MessageSquare, Code, 
  FlaskConical, Trash2, Droplet, Building, Heart, 
  Clapperboard, Dumbbell, Sparkles, Wrench, Sparkles as SparkleIcon, ShieldCheck
} from 'lucide-react';

export const ESTABLISHMENT_ICON_MAP = {
  'RESTAURANT/FOOD SERVICE': { icon: UtensilsCrossed, color: '#ef4444', label: 'Restaurant' },
  'RETAIL/WHOLESALE': { icon: Store, color: '#f97316', label: 'Store' },
  'MANUFACTURING': { icon: Factory, color: '#8b5cf6', label: 'Factory' },
  'CONSTRUCTION': { icon: Hammer, color: '#f59e0b', label: 'Construction' },
  'TRANSPORTATION': { icon: Truck, color: '#06b6d4', label: 'Transport' },
  'HEALTHCARE/MEDICAL': { icon: Stethoscope, color: '#ec4899', label: 'Hospital' },
  'EDUCATION/TRAINING': { icon: GraduationCap, color: '#10b981', label: 'School' },
  'HOSPITALITY/TOURISM': { icon: Hotel, color: '#6366f1', label: 'Hotel' },
  'AGRICULTURE/FARMING': { icon: Tractor, color: '#84cc16', label: 'Farm' },
  'FISHING/AQUACULTURE': { icon: Anchor, color: '#14b8a6', label: 'Fishing' },
  'MINING': { icon: Sparkles, color: '#f59e0b', label: 'Mining' },
  'ENERGY/POWER': { icon: Zap, color: '#fbbf24', label: 'Power' },
  'TELECOMMUNICATIONS': { icon: Radio, color: '#3b82f6', label: 'Telecom' },
  'BANKING/FINANCE': { icon: Landmark, color: '#10b981', label: 'Bank' },
  'INSURANCE': { icon: Shield, color: '#6366f1', label: 'Insurance' },
  'REAL ESTATE': { icon: Home, color: '#f59e0b', label: 'Real Estate' },
  'CONSULTING SERVICES': { icon: Briefcase, color: '#6366f1', label: 'Consulting' },
  'LEGAL SERVICES': { icon: Scale, color: '#8b5cf6', label: 'Legal' },
  'ACCOUNTING SERVICES': { icon: TrendingUp, color: '#10b981', label: 'Accounting' },
  'MARKETING/ADVERTISING': { icon: MessageSquare, color: '#ec4899', label: 'Marketing' },
  'INFORMATION TECHNOLOGY': { icon: Code, color: '#3b82f6', label: 'IT' },
  'RESEARCH & DEVELOPMENT': { icon: FlaskConical, color: '#6366f1', label: 'R&D' },
  'WASTE MANAGEMENT': { icon: Trash2, color: '#78716c', label: 'Waste' },
  'WATER SUPPLY': { icon: Droplet, color: '#0ea5e9', label: 'Water' },
  'GOVERNMENT SERVICES': { icon: Building, color: '#64748b', label: 'Government' },
  'NON-PROFIT/CHARITY': { icon: Heart, color: '#ef4444', label: 'Charity' },
  'ENTERTAINMENT/RECREATION': { icon: Clapperboard, color: '#ec4899', label: 'Entertainment' },
  'SPORTS/FITNESS': { icon: Dumbbell, color: '#f97316', label: 'Sports' },
  'BEAUTY/COSMETICS': { icon: Sparkles, color: '#ec4899', label: 'Beauty' },
  'AUTOMOTIVE SERVICES': { icon: Truck, color: '#3b82f6', label: 'Auto' },
  'REPAIR SERVICES': { icon: Wrench, color: '#f59e0b', label: 'Repair' },
  'CLEANING SERVICES': { icon: Building, color: '#10b981', label: 'Cleaning' },
  'SECURITY SERVICES': { icon: ShieldCheck, color: '#6366f1', label: 'Security' },
  'OTHERS': { icon: Building2, color: '#64748b', label: 'Other' },
  'DEFAULT': { icon: Building2, color: '#64748b', label: 'Building' }
};

export const getIconByNatureOfBusiness = (natureOfBusiness) => {
  return ESTABLISHMENT_ICON_MAP[natureOfBusiness] || ESTABLISHMENT_ICON_MAP['DEFAULT'];
};

export const SELECTABLE_ICONS = Object.entries(ESTABLISHMENT_ICON_MAP)
  .filter(([key]) => key !== 'DEFAULT')
  .map(([key, value]) => ({ key, ...value }));
