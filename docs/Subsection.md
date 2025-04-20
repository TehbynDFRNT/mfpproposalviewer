Okay, let's proceed with the detailed execution plan.
High-Level Plan:
Modify state management to include activeSubSectionIndex.
Update the JSX structure for multi-card sections to include data-subsection-index and necessary refs.
Revise the handleIntersection logic within the IntersectionObserver to differentiate between major and minor scrolls.
Adjust the rendering and animation logic for the right-column header and cards based on the new state.
Refine the left-column image logic to respond appropriately to both major and minor section changes.
Ensure scroll snap properties are correctly applied.
Execution Steps:
AGENT:
FILE: src/app/proposal/[proposalId]/page.tsx
REMOVE:```typescript
// Remove the state variable specifically for pool sub-sections if it exists
// (Based on previous code, this might be):
// const [poolSubSection, setPoolSubSection] = useState(0);
// Remove the specific wheel handler if it exists
// const handleSubSectionWheel = useCallback(...);
ADD:
```typescript
// Add near the top with other state variables
const [activeSubSectionIndex, setActiveSubSectionIndex] = useState<number>(0);
// Add a state to track if the *major* section is changing for header animation
const [isChangingSection, setIsChangingSection] = useState<boolean>(false);

// Define which sections have sub-sections (Example: Pool Selection)
const SECTIONS_WITH_SUBSECTIONS = [CATEGORY_IDS.POOL_SELECTION /*, Add other IDs here */];

// Example data structure for Pool Selection sub-sections (derive or create this)
// This should ideally come from processing proposalData or a dedicated mapping
const poolSubSectionsData = [
  { type: 'details', data: proposalData.poolSelection.pool },
  { type: 'color', data: { color: proposalData.poolSelection.pool.color, /* other color details */ } },
  // Add more objects for pricing tables, etc.
];

// Define mapping for left-column visuals based on section and subsection
const getLeftColumnVisual = (sectionId: string | null, subIndex: number) => {
  switch (sectionId) {
    case CATEGORY_IDS.CUSTOMER_INFO:
      return { type: 'map', address: customerAddress };
    case CATEGORY_IDS.POOL_SELECTION:
      // Example: Show video for first sub-section, image for second
      if (subIndex === 0) return { type: 'video', src: '/Sheffield.mp4' };
      if (subIndex === 1) return { type: 'image', src: '/silvermist-water.jpg', alt: 'Pool Water Colour' };
      return { type: 'video', src: '/Sheffield.mp4' }; // Default for pool section
    case CATEGORY_IDS.CONCRETE_PAVING:
      return { type: 'image', src: '/paving.jpg', alt: 'Paving & Concrete' };
    case CATEGORY_IDS.FENCING:
      return { type: 'image', src: '/fencing.jpg', alt: 'Fencing' };
    case CATEGORY_IDS.WATER_FEATURE:
      return { type: 'video', src: '/WaterFeature.mp4', alt: 'Water Feature' };
    case CATEGORY_IDS.ADD_ONS:
       return { type: 'image', src: '/lighting.jpg', alt: 'Optional Add-ons' };
    // Add cases for other sections...
    default:
      return { type: 'placeholder', name: sectionId ? CATEGORY_NAMES[sectionId] : 'Loading...' };
  }
};

```COMMENTS: Added `activeSubSectionIndex` state. Defined which sections have sub-sections and created placeholder data/logic for pool sub-sections and left-column visuals. Added `isChangingSection` state for header animation control. Removed potentially conflicting old state/handlers.

AGENT:
FILE: `src/app/proposal/[proposalId]/page.tsx`
REMOVE:
```typescript
  // Remove the old handleIntersection logic entirely
  // const handleIntersection = useCallback(...);
