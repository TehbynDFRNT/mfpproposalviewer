/**
 * File: src/app/lib/types/pool-details.ts
 * Type definitions for pool names, descriptions, and images
 */

/**
 * Pool details interface
 */
export interface PoolDetail {
  name: string;
  description: string;
  heroImage: string;
  layoutImage: string;
}

/**
 * Pool details mapped by pool spec_name
 */
export const POOL_DETAILS: Record<string, PoolDetail> = {

  'Verona': {
    name: 'Verona',
    description: 'Small geometric pool design perfect for narrow spaces and small backyards. The corner entry steps allow an uninterrupted swim space, whilst the full length bench seat provides the perfect spot to sit and relax.',
    heroImage: '/Pools/Pool-Hero/verona-hero.webp',
    layoutImage: '/Pools/Pool-Layout/verona-layout.webp',
  },
  'Sheffield': {
    name: 'Sheffield',
    description: 'The Sheffield features a sleek, space-saving design, making it ideal for medium-sized backyards. With cleverly positioned side entry steps and extended bench seating, it maximises your swimming area while offering enhanced comfort and safety.',
    heroImage: '/Pools/Pool-Hero/sheffield-hero.webp',
    layoutImage: '/Pools/Pool-Layout/sheffield-layout.webp',
  },
  'Latina': {
    name: 'Latina',
    description: 'Piazza Series',
    heroImage: '/Pools/Pool-Hero/latina-hero.webp',
    layoutImage: '/Pools/Pool-Layout/latina-layout.webp',
  },
  'Small Latina': {
    name: 'Small Latina',
    description: 'A compact version of our popular Latina design, offering the same elegant curves and quality features in a size perfect for smaller yards.',
    heroImage: '/Pools/Pool-Hero/latina-hero.webp',
    layoutImage: '/Pools/Pool-Layout/latina-layout.webp',
  },
  'Westminster': {
    name: 'Westminster',
    description: 'The Westminster is a contemporary, geometric pool design with lots of uninterrupted swimming and play space thanks to unobtrusive side entry steps. The long bench seat is a great spot to chill out while keeping an eye on the kids.',
    heroImage: '/Pools/Pool-Hero/westminster-hero.webp',
    layoutImage: '/Pools/Pool-Layout/westminster-layout.webp',
  },
  'Portofino': {
    name: 'Portofino',
    description: 'Geometric lap pool design perfect for narrow spaces and small backyards. The corner entry steps allow an uninterrupted swim space, whilst the full length bench seat is provides the perfect spot to sit and relax.',
    heroImage: '/Pools/Pool-Hero/portofino-hero.webp',
    layoutImage: '/Pools/Pool-Layout/portofino-layout.webp',
  },
  'Valentina': {
    name: 'Valentina',
    description: 'The modern, geometric style of the Valentina will complement any outdoor area. Ideal for family entertaining, this contemporary pool offers a generous swimming area and plenty of seating for relaxation.',
    heroImage: '/Pools/Pool-Hero/valentina-hero.webp',
    layoutImage: '/Pools/Pool-Layout/valentina-layout.webp',
  },
  'Avellino': {
    name: 'Avellino',
    description: 'The Avellino is the latest addition to our best-selling Piazza Series. At 6m x 4m this modern, geometric design is ideal for smaller outdoor spaces while still offering plenty of space to swim thanks to clever side entry steps. The bench seat running the length of one side is the perfect place to relax in the cool water.',
    heroImage: '/Pools/Pool-Hero/avellino-hero.webp',
    layoutImage: '/Pools/Pool-Layout/avellino-layout.webp',
  },
  'Palazzo': {
    name: 'Palazzo',
    description: 'Piazza Series',
    heroImage: '/Pools/Pool-Hero/palazzo-hero.webp',
    layoutImage: '/Pools/Pool-Layout/palazzo-layout.webp',
  },
  'Kensington': {
    name: 'Kensington',
    description: 'Invite all of your family and friends around for a swim – there\'s plenty of room in the brand new Kensington. At 11m long and 4m wide, it offers plenty of uninterrupted swimming space, perfect for lap swimming or play time with the kids. The long, extended bench seat is a great place to sit and relax on a hot summer\'s day, while triple entry steps in the shallow end and a swim out in the deep end provide two entry points into the pool.',
    heroImage: '/Pools/Pool-Hero/kensington-hero.webp',
    layoutImage: '/Pools/Pool-Layout/kensington-layout.webp',
  },
  'Florentina': {
    name: 'Florentina',
    description: 'Geometric pool design perfect for narrow spaces and small backyards. The corner entry steps allow an uninterrupted swim space, whilst the full length bench seat is provides the perfect spot to sit and relax.',
    heroImage: '/Pools/Pool-Hero/florentina-hero.webp',
    layoutImage: '/Pools/Pool-Layout/florentina-layout.webp',
  },
  'Bellagio': {
    name: 'Bellagio',
    description: 'Geometric medium lap pool design perfect for narrow spaces and small backyards. The corner entry steps allow an uninterrupted swim space, whilst the full length bench seat provides the perfect spot to sit and relax.',
    heroImage: '/Pools/Pool-Hero/bellagio-hero.webp',
    layoutImage: '/Pools/Pool-Layout/bellagio-layout.webp',
  },
  'Sovereign': {
    name: 'Sovereign',
    description: 'The Sovereign is a small fibreglass pool designed to save space whilst still offering a generous swimming area. Incorporating an attractive, geometric, slim-line pool shape and unobtrusive side entry steps, this pool offers the maximum swimming area while still fitting perfectly into smaller backyards.',
    heroImage: '/Pools/Pool-Hero/sovereign-hero.webp',
    layoutImage: '/Pools/Pool-Layout/sovereign-layout.webp',
  },
  'Oxford': {
    name: 'Oxford',
    description: 'The Oxford is a slimline medium pool design with space saving, side entry steps and extended bench seating. Pool Features - Space saving design perfect for smaller backyards - Unobtrusive, side entry steps to maximise the swim area - Extended bench seat for relaxation and added safety - Extended Lifetime Structural Warranty',
    heroImage: '/Pools/Pool-Hero/oxford-hero.webp',
    layoutImage: '/Pools/Pool-Layout/oxford-layout.webp',
  },
  'Empire': {
    name: 'Empire',
    description: 'One of our most popular pools, the Empire is a small fibreglass swimming pool designed to save space whilst still offering a generous swimming area. Incorporating an attractive, geometric, slim-line shape and unobtrusive side entry steps, this pool offers the maximum swimming area while still fitting perfectly into smaller backyards.',
    heroImage: '/Pools/Pool-Hero/empire-hero.webp',
    layoutImage: '/Pools/Pool-Layout/empire-layout.webp',
  },
  'Bellino': {
    name: 'Bellino',
    description: 'The latest trend in pool design with perfectly balanced side entry steps, long seating ledge and generous swimming area. Steps at each end of the bench seat allow for easy entry and exit.',
    heroImage: '/Pools/Pool-Hero/bellino-hero.webp',
    layoutImage: '/Pools/Pool-Layout/bellino-layout.webp',
  },
  'Imperial': {
    name: 'Imperial',
    description: 'The Imperial is a modern, sophisticated medium pool design that is the ideal fit for today\'s modern homes. Stylish side entry steps provide large uninterrupted swim areas whilst the deep-end corner swim-out offers an additional point of safety or the perfect place to sit and relax and enjoy your backyard pool-side lifestyle.',
    heroImage: '/Pools/Pool-Hero/imperial-hero.webp',
    layoutImage: '/Pools/Pool-Layout/imperial-layout.webp',
  },
  'Castello': {
    name: 'Castello',
    description: 'The latest trend in pool design with perfectly balanced side entry steps, long seating ledge and generous swimming area. Steps at each end of the bench seat allow for easy entry and exit.',
    heroImage: '/Pools/Pool-Hero/castello-hero.webp',
    layoutImage: '/Pools/Pool-Layout/castello-layout.webp',
  },
  'Grandeur': {
    name: 'Grandeur',
    description: 'The Grandeur medium fibreglass pool has a modern and sophisticated pool design that is the ideal fit for today\'s modern homes and backyards. Stylish side entry steps provide large uninterrupted swim areas whilst the deep-end corner swim-out offers an additional point of safety or the perfect place to sit and relax and enjoy your poolside lifestyle.',
    heroImage: '/Pools/Pool-Hero/grandeur-hero.webp',
    layoutImage: '/Pools/Pool-Layout/grandeur-layout.webp',
  },
  'Serenity': {
    name: 'Serenity',
    description: 'The Serenity is part of our Vogue Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/serenity-hero.webp',
    layoutImage: '/Pools/Pool-Layout/serenity-layout.webp',
  },
  'Allure': {
    name: 'Allure',
    description: 'The Allure is part of our Vogue Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/allure-hero.webp',
    layoutImage: '/Pools/Pool-Layout/allure-layout.webp',
  },
  'Harmony': {
    name: 'Harmony',
    description: 'The Harmony is part of our Vogue Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/harmony-hero.webp',
    layoutImage: '/Pools/Pool-Layout/harmony-layout.webp',
  },
  'Istana': {
    name: 'Istana',
    description: 'Modern geometric design that will complement any outdoor style',
    heroImage: '/Pools/Pool-Hero/istana-hero.webp',
    layoutImage: '/Pools/Pool-Layout/istana-layout.webp',
  },
  'Terazza': {
    name: 'Terazza',
    description: 'Escape to paradise and experience a luxurious outdoor hideaway in your own backyard with these stylish designs.',
    heroImage: '/Pools/Pool-Hero/terazza-hero.webp',
    layoutImage: '/Pools/Pool-Layout/terazza-layout.webp',
  },
  'Elysian': {
    name: 'Elysian',
    description: 'Escape to paradise and experience a luxurious hideaway of your own with the new Villa Series. The Elysian – 8.3m x 3.3m features a modern, geometric design that will complement any outdoor style. Three full width steps provide easy entry into the pool and can also double as a seating area. Twin deep end swim outs are perfect for rest and relaxation zones.',
    heroImage: '/Pools/Pool-Hero/elysian-hero.webp',
    layoutImage: '/Pools/Pool-Layout/elysian-layout.webp',
  },
  'Bedarra': {
    name: 'Bedarra',
    description: 'Have a beach party in your own backyard with this latest design featuring a generous beach entry area and wide entry steps. A full-length martini seat can be used as a relaxation zone and the confidence ledge is perfect for young children learning to swim. Add a couple of waterproof bean bags to the wading area and you won\'t need to leave home all summer.',
    heroImage: '/Pools/Pool-Hero/bedarra-hero.webp',
    layoutImage: '/Pools/Pool-Layout/bedarra-layout.webp',
  },
  'Hayman': {
    name: 'Hayman',
    description: 'Have a beach party in your own backyard with this latest design featuring a generous beach entry area and wide entry steps. A full-length martini seat can be used as a relaxation zone and the confidence ledge is perfect for young children learning to swim. Add a couple of waterproof bean bags to the wading area and you won\'t need to leave home all summer!',
    heroImage: '/Pools/Pool-Hero/hayman-hero.webp',
    layoutImage: '/Pools/Pool-Layout/hayman-layout.webp',
  },
  'Infinity 3': {
    name: 'Infinity 3',
    description: 'The Infinity 3 is part of our Round Pools Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/infinity-3.0m-hero.webp',
    layoutImage: '/Pools/Pool-Layout/infinity-3.0m-layout.webp',
  },
  'Infinity 4': {
    name: 'Infinity 4',
    description: 'The Infinity 4 is part of our Round Pools Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/infinity-4.0-hero.webp',
    layoutImage: '/Pools/Pool-Layout/infinity-4.0-layout.webp',
  },
  'Terrace 3': {
    name: 'Terrace 3',
    description: 'The Terrace 3 is part of our Round Pools Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/terrace-3-hero.webp',
    layoutImage: '/Pools/Pool-Layout/terrace-3-layout.webp',
  },
  'Amalfi': {
    name: 'Amalfi',
    description: 'The latest trend in pool design with perfectly balanced side entry steps, long seating ledge and generous swimming area. Steps at each end of the bench seat allow for easy entry and exit.',
    heroImage: '/Pools/Pool-Hero/amalfi-hero.webp',
    layoutImage: '/Pools/Pool-Layout/amalfi-layout.webp',
  },
  'Saint-Remy': {
    name: 'Saint-Remy',
    description: 'Holiday at home and indulge in your own pool+spa experience with the Saint-Remy. This design gives you both swimming and relaxation zones all in one, perfect for warm summer nights after a long day at work.',
    heroImage: '/Pools/Pool-Hero/saint-remy-hero.webp',
    layoutImage: '/Pools/Pool-Layout/saint-remy-layout.webp',
  },
  'Saint-Louis': {
    name: 'Saint-Louis',
    description: 'Holiday at home and indulge in your own pool+spa experience with the Saint-Louis. This design gives you both swimming and relaxation zones all in one, perfect for warm summer nights after a long day at work.',
    heroImage: '/Pools/Pool-Hero/saint-louis-hero.webp',
    layoutImage: '/Pools/Pool-Layout/saint-louis-layout.webp',
  },
  'Saint-Grande': {
    name: 'Saint-Grande',
    description: 'The Saint-Grande is a luxurious Pool+Spa combination that perfectly balances swimming and relaxation zones in one elegantly crafted shell. With modern design features including a spacious entry zone, seating for up to 6 adults in the spa, and a seamless spillway, the Saint-Grande brings the holiday experience to your own backyard.',
    heroImage: '/Pools/Pool-Hero/saint-grande-hero.webp',
    layoutImage: '/Pools/Pool-Layout/saint-grande-layout.webp',
  }
};

/**
 * Get pool details from spec name
 * @param specName Pool spec name from snapshot
 * @returns Pool details or default values if not found
 */
export function getPoolDetails(specName: string): PoolDetail {
  // Try exact match first
  if (POOL_DETAILS[specName]) {
    return POOL_DETAILS[specName];
  }
  
  // Try case-insensitive match
  const matchKey = Object.keys(POOL_DETAILS).find(
    key => key.toLowerCase() === specName.toLowerCase()
  );
  
  if (matchKey) {
    return POOL_DETAILS[matchKey];
  }
  
  // Return fallback/default values
  return {
    name: specName || 'Custom Pool',
    description: `The ${specName || 'Custom Pool'} is designed to perfectly complement your outdoor space with elegant proportions and quality construction.`,
    heroImage: '/Pools/Pool-Hero/verona-hero.webp', // Default hero image
    layoutImage: '/Pools/Pool-Layout/verona-layout.webp', // Default layout image
  };
}