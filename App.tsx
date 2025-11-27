
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BrandSetup } from './components/BrandSetup';
import { AssetLockerSetup } from './components/AssetLockerSetup';
import { Generator } from './components/Generator';
import { BrandProfile, Archetype } from './types';

type ViewState = 'BRAND' | 'ASSETS' | 'GENERATOR';

function App() {
  const [view, setView] = useState<ViewState>('BRAND');
  
  const [brand, setBrand] = useState<BrandProfile>({
    name: 'New Brand',
    archetype: Archetype.PRODUCT,
    mission: '',
    tone: '',
    constraints: '',
    assets: {} // Initialize empty asset locker
  });

  return (
    <Layout>
      {view === 'BRAND' && (
        <BrandSetup 
          brand={brand} 
          setBrand={setBrand} 
          onNext={() => setView('ASSETS')} 
        />
      )}
      
      {view === 'ASSETS' && (
        <AssetLockerSetup 
          brand={brand} 
          setBrand={setBrand} 
          onNext={() => setView('GENERATOR')} 
        />
      )}

      {view === 'GENERATOR' && (
        <Generator brand={brand} />
      )}
    </Layout>
  );
}

export default App;
