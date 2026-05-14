import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../lib/utils';
import { Printer } from 'lucide-react';

interface ReceiptProps {
  items: CartItem[];
  total: number;
  paymentMethod: string;
  receivedAmount: number;
  change: number;
  date: Date;
}

export function Receipt({ items, total, paymentMethod, receivedAmount, change, date }: ReceiptProps) {
  return (
    <div className="bg-white p-8 text-black font-mono w-full max-w-[400px] border border-gray-100 flex flex-col items-center">
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-2xl font-black uppercase tracking-tighter">PH PRINTS</h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Premium Creative Solutions</p>
        <p className="text-[10px] text-gray-400">Marikina City, Philippines</p>
      </div>

      <div className="w-full border-t border-dashed border-gray-300 my-4" />

      <div className="w-full space-y-4">
        <div className="flex justify-between text-[10px] font-bold text-gray-400">
          <span>{date.toLocaleDateString()}</span>
          <span>{date.toLocaleTimeString()}</span>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
              </div>
              <p className="text-xs font-bold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="w-full border-t border-dashed border-gray-300 my-4" />

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span>Total</span>
            <span className="text-sm font-black">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Payment Method</span>
            <span className="uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Received</span>
            <span>{formatCurrency(receivedAmount)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold pt-1">
            <span>Change</span>
            <span>{formatCurrency(change)}</span>
          </div>
        </div>

        <div className="w-full border-t border-dashed border-gray-300 my-4" />
        
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest">Thank you for your business!</p>
          <p className="text-[8px] text-gray-400">www.printhiveph.com</p>
        </div>

        <div className="flex justify-center pt-4 no-print">
            <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
            >
                <Printer size={14} /> Print Receipt
            </button>
        </div>
      </div>
    </div>
  );
}
