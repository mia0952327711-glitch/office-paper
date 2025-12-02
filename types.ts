export enum ReportType {
  NEW_SALE = '🆕 新成交（首次收訂/全額）',
  FINAL_PAYMENT = '💰 補收尾款 / 後續付款',
}

export enum SalesRep {
  HONG_MING = '宏銘',
  FAN_XIAN = '汎賢',
  JING_XUAN = '靖璇',
  TING_YU = '庭榆',
  YI_LING = '依玲',
  ZHI_ZHI = '芝芝',
  OTHER = '(其他)',
}

export enum ProductType {
  PERSONAL_TOWER = '個人塔位',
  DOUBLE_TOWER = '雙人/夫妻塔位',
  ANCESTRAL_TABLET = '祖先牌位',
  LIFE_SEAT = '壽位',
  OTHER = '其他',
}

export enum CustomerSource {
  WALK_IN = '自行前來',
  INDUSTRY_REFERRAL = '同業/禮儀公司介紹',
  OLD_CUSTOMER = '舊客介紹',
  MASTER_REFERRAL = '師父/老師介紹',
}

export interface SalesRecord {
  id: string;
  reportType: ReportType;
  date: string; // ISO Date string
  salesRep: SalesRep | string;
  unitId: string;
  productType: ProductType;
  buyerName: string;
  userName: string;
  installDate?: string;
  listPrice: number;
  actualPrice: number;
  receivedAmount: number;
  balanceAmount: number;
  source: CustomerSource;
  referrer?: string;
  notes?: string;
  // Calculated fields for internal use
  discountAmount: number;
  discountRate: number;
  timestamp: number;
}
