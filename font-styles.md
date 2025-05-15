# Font Styles Guide

This document outlines the standard font styles to be used throughout the MFP Proposal Viewer application for consistency.

## Card Components

### Card Headers
- Font size: `text-xl` (1.25rem)
- Font weight: `font-semibold`
- Color: default text color
- Spacing: `mb-1` (margin-bottom)
- Example: `<h3 className="text-xl font-semibold mb-1">Concrete & Paving</h3>`

### Card Header Subtext
- Font size: `text-base`
- Font weight: default (normal)
- Color: `text-muted-foreground`
- Spacing: `mb-4` (margin-bottom)
- Example: `<p className="text-base text-muted-foreground mb-4">Premium surfaces and finishes for your pool area</p>`

### Line Items
- Font size: default (base)
- Font weight: `font-medium`
- Color: default text color
- Example: `<p className="font-medium">{item.label}</p>`

### Line Item Subtext
- Font size: `text-base`
- Font weight: default (normal)
- Color: `text-muted-foreground`
- Layout: Full width row below the line item (not in same column as label)
- Spacing: `mb-4` on each line item container for proper vertical spacing
- Example: 
```jsx
<div className="mb-4">
  <div className="flex justify-between">
    <p className="font-medium">{item.label}</p>
    <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
  </div>
  <p className="text-base text-muted-foreground mt-0.5">{item.detail}</p>
</div>
```

#### Special Line Item Variants

For highlighted or special line items (like discounts or special features):
```jsx
<div className="mb-4">
  <div className="flex justify-between">
    <p className="font-medium text-green-700">Special Discount</p>
    <p className="font-medium whitespace-nowrap text-green-700">-{fmt(discountAmount)}</p>
  </div>
  <p className="text-base text-muted-foreground mt-0.5">Special offer included</p>
</div>
```

### Pricing In Line Items
- Font size: default (base)
- Font weight: `font-medium`
- Style: `whitespace-nowrap`
- Example: `<p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>`

### Card Pricing Summary - Label
- Font size: `text-xl` (same as the value)
- Font weight: `font-semibold`
- Example: `<p className="font-semibold text-xl">Total Cost</p>`

### Card Pricing Summary - Value
- Font size: `text-xl` (same as the label)
- Font weight: `font-semibold`
- Alignment: Use `items-center` to ensure vertical alignment
- Example: 
```jsx
<div className="flex justify-between items-center">
  <p className="font-semibold text-xl">Total Cost</p>
  <p className="text-xl font-semibold">{fmt(totalCost)}</p>
</div>
```

## VIP Card Components

### VIP Card Image
- Width: `w-20` on all breakpoints (mobile, tablet, desktop)
- Height: `h-16` fixed height
- Column spacing: `pr-6` for the image container
- Example:
```jsx
<div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
  <Image
    src="/VipCards/3dstone.webp"
    alt="Premium 3DStone Paver"
    className="w-full h-16 rounded-md object-contain"
    width={80}
    height={64}
  />
</div>
```

### VIP Card Title
- Font size: `text-base`
- Font weight: `font-semibold`
- Responsive layout: VIP tag appears above title on mobile, inline on desktop
- Example:
```jsx
<div className="mb-1">
  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
    VIP
  </span>
  <div className="flex items-center">
    <h3 className="text-base font-semibold">Premium 3D Stone Paver</h3>
    <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
      VIP
    </span>
  </div>
</div>
```

### VIP Card Description
- Font size: `text-base`
- Font weight: default (normal)
- Example: `<p className="text-base mb-1">Natural stone texture with superior durability</p>`

### VIP Card Value Proposition
- Font size: `text-base` (same as card header)
- Font weight: `font-semibold` (same as card header)
- Spacing: `mt-2` top margin

#### Price Proposition Style
For price-based value propositions:
- Price format: RRP + `line-through` price + "Included FREE" in green
- Example:
```jsx
<div className="mt-2">
  <p className="text-base font-semibold">
    <span>RRP </span>
    <span className="line-through">$1,850</span>
  </p>
  <p className="text-base font-semibold text-green-700">Included FREE</p>
</div>
```

#### Quality Proposition Style 
For quality-based value propositions:
- Use a single statement in green
- Example:
```jsx
<p className="mt-2 text-base font-semibold text-green-700">
  Premium Paver Upgrade
</p>
```

## Section Headers (Outside Cards)

### Main Section Headers
- Font size: `text-xl lg:text-3xl`
- Font weight: `font-bold`
- Font family: `font-sans`
- Color: `text-white`
- Example: `<h2 className="font-bold font-sans text-white text-xl lg:text-3xl">Your Selected Pool</h2>`

### Welcome Header
- Font size: `text-2xl lg:text-3xl`
- Font weight: `font-bold`
- Font family: `font-sans`
- Color: `text-white` (with accents in `text-[#DB9D6A]`)
- Example: 
  ```jsx
  <h2 className="header-welcome font-bold font-sans text-white text-2xl lg:text-3xl">
    Welcome <span className="header-owners text-2xl lg:text-3xl !text-[#DB9D6A]">
      {name1} & {name2}
    </span>
  </h2>
  ```

## Form & Interactive Elements

### Button Text
- Font size: default (base)
- Font weight: `font-medium`
- Example: `<Button className="font-medium">Continue</Button>`

### Input Labels
- Font size: `text-sm`
- Font weight: `font-medium`
- Example: `<Label className="text-sm font-medium">Your Name</Label>`

### Select Dropdown Text
- Font size: `text-sm`
- Font weight: default (normal)
- Example: `<Select className="text-sm">...</Select>`