```ADD:
```typescript
  // Replace the old handleIntersection with this enhanced version
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    let bestEntry: IntersectionObserverEntry | null = null;
    let maxVisibleRatio = 0;

    entries.forEach(entry => {
      // Prioritize the entry with the highest intersection ratio within the root bounds
      if (entry.isIntersecting && entry.intersectionRatio > maxVisibleRatio) {
        maxVisibleRatio = entry.intersectionRatio;
        bestEntry = entry;
      }
      // Fallback for fast scrolls: consider the topmost visible element if no best entry found yet
      else if (entry.isIntersecting && !bestEntry) {
          const rect = entry.boundingClientRect;
          const viewportHeight = rightColumnRef.current?.clientHeight || window.innerHeight;
          // Consider elements intersecting the top ~half of the viewport
          if (rect.top >= 0 && rect.top < viewportHeight * 0.5 && entry.intersectionRatio > 0.05) { // Ensure at least minimally visible
               bestEntry = entry;
          }
      }
    });

    if (bestEntry) {
      const intersectingElement = bestEntry.target as HTMLElement;
      const majorSectionId = intersectingElement.closest('[data-major-section]')?.id; // Find parent major section ID
      const subSectionIndexStr = intersectingElement.dataset.subsectionIndex;
      const subSectionIndex = subSectionIndexStr ? parseInt(subSectionIndexStr, 10) : null;

      if (majorSectionId && majorSectionId !== activeSection) {
        // --- Major Section Change ---
        setActiveSection(majorSectionId);
        setActiveSubSectionIndex(0); // Reset sub-section index
        setIsChangingSection(true); // Trigger header animation flag
        // Optional: Clear the flag after animation duration
        setTimeout(() => setIsChangingSection(false), 500); // Match CSS duration

      } else if (majorSectionId === activeSection && subSectionIndex !== null && subSectionIndex !== activeSubSectionIndex) {
        // --- Sub-Section Change within the Active Major Section ---
        setActiveSubSectionIndex(subSectionIndex);
        // Do *not* update activeSection or trigger major section change animations
        setIsChangingSection(false); // Ensure header doesn't animate

      }
      // Note: If the same element remains the 'bestEntry', no state update occurs, preventing flicker.
    }

  }, [activeSection, activeSubSectionIndex]); // Dependencies: re-create if these change
Use code with caution.
COMMENTS: Implemented the new intersection logic. It finds the 'best' intersecting entry, checks if it's a new major section or a sub-section within the current major section, and updates state accordingly. Added logic to find the parent [data-major-section] ID. Added setIsChangingSection calls.
AGENT:
FILE: src/app/proposal/[proposalId]/page.tsx
REMOVE:
// Remove the entire <div ref={rightColumnRef} ...> mapping logic.
 // We will replace it with a new structure.
 {Object.entries(CATEGORY_IDS).map(([key, id]) => {
   // ... all the content inside this map function ...
 })}
