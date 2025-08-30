import React, { useMemo, useState } from 'react';
import type { List, ProductMap, View } from '../types';
import { ShoppingCartIcon, CameraIcon, EditIcon, XIcon } from '../constants';

interface DashboardViewProps {
  activeList: List;
  productMap: ProductMap;
  onNavigate: (view: View) => void;
  onStartShopping: () => void;
  onScanTicket: () => void;
  weeklyBudget: number;
  setWeeklyBudget: (budget: number) => void;
}

// Simple Donut Chart Component
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-ink-muted">No hay datos para mostrar</div>;
  }

  let cumulativePercent = 0;
  const segments = data.map(item => {
    const percent = (item.value / total) * 100;
    const segment = { ...item, percent };
    cumulativePercent += percent;
    return segment;
  });

  const gradientParts = segments.map((item, index) => {
    const start = index === 0 ? 0 : segments.slice(0, index).reduce((acc, s) => acc + s.percent, 0);
    const end = start + item.percent;
    return `${item.color} ${start}% ${end}%`;
  });

  return (
    <div className="relative w-40 h-40">
      <div 
        className="w-full h-full rounded-full" 
        style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
      />
      <div className="absolute inset-2 bg-surface rounded-full flex items-center justify-center">
         <span className="text-2xl font-bold text-ink">
          {Math.round(segments.find(s => s.label === 'Saludable')?.percent || 0)}%
        </span>
      </div>
    </div>
  );
};

// Simple Budget Modal Component
const BudgetModal: React.FC<{
  currentBudget: number;
  onSave: (newBudget: number) => void;
  onClose: () => void;
}> = ({ currentBudget, onSave, onClose }) => {
  const [value, setValue] = useState(String(currentBudget));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(value);
    if (!isNaN(newBudget) && newBudget >= 0) {
      onSave(newBudget);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-30 flex justify-center items-center" onClick={onClose}>
      <form onSubmit={handleSave} className="bg-surface rounded-2xl border border-border w-full max-w-xs m-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-ink">Editar Presupuesto</h3>
            <button type="button" onClick={onClose}><XIcon className="h-5 w-5"/></button>
        </div>
        <div className="p-4">
            <label htmlFor="budget" className="text-sm font-medium text-ink-muted">Presupuesto Semanal (€)</label>
            <input 
                id="budget"
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-bg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                autoFocus
            />
        </div>
        <div className="p-4 border-t border-border flex justify-end">
            <button type="submit" className="bg-brand text-brand-ink font-semibold py-2 px-4 rounded-xl">Guardar</button>
        </div>
      </form>
    </div>
  );
};


const DashboardView: React.FC<DashboardViewProps> = ({ activeList, productMap, onNavigate, onStartShopping, onScanTicket, weeklyBudget, setWeeklyBudget }) => {
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const { totalQuantity, totalCost, healthData } = useMemo(() => {
    const items = activeList.items;
    let totalCost = 0;
    let totalQuantity = 0;

    const healthStats = {
      healthy: 0,
      neutral: 0,
      unhealthy: 0,
    };

    items.forEach(item => {
      const itemCost = (item.priceSnapshot || 0) * item.quantity;
      totalCost += itemCost;
      totalQuantity += item.quantity;
      const product = productMap.get(item.productId);
      
      if (product?.healthScore) {
          if (product.healthScore >= 4) healthStats.healthy += itemCost;
          else if (product.healthScore === 3) healthStats.neutral += itemCost;
          else healthStats.unhealthy += itemCost;
      }
    });
    
    const healthData = [
        { label: 'Saludable', value: healthStats.healthy, color: 'var(--accent)'},
        { label: 'Neutral', value: healthStats.neutral, color: 'var(--warn)' },
        { label: 'Poco Saludable', value: healthStats.unhealthy, color: 'var(--danger)' }
    ];

    return { totalQuantity, totalCost, healthData };
  }, [activeList, productMap]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const budgetProgress = weeklyBudget > 0 ? (totalCost / weeklyBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{greeting}</h1>
        <p className="text-ink-muted">Aquí tienes un resumen de tu actividad.</p>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Budget Widget */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-2xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-ink">Presupuesto Semanal</h2>
                <button onClick={() => setIsBudgetModalOpen(true)} className="p-1.5 rounded-full hover:bg-border transition-colors">
                    <EditIcon className="h-4 w-4 text-ink-muted"/>
                </button>
            </div>
            <p className="text-3xl font-bold text-brand">{totalCost.toFixed(2)}€ / <span className="text-ink-muted">{weeklyBudget.toFixed(2)}€</span></p>
            <div className="w-full bg-border rounded-full h-2.5 mt-2">
                <div 
                    className="bg-brand h-2.5 rounded-full" 
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                />
            </div>
            <p className="text-xs text-ink-muted mt-1">{Math.round(budgetProgress)}% del presupuesto gastado</p>
        </div>
        
        {/* Health Analysis Widget */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
             <h2 className="font-semibold text-ink mb-4">Análisis Nutricional de tu Cesta</h2>
             <div className="flex flex-col sm:flex-row items-center gap-6">
                <DonutChart data={healthData} />
                <div className="flex-1 w-full">
                    <div className="max-w-xs">
                        {healthData.map((item, index) => (
                             <div key={item.label} className="py-2.5 border-b border-border last:border-b-0">
                                <div className="flex justify-between items-baseline">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}/>
                                        <span className="font-medium text-ink-muted">{item.label}</span>
                                    </div>
                                    <span className="font-semibold text-ink whitespace-nowrap">{item.value.toFixed(2)}€</span>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>

        {/* List Summary Widget */}
        <div className="bg-surface border border-border rounded-2xl flex flex-col">
          <div className="p-5 flex-grow">
            <h2 className="font-semibold text-ink">Lista Actual</h2>
            <p className="text-sm text-ink-muted truncate">{activeList.name}</p>
            <div className="mt-2">
              <p className="text-3xl font-bold text-ink">{totalQuantity}</p>
              <p className="text-sm text-ink-muted">
                {totalQuantity === 1 ? 'artículo' : 'artículos'} en la lista
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('list')}
            className="w-full text-left bg-bg px-5 py-3 text-sm font-semibold text-brand hover:bg-border transition-colors rounded-b-2xl"
          >
            Ir a la lista →
          </button>
        </div>

      </div>
      
      {/* Quick Actions Widget */}
      <div className="grid grid-cols-2 gap-4">
        <button 
            onClick={onStartShopping}
            disabled={totalQuantity === 0}
            className="flex items-center justify-center text-center p-5 bg-surface rounded-2xl border border-border hover:border-brand hover:bg-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border"
        >
            <ShoppingCartIcon className="text-brand h-6 w-6" />
            <span className="ml-3 font-bold text-ink">Modo Compra</span>
        </button>
        <button 
            onClick={onScanTicket}
            className="flex items-center justify-center text-center p-5 bg-surface rounded-2xl border border-border hover:border-brand hover:bg-bg transition-all"
        >
            <CameraIcon className="text-brand h-6 w-6" />
            <span className="ml-3 font-bold text-ink">Escanear Ticket</span>
        </button>
      </div>

      {isBudgetModalOpen && (
        <BudgetModal
            currentBudget={weeklyBudget}
            onClose={() => setIsBudgetModalOpen(false)}
            onSave={(newBudget) => {
                setWeeklyBudget(newBudget);
                setIsBudgetModalOpen(false);
            }}
        />
      )}

    </div>
  );
};

export default DashboardView;