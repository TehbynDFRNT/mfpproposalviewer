"use client";

import React from "react";
import Image from "next/image";
import { ResponsiveVideo } from "@/components/ResponsiveVideo";

export default function MediaExamples() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Optimized Media Examples</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Optimized Images</h2>
        <p className="mb-4 text-gray-700">These images use Next.js Image component with WebP format from the _opt folder:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-2">Pool Design</h3>
            <Image 
              src="/_opt/verona-hero.webp"
              alt="Verona Pool"
              width={800}
              height={450}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Layout Diagram</h3>
            <Image 
              src="/_opt/verona_layout.webp"
              alt="Pool Layout"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Image 
            src="/_opt/ledlight.webp"
            alt="LED Lighting"
            width={300}
            height={300}
            className="w-full h-auto rounded-lg shadow-sm"
          />
          
          <Image 
            src="/_opt/pavers.webp"
            alt="Pavers"
            width={300}
            height={300}
            className="w-full h-auto rounded-lg shadow-sm"
          />
          
          <Image 
            src="/_opt/poolcleaner.webp"
            alt="Pool Cleaner"
            width={300}
            height={300}
            className="w-full h-auto rounded-lg shadow-sm"
          />
          
          <Image 
            src="/_opt/RetainingWallImagery.webp"
            alt="Retaining Wall"
            width={300}
            height={300}
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Optimized Videos</h2>
        <p className="mb-4 text-gray-700">These videos use the ResponsiveVideo component with WebM and MP4 formats:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Pool Showcase</h3>
            <ResponsiveVideo 
              baseName="Sheffield"
              className="w-full h-auto rounded-lg shadow-md"
              controls
              muted
              loop
              playsInline
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Water Feature</h3>
            <ResponsiveVideo 
              baseName="waterfeature"
              className="w-full h-auto rounded-lg shadow-md"
              controls
              muted
              loop
              playsInline
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Fire Feature</h3>
          <ResponsiveVideo 
            baseName="fire"
            className="w-full h-auto rounded-lg shadow-md"
            controls
            muted
            loop
            playsInline
          />
        </div>
      </section>
    </div>
  );
}