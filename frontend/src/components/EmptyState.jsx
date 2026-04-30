import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, description, actionText, onAction, isAdmin }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-xl border border-dashed border-border px-6">
      <div className="w-16 h-16 rounded-full bg-[#13151f] flex items-center justify-center mb-6 border border-border/50">
        <Icon className="w-8 h-8 text-text-secondary" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-8 leading-relaxed">{description}</p>
      {isAdmin && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-all border border-primary/20"
        >
          <Plus className="w-5 h-5" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
