#!/usr/bin/env node
/**
 * Uses an LLM (via OpenRouter) to generate Unsplash search queries
 * for each fundraiser title template, then downloads matching images.
 *
 * Usage: node scripts/match-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, '..', 'public', 'images', 'fundraisers');
const OPENROUTER_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const UNSPLASH_ACCESS_KEY = null; // We'll use source.unsplash.com which doesn't need a key

// All 200 title templates grouped by category
const TEMPLATES = {
  emergency: [
    'Hurricane Relief for {city} Families',
    '{city} Wildfire Evacuation Fund',
    'Flood Recovery — {city} Neighborhood',
    'Tornado Damage Repair in {city}',
    'Emergency Housing After {city} Fire',
    'Storm Damage Relief for {city}',
    '{city} Earthquake Recovery Fund',
    'Disaster Preparedness Kit Drive — {city}',
    'Emergency Medical Aid for {city} Victims',
    '{city} Community Emergency Response Fund',
    'Winter Storm Relief for {city} Residents',
    'Power Outage Recovery Aid — {city}',
    '{city} Mudslide Relief and Rebuilding',
    'Help {city} Families After Devastating Flood',
    'Emergency Shelter for {city} Displaced Families',
    'Rebuild {city} After Category 4 Hurricane',
    'Flash Flood Emergency Aid — {city} County',
    '{city} Heatwave Emergency Cooling Centers',
    'Search and Rescue Support — {city} Disaster',
    'Emergency Water Supply for {city} After Pipe Burst',
  ],
  medical: [
    "Help {name} Beat Cancer",
    "{name}'s Fight Against Leukemia",
    "Surgery Fund for {name}",
    "Help {name} Cover Medical Bills",
    "{name} Needs a Life-Saving Transplant",
    "Chemotherapy Fund for {name}",
    "{name}'s Recovery After Car Accident",
    "Help {name} Get a Wheelchair",
    "Mental Health Treatment for {name}",
    "{name}'s Dialysis Treatment Fund",
    "Prosthetic Leg for {name}",
    "Heart Surgery for Baby {name}",
    "{name}'s Autism Therapy Fund",
    "Rare Disease Treatment for {name}",
    "Help {name} Access Insulin",
    "{name} Needs Emergency Brain Surgery",
    "Burn Recovery Treatment for {name}",
    "Physical Therapy Fund for {name}",
    "{name}'s NICU Medical Bills",
    "Spinal Cord Injury Recovery — {name}",
  ],
  education: [
    'Send {name} to College',
    'STEM Lab for {city} Elementary',
    'Scholarship Fund for {city} Students',
    'Books and Supplies for {city} Kids',
    'After-School Tutoring in {city}',
    '{city} School Technology Upgrade',
    'Music Instruments for {city} School',
    'Special Education Resources — {city}',
    'Coding Bootcamp Scholarships — {city}',
    'ESL Classes for {city} Immigrant Families',
    'Free GED Prep Program — {city}',
    '{city} Literacy Drive for Adults',
    'STEM Robotics Club — {city} Middle School',
    'College Prep Program for {city} Youth',
    'Library Renovation for {city} High School',
    'Art Supplies for {city} Elementary',
    'Teacher Appreciation Fund — {city}',
    'Summer School Program for {city} Kids',
    '{city} Student Laptop Drive',
    'Montessori Scholarships for {city}',
  ],
  nonprofit: [
    '{city} Clean Water Project',
    'Homeless Shelter Expansion — {city}',
    '{city} Youth Mentorship Program',
    'Free Legal Aid — {city}',
    'Senior Care Program for {city}',
    '{city} Nonprofit Annual Drive',
    'Meals on Wheels — {city} Chapter',
    '{city} Job Training Center',
    'Mental Health Hotline — {city}',
    'Immigrant Services in {city}',
    '{city} Domestic Violence Safe House',
    'Free Clinic Expansion — {city}',
    'Substance Abuse Recovery — {city}',
    'Housing First Program — {city}',
    'Disability Services Center — {city}',
    '{city} Prison Reentry Support',
    'Financial Literacy Workshop — {city}',
    'Free Dental Clinic — {city}',
    '{city} Hunger Relief Network',
    'Refugee Resettlement in {city}',
  ],
  community: [
    '{city} Community Garden Project',
    'Build a Playground in {city}',
    '{city} Neighborhood Beautification',
    'Food Pantry for {city} Families',
    '{city} Block Party Fund',
    'Farmers Market Stand for {city}',
    '{city} Dog Park Construction',
    'Community Center Renovation — {city}',
    '{city} Public Mural Project',
    'Sidewalk Repair Drive — {city}',
    '{city} Neighborhood Watch Program',
    'Community Kitchen — {city}',
    'Street Light Campaign — {city}',
    '{city} Free WiFi Zones',
    'Tool Library for {city}',
    '{city} Little Free Library Network',
    'Bike Repair Station — {city}',
    '{city} Community Fridge Project',
    'Baby Supplies Exchange — {city}',
    'Neighbor-to-Neighbor Aid — {city}',
  ],
  animals: [
    'Save {city} Animal Shelter',
    'Rescue Dogs of {city}',
    '{city} Cat TNR Program',
    'Wildlife Rehabilitation — {city}',
    '{city} Horse Rescue Fund',
    'Spay/Neuter Drive — {city}',
    '{city} Foster Care for Puppies',
    'Emergency Vet Bills for Strays — {city}',
    'Senior Pet Sanctuary — {city}',
    '{city} Exotic Animal Rescue',
    'Barn Cat Rescue — {city} County',
    '{city} Marine Animal Rehab',
    'Service Dog Training Fund — {city}',
    '{city} Animal Cruelty Prevention',
    'Therapy Animals for {city} Hospitals',
    'Feral Cat Colony Care — {city}',
    '{city} Pet Food Bank',
    'Emergency Animal Evacuation Kit — {city}',
    '{city} Parrot Rescue Network',
    'Rabbit Rescue and Rehoming — {city}',
  ],
  environment: [
    '{city} River Cleanup Project',
    'Solar Panels for {city} Schools',
    '{city} Urban Tree Planting',
    'Beach Cleanup — {city} Coast',
    'Community Composting in {city}',
    '{city} Air Quality Monitors',
    'Wetland Restoration — {city}',
    '{city} Recycling Education Drive',
    'Rain Garden Installation — {city}',
    'EV Charging Stations for {city}',
    'Pollinator Garden — {city} Park',
    '{city} Watershed Protection Fund',
    'Ocean Plastic Removal — {city}',
    '{city} Green Roof Initiative',
    'Native Plant Restoration — {city}',
    'Microplastic Research — {city} Harbor',
    '{city} Community Solar Farm',
    'Trail Restoration — {city} Mountains',
    'Noise Pollution Study — {city}',
    'Lead Pipe Replacement — {city}',
  ],
  memorial: [
    'In Memory of {name}',
    "Memorial Fund for {name}'s Family",
    '{name} Memorial Scholarship',
    'Honoring {name} — Family Support',
    '{name} Memorial Playground',
    'Celebration of Life — {name}',
    '{name} Memorial Bench at {city} Park',
    'Legacy Fund in Honor of {name}',
    '{name} Memorial Garden',
    'Tribute to {name} — Community Fund',
    'Officer {name} Memorial Fund',
    'Firefighter {name} Family Support',
    '{name} Memorial Music Scholarship',
    'Coach {name} Youth Fund',
    'Teacher {name} Memorial Library',
    'Nurse {name} Healthcare Fund',
    '{name} Memorial Art Installation',
    'In Loving Memory of {name}',
    '{name} Memorial 5K Run Fund',
    'Veteran {name} Family Aid',
  ],
  sports: [
    '{city} Youth Soccer League Fund',
    'Basketball Courts for {city}',
    '{city} Little League Equipment',
    'Swimming Lessons for {city} Kids',
    'Track and Field — {city} Youth',
    '{city} Girls Volleyball Team',
    'Adaptive Sports Program — {city}',
    '{city} Youth Wrestling Club',
    'Tennis Courts Renovation — {city}',
    '{city} Community Pool Repair',
    'Martial Arts Program — {city}',
    '{city} Running Club for Teens',
    'Lacrosse Equipment — {city}',
    '{city} Figure Skating Fund',
    'Gymnastics Scholarships — {city}',
    '{city} Youth Hockey League',
    'Rowing Club Equipment — {city}',
    '{city} Youth Flag Football',
    'Skateboard Park — {city}',
    '{city} Youth Cycling Team',
  ],
  other: [
    '{city} Arts Festival Fund',
    'Music Instruments for {city} Band',
    'Community Theater in {city}',
    '{city} Film Festival Support',
    'Podcast Studio for {city} Youth',
    '{city} Street Art Festival',
    'Photography Workshop — {city}',
    'Dance Recital Fund — {city}',
    '{city} Writers Workshop',
    'Pottery Studio for {city}',
    'Comedy Night Fundraiser — {city}',
    '{city} Jazz Festival Fund',
    'Documentary Film — {city} Stories',
    'Maker Space for {city} Teens',
    'Fashion Design Program — {city}',
    '{city} Craft Fair Organization',
    'Animation Workshop — {city}',
    'Culinary Arts Camp — {city}',
    '{city} Open Mic Night Series',
    'Digital Art Lab — {city}',
  ],
};

// Slugify a template into a filename
function slugify(text) {
  return text.toLowerCase()
    .replace(/\{city\}/g, '')
    .replace(/\{name\}/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

// Call LLM to get best Unsplash search queries for a batch of templates
async function getSearchQueries(templates) {
  const prompt = `You are helping find stock photos on Unsplash for GoFundMe-style fundraiser campaigns.

For each fundraiser title template below, provide a 2-4 word Unsplash search query that would find a highly relevant, emotionally compelling hero image for that campaign. The image should clearly relate to the campaign topic.

Rules:
- Be SPECIFIC to the campaign topic (e.g. "hurricane damage debris" not just "disaster")
- Think about what a viewer would expect to see as the hero image for this fundraiser
- Prefer photos with people when appropriate (not abstract or overly artsy)
- For medical campaigns: hospital, treatment, or family-related images
- For memorial campaigns: peaceful, dignified images (flowers, sunsets, candles)
- For animal campaigns: actual photos of those specific animals
- For sports: action shots of that specific sport

Return ONLY a JSON object mapping each template string to its search query. No markdown, no explanation.

Templates:
${JSON.stringify(templates, null, 2)}`;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to parse LLM response:', content.slice(0, 200));
    return {};
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    console.error('Content:', jsonMatch[0].slice(0, 200));
    return {};
  }
}

// Download an image from Unsplash search
async function downloadImage(query, filename) {
  const filepath = path.join(IMG_DIR, filename);

  // Use Unsplash source (no API key needed)
  const url = `https://source.unsplash.com/1200x600/?${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      console.error(`  ❌ Failed to download: ${query} → ${response.status}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Verify it's a JPEG
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
      console.error(`  ❌ Not a JPEG: ${query}`);
      return false;
    }

    fs.writeFileSync(filepath, buffer);
    console.log(`  ✅ ${filename} (${(buffer.length / 1024).toFixed(0)}KB) ← "${query}"`);
    return true;
  } catch (e) {
    console.error(`  ❌ Error downloading ${query}: ${e.message}`);
    return false;
  }
}

// Alternative: Use Unsplash API search endpoint (more reliable)
async function downloadImageViaSearch(query, filename) {
  const filepath = path.join(IMG_DIR, filename);

  // Try multiple approaches
  // Approach 1: Direct Unsplash photo URL with search terms
  const searchUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

  try {
    const searchResp = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (searchResp.ok) {
      const searchData = await searchResp.json();
      const photo = searchData.results?.[0];
      if (photo) {
        const imgUrl = `${photo.urls.raw}&w=1200&h=600&fit=crop&crop=faces,center`;
        const imgResp = await fetch(imgUrl);
        if (imgResp.ok) {
          const buffer = Buffer.from(await imgResp.arrayBuffer());
          if (buffer.length > 1000) {
            fs.writeFileSync(filepath, buffer);
            console.log(`  ✅ ${filename} (${(buffer.length / 1024).toFixed(0)}KB) ← "${query}"`);
            return true;
          }
        }
      }
    }
  } catch (e) {
    // Fall through to backup
  }

  // Approach 2: source.unsplash.com redirect
  return downloadImage(query, filename);
}

async function main() {
  console.log('🔍 Generating search queries via LLM for all 200 templates...\n');

  // Ensure image directory exists
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const allMappings = {}; // template → { query, filename }

  // Process each category
  for (const [category, templates] of Object.entries(TEMPLATES)) {
    console.log(`\n📂 ${category.toUpperCase()} (${templates.length} templates)`);
    console.log('  Asking LLM for search queries...');

    const queries = await getSearchQueries(templates);

    for (const template of templates) {
      const query = queries[template] || `${category} fundraiser`;
      const filename = `${category}-${slugify(template)}.jpg`;

      allMappings[template] = { query, filename: `/images/fundraisers/${filename}` };

      console.log(`  📷 "${template}" → "${query}"`);
    }

    // Download images for this category (with rate limiting)
    console.log(`  ⬇️  Downloading ${templates.length} images...`);

    for (const template of templates) {
      const { query, filename } = allMappings[template];
      const localFilename = filename.replace('/images/fundraisers/', '');
      await downloadImageViaSearch(query, localFilename);
      // Small delay to be nice to Unsplash
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Write the mapping file for contentGenerator to use
  console.log('\n\n📝 Writing template → image mapping...');

  const mappingCode = `// Auto-generated by scripts/match-images.mjs
// Maps each title template to its LLM-matched image
export const TITLE_TEMPLATE_IMAGES: Record<string, string> = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(allMappings).map(([k, v]) => [k, v.filename])
    ),
    null,
    2
  )};
`;

  const mappingPath = path.join(IMG_DIR, '..', '..', '..', 'src', 'lib', 'titleImageMap.ts');
  fs.writeFileSync(mappingPath, mappingCode);
  console.log(`  Written to: ${mappingPath}`);

  // Also output a summary JSON for debugging
  const summaryPath = path.join(IMG_DIR, '_image-mapping.json');
  fs.writeFileSync(summaryPath, JSON.stringify(allMappings, null, 2));
  console.log(`  Debug mapping: ${summaryPath}`);

  console.log('\n✅ Done! All images downloaded and mapped.');
}

main().catch(console.error);
