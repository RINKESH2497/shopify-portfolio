import React from 'react';
import { useStore } from '../engine/StoreContext';
import { SectionRenderer } from '../sections/SectionRenderer';

export const HomePage: React.FC = () => {
  const { storeConfig } = useStore();

  if (!storeConfig || !storeConfig.sections) {
    return (
      <div className="w-full py-24 text-center">
        <p className="text-sm text-[var(--color-text-muted,#6b7280)]">
          Loading store homepage...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <SectionRenderer sections={storeConfig.sections} />
    </div>
  );
};

export default HomePage;
