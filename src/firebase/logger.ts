import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { User } from 'firebase/auth';

export type ActivityAction = 
  | 'STOCK_UPDATE' 
  | 'PRODUCT_CREATE' 
  | 'PRODUCT_UPDATE' 
  | 'PRODUCT_DELETE' 
  | 'POS_SALE' 
  | 'ORDER_STATUS_CHANGE'
  | 'ORDER_UPDATE'
  | 'EXPENSE_ADD'
  | 'CATEGORY_CHANGE';

export async function logActivity(
  user: User | null, 
  action: ActivityAction, 
  details: string, 
  targetId?: string, 
  targetType?: string
) {
  if (!user) return;

  try {
    await addDoc(collection(db, 'activity_logs'), {
      adminId: user.uid,
      adminEmail: user.email,
      action,
      details,
      targetId: targetId || null,
      targetType: targetType || null,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