Use code with caution.
Jsx
ADD:
// Add this new mapping logic inside the right column div (<div ref={rightColumnRef} ...>)

 {Object.entries(CATEGORY_IDS).map(([key, id]) => {
   const isMultiCardSection = SECTIONS_WITH_SUBSECTIONS.includes(id);
   const sectionData = proposalData; // Use appropriate data slice if needed

   // Determine Header Content based only on activeSection
   const headerContent = activeSection === id ? (
     <div className={`mb-4 transition-opacity duration-300 ease-in-out ${isChangingSection ? 'opacity-0' : 'opacity-100'}`}>
       {id === CATEGORY_IDS.CUSTOMER_INFO ? (
         <>
           <h2 className="header-welcome">
             Welcome <span className="header-owners">{sectionData.customerInfo.owner1.split(' ')[0]} & {sectionData.customerInfo.owner2?.split(' ')[0]}</span>
           </h2>
           <h3 className="subheader-text mt-1.5">
             Your Pool Proposal for {sectionData.customerInfo.propertyDetails.streetAddress}
           </h3>
         </>
       ) : id === CATEGORY_IDS.POOL_SELECTION ? (
          <>
            <h2 className="font-bold font-sans text-white text-3xl mb-4">
              Your Pool, {sectionData.poolSelection.pool.modelName.replace(/\s*\(.*\)$/, '')}
            </h2>
            <h3 className="subheader-text mt-1.5">
              From the <span className="text-[#DB9D6A] font-semibold">
                {sectionData.poolSelection.pool.poolRange} Range
              </span>
            </h3>
          </>
       ) : (
         <>
           <h2 className="font-bold font-sans text-white text-3xl mb-4">
             {CATEGORY_NAMES[id]}
           </h2>
           <h3 className="subheader-text mt-1.5">
             Your {CATEGORY_NAMES[id]} Details
           </h3>
         </>
       )}
     </div>
   ) : null; // Render header only if section is active

   return (
     <div
       key={id}
       id={id}
       ref={(node) => assignRef(node, id)}
       data-major-section // Add this attribute to easily find the parent section
       className="major-section h-full w-full snap-start snap-always flex flex-col p-8" // Removed opacity here, handled by cards
     >
       {/* Render Header - Animation handled by opacity above */}
       {headerContent}

       {/* --- Content Area --- */}
       <div className="flex-grow relative overflow-hidden"> {/* Container for cards */}
         {isMultiCardSection ? (
           <>
             {/* Example: Pool Selection Cards */}
             {id === CATEGORY_IDS.POOL_SELECTION && poolSubSectionsData.map((subSection, index) => (
               <div
                 key={`${id}-sub-${index}`}
                 ref={(node) => assignRef(node, `${id}-sub-${index}`)} // Assign ref to each sub-section card
                 data-subsection-index={index}
                 // Apply snap-start to individual cards within the major section
                 // Use absolute positioning and opacity for transitions
                 className={cn(
                   "subsection-card absolute inset-0 h-full w-full snap-start transition-opacity duration-500 ease-in-out",
                   activeSection === id && activeSubSectionIndex === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none" // Show only active card
                 )}
               >
                 {/* Render specific card based on subSection.type */}
                 {subSection.type === 'details' && (
                   <Card className="w-full h-full p-5 overflow-y-auto"> {/* Allow card content scroll if needed */}
                     <CardContent className="px-0 space-y-4">
                       {/* Pool Details Content Here, same as before */}
                       <p className="text-sm font-medium">Pool Details</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col"> <span className="font-medium">Model Name</span> <span>{subSection.data.modelName}</span> </div>
                          <div className="flex flex-col"> <span className="font-medium">Range</span> <span>{subSection.data.poolRange}</span> </div>
                          {/* ... other detail fields ... */}
                        </div>
                        <Separator />
                        <p className="text-sm font-medium">Dimensions (m)</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div className="flex flex-col"> <span className="font-medium">Length</span> <span>{subSection.data.dimensions.lengthM}</span> </div>
                           {/* ... other dimension fields ... */}
                        </div>
                     </CardContent>
                   </Card>
                 )}
                 {subSection.type === 'color' && (
                   <Card className="w-full h-full p-5 overflow-y-auto">
                     <CardContent className="px-0 space-y-4">
                       {/* ColourGuard Content Here, same as before */}
                        <p className="text-sm font-medium">ColourGuard® Pool Colour</p>
                         <p className="text-sm text-muted-foreground"> The only dual-surface protection system with a clear layer that protects the colour layer. </p>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col items-center"> <img src="/silver-mist.png" alt="Silver Mist Pool Colour" className="h-24 w-24 object-cover rounded-md mb-2" /> <span className="text-sm font-medium">Pool Colour</span> </div>
                           <div className="flex flex-col items-center"> <img src="/silvermist-water.jpg" alt="Silver Mist Water Colour" className="h-24 w-24 object-cover rounded-md mb-2" /> <span className="text-sm font-medium">Water Colour</span> </div>
                         </div>
                         <p className="text-sm font-medium flex items-center space-x-2 cursor-pointer"> <HelpCircle className="h-4 w-4 text-muted-foreground" title="Learn more about ColourGuard" /> <span>Learn more about ColourGuard</span> </p>
                     </CardContent>
                   </Card>
                 )}
                 {/* Add other card types (pricing etc.) here */}
               </div>
             ))}
             {/* Add rendering logic for other multi-card sections here */}
           </>
         ) : (
           // --- Single Card/Content Sections ---
           <div
              ref={(node) => assignRef(node, `${id}-sub-0`)} // Still observe for consistency, index 0
              data-subsection-index={0}
              className={cn(
                "subsection-card absolute inset-0 h-full w-full snap-start transition-opacity duration-500 ease-in-out", // Use same classes
                 activeSection === id ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none" // Only show if section is active
              )}
            >
             {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                // Customer Info Cards (already structured in previous code)
                 <div className="space-y-6 h-full overflow-y-auto"> {/* Allow scroll within this div if content overflows */}
                   <Card className="w-full p-5">
                       <CardContent className="px-0 space-y-4">
                         <p className="text-sm font-medium">Your Best Contact Details</p>
                         {/* ... Contact details JSX ... */}
                       </CardContent>
                   </Card>
                   <Card className="w-full p-5">
                       <CardContent className="px-0 space-y-4">
                         <p className="text-sm font-medium">Pool Installation Location</p>
                         {/* ... Location JSX ... */}
                       </CardContent>
                   </Card>
                    <Card className="w-full p-5">
                       <CardContent className="px-0 space-y-4">
                         <p className="text-sm font-medium">Complete Pool Quote Includes:</p>
                         {/* ... Quote Summary JSX ... */}
                       </CardContent>
                    </Card>
                </div>
             ) : (
               // Generic placeholder for other single-content sections
               <Card className="w-full h-full p-5 overflow-y-auto">
                 <CardContent>
                   <p>Content for {CATEGORY_NAMES[id]} goes here.</p>
                   {/* Render the actual content based on 'id' */}
                 </CardContent>
               </Card>
             )}
           </div>
         )}
       </div>
       {/* Optional: Add dots/indicators for sub-sections if needed */}
       {isMultiCardSection && activeSection === id && (
          <div className="flex justify-center space-x-2 mt-4">
             {/* Example for Pool Selection */}
             {id === CATEGORY_IDS.POOL_SELECTION && poolSubSectionsData.map((_, index) => (
                <button
                   key={`dot-${id}-${index}`}
                   onClick={() => setActiveSubSectionIndex(index)}
                   className={`h-2 w-2 rounded-full transition-colors ${activeSubSectionIndex === index ? 'bg-white' : 'bg-gray-500 hover:bg-gray-400'}`}
                   aria-label={`Go to sub-section ${index + 1}`}
                 />
             ))}
             {/* Add dots for other multi-card sections */}
          </div>
       )}
     </div>
   );
 })}
