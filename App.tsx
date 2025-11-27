import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BrandSetup } from './components/BrandSetup';
import { Generator } from './components/Generator';
import { BrandProfile, Archetype } from './types';

function App() {
  const [hasBrand, setHasBrand] = useState(false);
  const [brand, setBrand] = useState<BrandProfile>({
    name: 'New Brand',
    archetype: Archetype.PRODUCT,
    mission: '',
    tone: '',
    constraints: ''
  });

  return (
    <Layout>
      {!hasBrand ? (
        <BrandSetup 
          brand={brand} 
          setBrand={setBrand} 
          onNext={() => setHasBrand(true)} 
        />
      ) : (
        <Generator brand={brand} />
      )}
    </Layout>
  );
}

export default App;