import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const categories = [
  // -------------------- Architecture --------------------
  { name: 'Architecture', parent_id: null, description: 'Buildings, bridges, monuments, city skylines, man-made structures, architectural elements' },
  { name: 'Cityscapes', parent_id: 1, description: 'Urban streets, city skylines, city views, architectural landscapes' },
  { name: 'Buildings', parent_id: 1, description: 'Individual buildings, houses, skyscrapers, temples, castles' },
  { name: 'Bridges', parent_id: 1, description: 'Bridges of all kinds, spanning rivers or valleys, urban or rural' },
  { name: 'Monuments', parent_id: 1, description: 'Statues, memorials, historic monuments, iconic structures' },

  // -------------------- Landscapes --------------------
  { name: 'Landscapes', parent_id: null, description: 'Natural outdoor environments, wide vistas, terrain, scenery' },
  { name: 'Mountains', parent_id: 6, description: 'Mountain ranges, hills, peaks, natural highlands' },
  { name: 'Desert', parent_id: 6, description: 'Sand dunes, arid landscapes, deserts, dry terrain' },
  { name: 'Jungle', parent_id: 6, description: 'Dense tropical forests, jungles, exotic vegetation' },
  { name: 'Forest', parent_id: 6, description: 'Wooded areas, trees, greenery, temperate forests' },
  { name: 'Coast/Beach', parent_id: 6, description: 'Beaches, coastlines, shoreline, ocean views' },

  // -------------------- Water / Seascapes --------------------
  { name: 'Water/Seascapes', parent_id: null, description: 'Bodies of water, oceans, rivers, lakes, seascapes, aquatic environments' },
  { name: 'Rivers/Lakes', parent_id: 12, description: 'Freshwater rivers, lakes, ponds, streams' },
  { name: 'Ocean/Sea', parent_id: 12, description: 'Oceans, seas, coastal waters, open water views' },

  // -------------------- Animals --------------------
  { name: 'Animals', parent_id: null, description: 'Living creatures, wildlife, fauna, land or water animals' },
  { name: 'Land Animals', parent_id: 15, description: 'Mammals, reptiles, birds, insects, terrestrial wildlife' },
  { name: 'Water Animals', parent_id: 15, description: 'Fish, marine mammals, amphibians, aquatic wildlife' },

  // -------------------- Plants --------------------
  { name: 'Plants', parent_id: null, description: 'Vegetation, flora, plants, trees, flowers, greenery' },
  { name: 'Trees', parent_id: 18, description: 'Individual or grouped trees, forests, woods' },
  { name: 'Flowers', parent_id: 18, description: 'Flowers, blossoms, floral arrangements, flowering plants' },
  { name: 'General Vegetation', parent_id: 18, description: 'Grass, shrubs, general plants not specified above' },

  // -------------------- Art --------------------
  { name: 'Art', parent_id: null, description: 'Creative works, visual art, human-made aesthetic creations' },
  { name: 'Statues', parent_id: 22, description: 'Sculptures, stone or metal statues, monuments, figurines' },
  { name: 'Paintings', parent_id: 22, description: 'Paintings, murals, canvases, wall art, traditional or modern' },
  { name: 'Street Art', parent_id: 22, description: 'Graffiti, murals, urban art, public installations' },
  { name: 'Other Artwork', parent_id: 22, description: 'Miscellaneous artwork not fitting above, mixed media' },

  // -------------------- Culture --------------------
  { name: 'Culture', parent_id: null, description: 'Human cultural expressions, traditions, heritage, rituals' },
  { name: 'Religion', parent_id: 27, description: 'Churches, temples, shrines, religious symbols, sacred sites' },
  { name: 'Folklore/Traditions', parent_id: 27, description: 'Myths, legends, traditional costumes, rituals, local folklore' },
  { name: 'Festivals', parent_id: 27, description: 'Festivals, parades, celebrations, public cultural events' },

  // -------------------- Miscellaneous --------------------
  { name: 'Miscellaneous', parent_id: null, description: 'Images that don’t fit into any other category' }
];


async function run() {
  for (const cat of categories) {
    const { error } = await supabase.from('category_vectors').insert(cat);
    if (error) {
      console.error(`Failed to insert ${cat.name}`, error);
    } else {
      console.log(`Inserted category: ${cat.name}`);
    }
  }
}

run();