Use code with caution.
Jsx
COMMENTS: Restructured the JSX mapping.
Added data-major-section attribute to main section divs.
Moved header rendering inside the main section div and made its visibility/animation dependent on activeSection and isChangingSection.
Created a nested structure for multi-card sections.
Individual cards within multi-card sections now get data-subsection-index, a ref, and snap-start.
Card visibility is controlled by absolute positioning and opacity based on activeSection and activeSubSectionIndex.
Single-content sections are wrapped similarly for consistent animation, but without the mapping.
Added example sub-section indicator dots.
AGENT:
FILE: src/app/proposal/[proposalId]/page.tsx
REMOVE:
// Remove the old left-column div logic
 <div className={`w-full h-full relative rounded overflow-hidden transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
    // ... all the conditional rendering logic inside ...
 </div>
Use code with caution.
Jsx
ADD:
// Replace the old left-column div with this new logic
 // Left Column
 <div className="w-2/3 sticky top-16 flex h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden overscroll-none touch-none proposal-left">
   {(() => {
     // Determine the visual based on active section and sub-section
     const visual = getLeftColumnVisual(activeSection, activeSubSectionIndex);
     // Use activeSection as the key for major transitions
     const transitionKey = activeSection || 'initial';

     return (
       <div key={transitionKey} className="w-full h-full relative rounded overflow-hidden animate-fade-in"> {/* Key change triggers animation */}
         {visual.type === 'map' && isLoaded && mapCenter ? (
           <GoogleMap
             mapContainerStyle={{ width: '100%', height: '100%' }}
             center={mapCenter}
             zoom={21}
             options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                clickableIcons: false,
                maxZoom: 21,
                tilt: 0,
                styles: [
                 { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                 { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                 { featureType: 'transit', stylers: [{ visibility: 'off' }] },
                 { featureType: 'road', stylers: [{ visibility: 'off' }] },
                 { featureType: 'administrative', stylers: [{ visibility: 'off' }] }
                ]
             }}
           >
             <Marker position={mapCenter} />
           </GoogleMap>
         ) : visual.type === 'video' ? (
           <video
             ref={poolVideoRef} // Still needed for play/pause
             key={visual.src} // Key change helps React replace the video element if src changes
             src={visual.src}
             muted
             autoPlay // Let autoplay handle playing on render
             loop
             playsInline
             className="w-full h-full object-cover object-center"
           />
         ) : visual.type === 'image' ? (
           <img
             key={visual.src} // Key change for transitions
             src={visual.src}
             alt={visual.alt}
             className="w-full h-full object-cover object-center"
           />
         ) : visual.type === 'placeholder' ? (
           <>
            <p className="text-xl font-semibold opacity-50 p-4 absolute top-4 left-4 bg-background/80 rounded">
               {visual.name}
             </p>
             <div className="flex items-center justify-center h-full">
               <p className="text-muted-foreground">Visual for {visual.name}</p>
             </div>
           </>
         ) : (
            <div className="flex items-center justify-center h-full">
               <p className="text-muted-foreground">Loading visual...</p>
             </div>
         )}
       </div>
     );
   })()}
 </div>
Use code with caution.
Jsx
COMMENTS: Replaced the left column rendering.
Uses a helper function getLeftColumnVisual (defined in Step 1) to determine the correct visual based on activeSection and activeSubSectionIndex.
Added key={transitionKey} to the outer div where transitionKey is based on activeSection. This forces React to re-mount the component or trigger animations when the major section changes. A simple CSS fade-in animation (animate-fade-in - you'll need to define this in globals.css) is applied for simplicity. More complex cross-fades would require more state and potentially multiple image/video elements.
Still uses poolVideoRef for play/pause control, although the autoPlay attribute will handle initial play when the video element is rendered/replaced due to the key change.
AGENT:
FILE: src/app/globals.css
ADD:
@layer utilities {
  /* Simple fade-in animation */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out forwards; /* Adjust duration/easing as needed */
  }

  /* Optional: styles for sub-section dots if you use them */
  .sub-section-indicator button {
     /* Add styling for the dots */
  }
  .sub-section-indicator button[data-active='true'] {
     /* Add styling for the active dot */
  }
}
Use code with caution.
Css
COMMENTS: Added a basic fade-in animation class required by the new left-column logic. Also added placeholder utility classes for potential sub-section indicator styling.
USER: This completes the primary implementation changes. The next steps involve:
Defining Sub-Section Data: Populate structures like poolSubSectionsData for all sections that need multi-card display.
Implementing getLeftColumnVisual: Fully implement the logic in getLeftColumnVisual to return the correct image/video/map based on all sections and relevant sub-sections.
CSS Animations: Refine the animate-fade-in and potentially add fade-out or cross-fade animations for smoother visual transitions in both columns.
Testing: Thoroughly test scrolling behavior at different speeds, edge cases (scrolling past multiple sections quickly), and across different browsers to ensure the Intersection Observer and scroll snapping work as expected. Adjust rootMargin and thresholds if needed. Test the sub-section indicator dots if implemented.
Refinement: Adjust animation timings, observer thresholds, and potentially add debouncing or throttling to the handleIntersection callback if performance issues arise during rapid scrolling.