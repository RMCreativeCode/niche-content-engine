#!/usr/bin/env npx tsx

/**
 * Seed script — populates the database with 2 real sites and sample content.
 * Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ============================================================
  // SITE 1: The Nano Reef Guide
  // ============================================================
  const { data: site1, error: site1Err } = await supabase.from('sites').insert({
    slug: 'nano-reef-guide',
    domain: 'nanoreefguide.com',
    name: 'The Nano Reef Guide',
    tagline: 'Expert advice for small saltwater aquariums under 20 gallons',
    description: 'The Nano Reef Guide helps reef keepers build and maintain thriving nano reef tanks. From equipment reviews to coral care, stocking guides, and water chemistry — everything you need to succeed with a small saltwater aquarium.',
    theme_config: {
      primaryColor: '#0369a1',
      accentColor: '#06b6d4',
      logoUrl: null,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      navItems: [
        { label: 'Guides', href: '/guides' },
        { label: 'Equipment', href: '/equipment' },
        { label: 'Coral Care', href: '/coral-care' },
        { label: 'Fish', href: '/fish' },
        { label: 'Compare', href: '/compare' },
      ],
    },
    affiliate_config: {
      amazonTag: 'nanoreefguide-20',
      defaultCta: 'Check Price on Amazon',
      customPrograms: [
        { name: 'Bulk Reef Supply', baseUrl: 'https://www.bulkreefsupply.com', tag: 'nrg-brs' },
        { name: 'Marine Depot', baseUrl: 'https://www.marinedepot.com', tag: 'nrg-md' },
      ],
    },
    analytics_config: {
      plausibleDomain: 'nanoreefguide.com',
      searchConsoleId: null,
    },
    status: 'active',
  }).select('id').single();

  if (site1Err) { console.error('Site 1 error:', site1Err); process.exit(1); }
  console.log(`✓ Created site: The Nano Reef Guide (${site1.id})`);

  // Clusters for Site 1
  const { data: clusters1 } = await supabase.from('clusters').insert([
    {
      site_id: site1.id,
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Everything beginners need to know about setting up a nano reef tank',
    },
    {
      site_id: site1.id,
      name: 'Equipment Reviews',
      slug: 'equipment',
      description: 'In-depth reviews and comparisons of nano reef equipment',
    },
    {
      site_id: site1.id,
      name: 'Coral Care',
      slug: 'coral-care',
      description: 'Species-specific coral care guides for nano tanks',
    },
    {
      site_id: site1.id,
      name: 'Fish & Invertebrates',
      slug: 'fish',
      description: 'Stocking guides and species profiles for nano reefs',
    },
  ]).select('id, slug');

  const clusterMap1 = new Map((clusters1 || []).map(c => [c.slug, c.id]));
  console.log(`✓ Created ${clusters1?.length} clusters`);

  // Articles for Site 1
  const { data: articles1 } = await supabase.from('articles').insert([
    {
      site_id: site1.id,
      cluster_id: clusterMap1.get('getting-started'),
      slug: 'best-nano-reef-tank-for-beginners',
      title: 'Best Nano Reef Tank for Beginners: Complete Setup Guide (2026)',
      content_md: `Starting a nano reef tank is one of the most rewarding hobbies in the aquarium world — but it's also one where getting the basics right matters enormously. A nano reef (typically under 20 gallons) is less forgiving than a larger system because small water volumes amplify every mistake.

## Why Nano Reefs Are Worth the Challenge

The appeal is obvious: a stunning slice of ocean on your desk or countertop. But nano reefs also teach you reef chemistry faster than any textbook. You'll learn to read your tank's behavior, understand the nitrogen cycle intimately, and develop the kind of instincts that make you a better reef keeper at any scale.

## Choosing Your Tank

The two most popular entry points are the **Waterbox AIO 10** and the **Innovative Marine Nuvo Fusion 10**. Both are all-in-one (AIO) designs with built-in filtration chambers, which means no external sump or hang-on-back filter cluttering your setup.

### Waterbox AIO 10
The Waterbox has a clean, rimless design with ultra-clear glass. Its rear filtration chambers are well-designed with enough room for a heater, media basket, and return pump. The included pump is adequate but most serious keepers upgrade to a Sicce Syncra Silent 0.5.

### Innovative Marine Nuvo Fusion 10
The Nuvo Fusion is the workhorse of the nano reef world. Slightly more affordable than the Waterbox, with a proven design that thousands of reefers trust. The filtration chamber layout is excellent, and IM sells purpose-built media baskets that fit perfectly.

## Essential Equipment Checklist

Beyond the tank itself, here's what you need on day one:

**Lighting** is the single most important equipment decision for a reef tank. For a 10-gallon nano, the **AI Prime 16HD** is the gold standard. It provides full-spectrum, programmable LED lighting with enough power to keep any coral you'll want in a nano. The **Kessil A80** is a solid alternative if you prefer a more natural shimmer effect.

**Heater**: The **Cobalt Neo-Therm 50W** fits perfectly in most AIO rear chambers. Its flat design and precise thermostat make it the go-to for nano tanks.

**Powerhead**: You need supplemental flow beyond what the return pump provides. The **Sicce Voyager Nano** or a small **EcoTech Vortech MP10** (if budget allows) will create the random, turbulent flow that corals love.

**Test Kits**: At minimum, get the **Red Sea Marine Care Kit** (ammonia, nitrite, nitrate, pH) and the **Red Sea Reef Foundation Kit** (alkalinity, calcium, magnesium). You'll test frequently in the first few months, then less as the tank matures.

**Salt Mix**: **Red Sea Coral Pro** or **Fritz RPM** are both excellent for reef tanks. Mix with RODI water only — never tap water.

## The Cycling Process

This is where patience separates successful reefers from those who give up. The nitrogen cycle takes 4-6 weeks. Here's the honest timeline:

**Week 1-2**: Add a source of ammonia (a raw shrimp or pure ammonia solution) and wait. Ammonia levels will spike. This is normal and necessary — you're growing beneficial bacteria.

**Week 2-4**: Ammonia starts dropping as nitrite-converting bacteria establish. Nitrite spikes. Still normal, still waiting.

**Week 4-6**: Nitrite drops to zero, nitrate appears. When ammonia AND nitrite both read zero for 3 consecutive days, your cycle is complete.

**Do not add fish or coral before the cycle completes.** This is the number one beginner mistake. There are no shortcuts that work reliably.

## Your First Livestock

After cycling, start slow. Add one or two fish, wait two weeks, then consider more. For a 10-gallon nano, your total fish load should be 2-3 small species max.

**Best first fish**: A pair of Ocellaris Clownfish. Hardy, colorful, and they stay small enough for a nano. Buy captive-bred — they're healthier and don't impact wild reefs.

**Best first corals**: Start with soft corals and LPS. Zoanthids, mushrooms (Rhodactis and Discosoma), and Duncan corals are nearly bulletproof in a stable nano. Save SPS corals like Acropora for after you've kept the tank stable for 6+ months.

## Common Mistakes to Avoid

**Overfeeding** is the fastest way to crash a nano reef. Feed small amounts every other day. If food is still floating after 2 minutes, you're feeding too much.

**Chasing numbers** will drive you crazy. Focus on stability over hitting "perfect" parameters. A tank with alkalinity steady at 7.5 dKH is healthier than one that swings between 8 and 10 because you're constantly dosing.

**Skipping water changes** — in a nano, 10-20% weekly water changes are non-negotiable for the first year. They're your primary method of nutrient export and mineral replenishment.

## What to Expect Month by Month

**Month 1**: Ugly phase. Brown diatoms cover everything. This is normal and temporary. Don't scrub obsessively — they'll pass.

**Month 2-3**: Diatoms recede, coralline algae starts appearing (pink/purple patches on rocks and glass). Your cleanup crew is earning its keep.

**Month 3-6**: The tank starts looking like a reef. Corals grow visibly, fish are settled, and you're developing a maintenance routine.

**Month 6+**: This is when nano reefing gets truly rewarding. Your tank has a mature microbiome, parameters are stable, and you can start thinking about more demanding livestock.

The key to nano reefing is patience and consistency. Do less, observe more, and resist the urge to tinker constantly. Your tank will reward you for it.`,
      meta_description: 'Complete guide to choosing and setting up your first nano reef tank. Equipment recommendations, cycling process, first livestock, and month-by-month expectations.',
      meta_keywords: ['nano reef tank', 'beginner reef tank', 'nano reef setup guide', 'best nano reef tank 2026', 'small saltwater aquarium'],
      content_type: 'guide',
      schema_type: 'Article',
      status: 'published',
      published_at: '2026-03-15T10:00:00Z',
    },
    {
      site_id: site1.id,
      cluster_id: clusterMap1.get('fish'),
      slug: 'can-you-keep-mandarin-dragonet-nano-reef',
      title: 'Can You Keep a Mandarin Dragonet in a Nano Reef?',
      content_md: `The Mandarin Dragonet (Synchiropus splendidus) is arguably the most beautiful fish available to reef keepers. Its psychedelic blue and orange pattern makes it the crown jewel of any tank. But keeping one in a nano reef is controversial — and for good reason.

## The Short Answer

It's possible but not recommended for tanks under 20 gallons unless you're willing to commit to a copepod culture. Here's why, and what you need to know if you decide to try.

## The Copepod Problem

Mandarins are obligate pod eaters in the wild. They spend their entire day pecking at live rock, consuming tiny copepods and amphipods. A single Mandarin can eat hundreds of pods per day.

In a large tank (75+ gallons) with abundant live rock, the pod population can sustain itself through natural reproduction. In a nano? The pod population gets decimated within weeks.

### The Math Doesn't Work (Usually)

A 10-gallon nano might sustain a natural pod population of a few hundred at any given time. A Mandarin eats 200-500 per day. You can see the problem — the fish will literally eat itself out of house and home.

## Making It Work: The Copepod Culture Route

The only reliable way to keep a Mandarin in a nano is to maintain a separate copepod culture and dose pods into the tank regularly. This means:

**Setting up a pod culture**: A 5-gallon bucket with an air stone, some phytoplankton (like Nannochloropsis), and a starter culture of Tisbe or Tigriopus copepods. Cost: about $30-40 to start.

**Dosing schedule**: Add a cup of pod-rich water to your display tank every 2-3 days. This supplements the natural population and keeps your Mandarin fed.

**Backup plan**: Keep frozen Cyclops and Reef Nutrition TDO on hand. Some captive-bred Mandarins will accept prepared foods — this is a game-changer if your fish takes to it.

## Captive-Bred vs. Wild-Caught

This is the single biggest factor in nano Mandarin success. **Always buy captive-bred.** Companies like Biota and ORA produce tank-raised Mandarins that are trained to eat prepared foods from birth. A captive-bred Mandarin that accepts frozen food can thrive in a nano reef.

Wild-caught Mandarins almost never accept prepared foods and will slowly starve in a nano unless you're religious about pod dosing.

## Signs Your Mandarin Is Starving

Watch for these warning signs:

The fish's belly should be slightly rounded when viewed from above. A pinched or concave belly means it's not eating enough. By the time the belly is visibly sunken, the fish may be past the point of recovery.

Reduced activity is another red flag. A healthy Mandarin is constantly pecking at rocks. If it's sitting still or hiding during the day, something is wrong.

## Tank Requirements for a Nano Mandarin

**Minimum tank size**: 15 gallons (the extra volume over a 10-gallon makes a meaningful difference in pod population sustainability).

**Live rock**: Pack the tank with quality live rock — at least 15 pounds. This is where pods live and reproduce.

**No competition**: Mandarins are slow, deliberate feeders. Don't keep them with wrasses, gobies, or other pod-eating fish. In a nano, the Mandarin should be the only pod eater.

**Mature tank only**: Wait at least 6 months after cycling before adding a Mandarin. The tank needs an established pod population.

## My Honest Recommendation

If you have a 10-gallon nano: don't do it. The margin for error is too thin, and watching a Mandarin slowly starve is heartbreaking.

If you have a 15-20 gallon nano with mature live rock, a copepod culture, and a captive-bred specimen that eats frozen food: it can work beautifully. But go in with your eyes open about the maintenance commitment.

The Mandarin Dragonet deserves better than being an impulse purchase that ends in a slow decline. If you can meet its needs, it will reward you with years of mesmerizing beauty. If you can't, there are dozens of gorgeous nano-appropriate fish that will thrive with standard care.`,
      meta_description: 'Can a Mandarin Dragonet survive in a nano reef tank? Honest assessment of copepod requirements, tank size needs, and why captive-bred is the only viable option.',
      meta_keywords: ['mandarin dragonet nano reef', 'mandarin goby small tank', 'keeping mandarin in nano', 'copepod culture reef tank'],
      content_type: 'article',
      schema_type: 'Article',
      status: 'published',
      published_at: '2026-03-18T10:00:00Z',
    },
    {
      site_id: site1.id,
      cluster_id: clusterMap1.get('coral-care'),
      slug: 'zoanthid-care-guide-nano-reef',
      title: 'Zoanthid Care Guide: The Perfect Beginner Coral for Nano Reefs',
      content_md: `Zoanthids (often called "zoas") are the gateway drug of coral keeping. They're colorful, hardy, affordable, and come in hundreds of named varieties with increasingly creative names. More importantly, they're one of the few corals that genuinely thrive in nano reef conditions.

## Why Zoas Are Perfect for Nano Tanks

Zoanthids tolerate a wider range of parameters than almost any other coral. They'll grow in low to moderate light, don't need perfect water chemistry, and propagate readily. In a stable nano reef, a small frag can grow into a stunning colony within 6 months.

## Water Parameters for Zoanthids

Here's the reality: zoas are flexible. These are ideal ranges, but they'll tolerate significant deviation:

**Temperature**: 76-80°F (aim for 78°F and keep it stable)
**Salinity**: 1.024-1.026 specific gravity
**Alkalinity**: 7-11 dKH (stability matters more than hitting a specific number)
**Calcium**: 380-450 ppm
**Magnesium**: 1250-1400 ppm
**Nitrate**: 2-20 ppm (zoas actually like slightly "dirty" water — ultra-low nutrient tanks can cause them to lose color)
**Phosphate**: 0.02-0.1 ppm

The most important thing isn't hitting perfect numbers — it's keeping them stable. A tank with alkalinity steady at 8 dKH is infinitely better for zoas than one swinging between 7 and 10.

## Lighting Requirements

Zoanthids are photosynthetic — they house symbiotic zooxanthellae that convert light into energy. But unlike SPS corals, they don't need intense light.

**PAR range**: 80-200 PAR is the sweet spot for most varieties. In a nano tank with an AI Prime 16HD, this means placing zoas in the middle to lower third of the tank. The sandbed and lower rocks are prime real estate.

**Acclimate slowly**: When you get a new frag, place it at the bottom of the tank and gradually move it up over 1-2 weeks. Zoanthids that are blasted with too much light too quickly will close up and may bleach.

**Color and light intensity**: An interesting quirk — many zoa varieties show their best colors under moderate, not high, light. "Designer" varieties with intense fluorescent colors often look better at 100-150 PAR than at 200+.

## Flow

Moderate, indirect flow is ideal. Zoas should sway gently but not be blasted. If polyps are perpetually bent to one side or won't fully open, the flow is too strong.

In a typical AIO nano, the return pump provides enough flow for a zoa-dominant tank. If you add a small powerhead, aim it at the glass so it creates diffuse, indirect flow rather than a direct jet.

## Feeding

Zoanthids get most of their nutrition from light via photosynthesis, but they absolutely benefit from supplemental feeding.

**Broadcast feeding**: A small amount of reef-specific food like Reef-Roids, Benepets, or Coral Frenzy once or twice a week will noticeably accelerate zoa growth. Turn off your return pump and powerheads for 15 minutes, broadcast a small pinch of food into the water, and watch the polyps grab particles. It's one of the most satisfying sights in the hobby.

**Target feeding**: For prized colonies, you can use a turkey baster or Julian's Thing to place food directly on polyps. A tiny amount of Reef-Roids mixed into a paste works well.

## Common Zoanthid Problems

### Zoa Pox
Small white bumps on the polyp mat. Usually caused by a bacterial infection from poor water quality or physical damage. Treatment: freshwater dip (pH and temperature matched) for 5-7 minutes, then improve water quality. Persistent cases may need Furan-2 treatment in a quarantine container.

### Not Opening
If zoas close up and stay closed, check: flow (too strong?), lighting (change recently?), water quality (run your tests), and pests (look for zoa-eating nudibranchs — tiny, translucent, and devastating).

### Zoa-Eating Nudibranchs
These are the nightmare pest for zoa collectors. They're nearly invisible — small, translucent slugs that match the color of the coral they eat. Prevention is key: always dip new frags in CoralRx or Bayer insecticide (diluted) before adding them to your tank. A 10-minute dip will knock off nudibranchs and their eggs.

### Melting
If a colony starts dissolving, it's usually an environmental crash — salinity swing, temperature spike, or severe alkalinity drop. Frag the healthy portions immediately and move them to stable conditions.

## Fragging Zoanthids

Zoas are among the easiest corals to frag. Once a colony covers a rock, you can:

**Method 1**: Use a razor blade or bone cutters to separate a section of the colony along with a piece of the rock base. Glue the frag to a new plug with reef-safe super glue gel.

**Method 2**: Place a frag plug touching the edge of the colony. Within a few weeks, the zoas will naturally encrust onto the new plug. Then simply pry the plug away.

**Safety note**: Zoanthids produce palytoxin, which is dangerous if it contacts your eyes or open wounds. Always wear gloves and eye protection when fragging. Don't boil or microwave live rock with zoas on it (yes, people have done this — the aerosolized palytoxin sent them to the hospital). The risk is low with normal handling, but take basic precautions.

## Recommended Beginner Varieties

If you're just starting with zoas, these varieties are hardy, affordable, and widely available:

**Eagle Eyes**: Classic green with orange center. Bulletproof.
**Bam Bams**: Bright orange. Fast growers.
**Purple Death**: Deep purple. Dramatic under blue lighting.
**Utter Chaos**: Orange and green. One of the most popular varieties for good reason.
**Fire and Ice**: Red and blue/green. Beautiful contrast.

Start with inexpensive, hardy varieties. "Designer" zoas with names like "Fruit Loops" or "Candy Apple Reds" can cost $50-100+ per polyp. Once you've proven you can keep zoas happy, then invest in the pricier varieties.

## The Zoa Garden Approach

Many nano reef keepers build entire tanks around zoanthids — a "zoa garden." The concept is simple: fill your rockwork with a diverse collection of zoa varieties, creating a patchwork of color. It's one of the most visually striking and maintainable nano reef approaches.

A zoa garden works beautifully in a 10-gallon because the corals stay close together and create a dense, colorful landscape without needing the intense lighting and chemistry management that SPS-dominant tanks require.

Pair your zoa garden with a pair of clownfish and a small cleanup crew, and you've got a nano reef that's stunning, relatively easy to maintain, and endlessly expandable as you discover new varieties.`,
      meta_description: 'Complete zoanthid care guide for nano reef tanks. Water parameters, lighting, feeding, pest prevention, fragging tips, and best beginner varieties.',
      meta_keywords: ['zoanthid care guide', 'zoa coral care', 'zoanthids nano reef', 'beginner coral', 'zoa garden'],
      content_type: 'guide',
      schema_type: 'Article',
      status: 'published',
      published_at: '2026-03-20T10:00:00Z',
    },
    {
      site_id: site1.id,
      cluster_id: clusterMap1.get('getting-started'),
      slug: 'nano-reef-water-change-schedule',
      title: 'Nano Reef Water Change Schedule: How Much, How Often, and Why It Matters',
      content_md: `Water changes are the single most important maintenance task in a nano reef. In larger tanks, the water volume provides a buffer against parameter swings. In a 10-20 gallon nano, that buffer barely exists. Regular water changes are your insurance policy against crashes.

## The Basic Schedule

For a nano reef under 20 gallons, here's what works:

**Weekly**: 10-20% water change. This is non-negotiable for the first year. A 10% change on a 10-gallon tank means replacing just one gallon — it takes 15 minutes including prep.

**After the first year**: You can experiment with stretching to every 10-14 days if your parameters are rock-solid and you have a light bioload. But most experienced nano reefers stick with weekly because it's easy and effective.

## Why Small, Frequent Changes Beat Large, Infrequent Ones

A 50% water change every month sounds equivalent to 10% weekly, but it's not. Large water changes create parameter swings — sudden shifts in alkalinity, calcium, and salinity that stress corals. Small, frequent changes keep everything gently balanced.

Think of it like temperature control: it's better to keep a room at 72°F constantly than to let it swing between 65°F and 80°F.

## Preparing Water Correctly

This is where many beginners cut corners, and it always catches up with them.

**Step 1: RODI water only.** If you're not using reverse osmosis/deionized water, you're introducing phosphates, silicates, chloramine, and heavy metals with every water change. A basic RODI unit (like the BRS 4-stage) costs about $60 and pays for itself in reduced algae problems within the first month.

**Step 2: Mix salt 24 hours ahead.** Fill a clean container with RODI water, add your salt mix (Red Sea Coral Pro, Fritz RPM, or Tropic Marin Pro are all excellent), and add a small powerhead or air stone. Let it mix and heat to tank temperature for 24 hours. This ensures complete dissolution and gas exchange.

**Step 3: Match temperature and salinity.** Before adding new water to the tank, verify that the replacement water matches your tank within 0.5°F and 0.001 specific gravity. A refractometer (not a hydrometer) is essential for accurate salinity readings.

## The Water Change Process

**What you need**: A 1-2 gallon container for old water, a container of pre-mixed new water, airline tubing or a small siphon, and a turkey baster.

**Step 1**: Use the turkey baster to blow detritus off rocks and out of coral crevices. This suspends waste in the water column so you can remove it.

**Step 2**: Siphon out the old water, targeting the sandbed and any visible detritus. In a nano, airline tubing gives you more precision than a standard gravel vacuum.

**Step 3**: Slowly add the new water. Don't dump it in — pour gradually or use a drip line. Rapid addition can create a localized salinity or temperature shock near sensitive corals.

**Step 4**: Clean the glass with an algae magnet. Rinse your filter floss or swap in fresh media if you use mechanical filtration.

## What Water Changes Actually Do

It's not just about "removing waste." Water changes serve multiple critical functions:

**Nutrient export**: Removes dissolved nitrate, phosphate, and organic compounds that fuel nuisance algae and stress corals.

**Mineral replenishment**: Fresh salt mix replenishes calcium, alkalinity, magnesium, and trace elements that corals consume. In a nano reef, this is often your primary method of maintaining mineral levels — no dosing pumps needed.

**pH stabilization**: Fresh saltwater has a higher pH and better buffering capacity than old tank water. Regular changes prevent the slow pH decline that plagues closed systems.

**Dilution of unknown compounds**: There are dozens of organic compounds that build up in reef tanks that standard test kits can't measure. Water changes dilute all of them.

## When to Do Extra Water Changes

Certain situations call for water changes beyond your regular schedule:

**After a fish death**: Remove the body immediately and do a 25% water change. Decomposition in a nano can spike ammonia dangerously fast.

**After overfeeding**: If you accidentally dumped extra food in, siphon out what you can and do a 15-20% change.

**After a parameter spike**: If you test and find ammonia or nitrite above zero, do a 25% change immediately and test again in a few hours.

**During a coral health decline**: If corals are closing up and you can't identify the cause, a water change is always a safe first response. It buys you time while you diagnose.

## Common Mistakes

**Using tap water**: Even with dechlorinator, tap water contains phosphates and silicates that fuel algae. RODI is not optional for a reef tank.

**Not mixing salt long enough**: Freshly mixed saltwater has unstable pH and undissolved solids. The 24-hour mixing rule exists for a reason.

**Changing filter media on the same day**: Your biological filtration lives in your filter media. If you change media and do a water change on the same day, you're removing a significant portion of your beneficial bacteria. Stagger these tasks by at least 3 days.

**Skipping changes because "parameters look fine"**: Your test kit measures maybe 5 things. There are hundreds of compounds accumulating that you can't test for. Regular water changes are prophylactic maintenance, not reactive treatment.`,
      meta_description: 'How often to change water in a nano reef tank, how much to change, and the right way to prepare replacement water. Includes schedule, process, and common mistakes.',
      meta_keywords: ['nano reef water change', 'reef tank water change schedule', 'how often water change nano reef', 'saltwater aquarium maintenance'],
      content_type: 'guide',
      schema_type: 'Article',
      status: 'published',
      published_at: '2026-03-22T10:00:00Z',
    },
    {
      site_id: site1.id,
      cluster_id: clusterMap1.get('equipment'),
      slug: 'ai-prime-16hd-review-nano-reef',
      title: 'AI Prime 16HD Review: The Best Light for Nano Reef Tanks',
      content_md: `The Aqua Illumination Prime 16HD has been the default recommendation for nano reef lighting for years — and the latest version cements its position. After running one over a 10-gallon nano for 14 months, here's a thorough, honest review.

## The Quick Take

The AI Prime 16HD is the best overall LED light for nano reef tanks under 20 gallons. It provides enough PAR to grow any coral, offers full spectrum control via a solid app, and has a proven track record in the hobby. It's not the cheapest option, but it's the one you won't outgrow.

## Specifications

**Dimensions**: 4.5" x 4.5" x 1.1"
**Weight**: 1.2 lbs
**LEDs**: 7 channels — UV, Violet, Royal Blue, Blue, Deep Red, Cool White, Moonlight
**Max power draw**: 50W
**Coverage**: Sufficient for a 24" x 24" footprint at moderate PAR
**Control**: Bluetooth + WiFi via myAI app
**Mounting**: Flex arm, tank mount, or gooseneck (sold separately)
**Price**: ~$230 (light only), ~$280 with mounting arm

## PAR Performance

PAR (Photosynthetically Active Radiation) is what matters for coral growth. At 12 inches from the water surface over a 10-gallon tank:

Center directly under the light: ~350 PAR at full power
6 inches off-center: ~200 PAR
Edges of a 20" tank: ~100 PAR
Sandbed (in a 12" tall tank): ~120-180 PAR

This is more than enough for any coral you'd keep in a nano. SPS corals want 200-350 PAR. LPS and soft corals thrive at 80-200 PAR. You'll likely run the light at 50-70% power for a mixed reef nano.

## The myAI App

The app is functional if not beautiful. You create a 24-hour light schedule with ramp-up periods, peak intensity, and sunset. Each of the 7 color channels is independently adjustable.

**What works well**: Scheduling is intuitive. The preset schedules for reef tanks are a good starting point. Firmware updates are delivered through the app. You can control multiple lights from one phone.

**What's annoying**: The Bluetooth connection can be finicky — sometimes it takes 2-3 tries to connect. WiFi mode is more reliable but requires initial Bluetooth setup. The app occasionally forgets your schedule after a firmware update.

**Practical tip**: Set your schedule and forget it. You shouldn't be adjusting light intensity frequently — corals hate change. Set it once, verify PAR with a meter or by observing coral response, and leave it alone.

## Spectrum and Color Rendering

The 7-channel system means you can tune the color appearance of your tank precisely. Most reefers settle on a blue-heavy spectrum (heavy royal blue and blue channels, light violet, minimal white) because it makes fluorescent corals pop.

The UV and violet channels are key — they excite the fluorescent proteins in corals, giving you that electric glow that makes reef tanks mesmerizing. The AI Prime's violet output is notably better than competing lights in this price range.

**My recommended channel settings** (for a mixed reef nano):
UV: 30%, Violet: 50%, Royal Blue: 80%, Blue: 70%, Deep Red: 5%, Cool White: 15%, Moonlight: varies with schedule

## Heat Management

The AI Prime runs warm but not hot. There's no fan — it's passively cooled through the aluminum housing. In a typical room (68-75°F), it won't meaningfully heat your tank water. In a warm room (80°F+), you might see a 1-2°F contribution, which matters in a nano. A clip-on fan blowing across the water surface handles this easily.

## Build Quality and Longevity

Solid aluminum construction, IP67 rated (salt splash resistant). The lens is glass, not plastic, so it won't yellow or haze over time. The mounting bracket is the only weak point — the plastic flex arm works but feels cheap relative to the light itself. Consider the aftermarket gooseneck mounts from AquaLighter or a simple hanging kit.

LED lifespan is rated at 50,000 hours. At 10 hours/day, that's 13+ years. Realistically, you'll want to upgrade before the LEDs dim.

## Compared to Alternatives

**vs. Kessil A80 (~$200)**: The Kessil produces a beautiful, natural shimmer that the AI Prime can't match. But it has fewer color channels, less total PAR, and a less capable controller. If aesthetics are your top priority, consider the Kessil. For growing corals in a nano, the AI Prime wins.

**vs. Noopsyche K7 Pro III (~$120)**: The budget king. Surprisingly good PAR for the price, and it grows corals well. But the app is worse, the build quality is noticeably cheaper, and the color rendering doesn't match the AI Prime. If budget is tight, it's a legitimate option. But you'll likely upgrade within a year.

**vs. EcoTech Radion XR15 (~$400)**: Overkill for a nano. The Radion is a superb light, but it's designed for tanks 24"+ deep. You'd run it at 30% power over a nano and have spent an extra $170 for features you don't need.

## Who Should Buy the AI Prime 16HD

**Yes, buy it if**: You have a nano reef under 20 gallons and want a light you won't outgrow. You plan to keep SPS corals eventually. You want reliable, proven hardware that the reef community trusts.

**Consider alternatives if**: You're on a strict budget (Noopsyche K7 Pro III). You prioritize shimmer over spectrum control (Kessil A80). Your tank is larger than 24" x 24" (you'll need two, or step up to a larger light).

## Final Verdict

The AI Prime 16HD isn't flashy or revolutionary — it's just the most reliable, capable, and well-supported nano reef light on the market. It grows everything from mushrooms to Acropora, the app works (mostly), and it'll last for years. For most nano reefers, it's the right choice and the only light you need.

**Rating: 9/10** — Loses one point for the occasionally frustrating app and the underwhelming stock mounting arm. Everything else is excellent.`,
      meta_description: 'In-depth AI Prime 16HD review after 14 months on a nano reef. PAR data, spectrum settings, app experience, and comparison to Kessil A80 and alternatives.',
      meta_keywords: ['AI Prime 16HD review', 'best nano reef light', 'aqua illumination prime review', 'nano reef LED light'],
      content_type: 'article',
      schema_type: 'Product',
      status: 'published',
      published_at: '2026-03-25T10:00:00Z',
    },
  ]).select('id, slug');

  console.log(`✓ Created ${articles1?.length} articles for Nano Reef Guide`);

  // Products for Site 1
  const { data: products1 } = await supabase.from('products').insert([
    {
      site_id: site1.id,
      name: 'AI Prime 16HD',
      slug: 'ai-prime-16hd',
      category: 'Lighting',
      brand: 'Aqua Illumination',
      model: 'Prime 16HD',
      specs_json: { wattage: '50W', channels: 7, control: 'Bluetooth + WiFi', mounting: 'Flex arm / gooseneck', coverage: '24x24 inches', ip_rating: 'IP67' },
      pros: ['Full 7-channel spectrum control', 'Enough PAR for any nano coral', 'Excellent violet/UV output', 'Solid build quality', 'Large community support'],
      cons: ['App can be finicky via Bluetooth', 'Stock mounting arm feels cheap', 'No fan — runs warm in hot rooms'],
      affiliate_url: 'https://www.amazon.com/dp/B07XXXXXXX?tag=nanoreefguide-20',
      price_range: '$230-280',
      rating: 9.0,
    },
    {
      site_id: site1.id,
      name: 'Kessil A80 Tuna Sun',
      slug: 'kessil-a80',
      category: 'Lighting',
      brand: 'Kessil',
      model: 'A80 Tuna Sun',
      specs_json: { wattage: '15W', channels: 2, control: 'Manual knob or Spectral Controller', mounting: 'Gooseneck', coverage: '18x18 inches' },
      pros: ['Beautiful natural shimmer effect', 'Simple to use — two knobs', 'Compact and quiet', 'Great for soft coral and LPS tanks'],
      cons: ['Less total PAR than AI Prime', 'Limited spectrum tuning', 'Controller sold separately', 'Struggles with demanding SPS'],
      affiliate_url: 'https://www.amazon.com/dp/B07XXXXXXY?tag=nanoreefguide-20',
      price_range: '$180-200',
      rating: 7.5,
    },
    {
      site_id: site1.id,
      name: 'Waterbox AIO 10',
      slug: 'waterbox-aio-10',
      category: 'Tanks',
      brand: 'Waterbox',
      model: 'AIO 10',
      specs_json: { volume: '10 gallons', dimensions: '14x11x12 inches', glass: 'Ultra-clear', filtration: 'Built-in AIO chambers', stand: 'Not included' },
      pros: ['Ultra-clear glass is stunning', 'Well-designed filtration chambers', 'Clean rimless aesthetic', 'Good return pump included'],
      cons: ['More expensive than Nuvo Fusion', 'Stand sold separately', 'Rear chambers slightly narrow for some heaters'],
      affiliate_url: 'https://www.amazon.com/dp/B07XXXXXXXZ?tag=nanoreefguide-20',
      price_range: '$150-180',
      rating: 8.5,
    },
  ]).select('id, slug');

  console.log(`✓ Created ${products1?.length} products`);

  // Comparison for Site 1
  const aiPrimeId = products1?.find(p => p.slug === 'ai-prime-16hd')?.id;
  const kessilId = products1?.find(p => p.slug === 'kessil-a80')?.id;

  if (aiPrimeId && kessilId) {
    await supabase.from('comparisons').insert({
      site_id: site1.id,
      title: 'AI Prime 16HD vs Kessil A80: Best Nano Reef Light in 2026',
      slug: 'ai-prime-vs-kessil-a80',
      description: 'Head-to-head comparison of the two most popular nano reef lights. PAR output, spectrum control, ease of use, and value.',
      product_ids: [aiPrimeId, kessilId],
      comparison_axes: [
        { label: 'Max Wattage', spec_key: 'wattage', higher_is_better: true },
        { label: 'Color Channels', spec_key: 'channels', higher_is_better: true },
        { label: 'Control Method', spec_key: 'control', higher_is_better: false },
        { label: 'Coverage Area', spec_key: 'coverage', higher_is_better: true },
      ],
      verdict_md: `Both are excellent lights, but they serve different priorities. The **AI Prime 16HD** is the better choice if you plan to keep SPS corals, want granular spectrum control, or might upgrade to a larger nano down the road. The **Kessil A80** wins on aesthetics — its shimmer effect is genuinely more natural-looking — and simplicity. For a soft coral or LPS-dominant nano, the Kessil is delightful. For a mixed reef with growth ambitions, the AI Prime is the safer bet.`,
      status: 'published',
      published_at: '2026-03-26T10:00:00Z',
    });
    console.log('✓ Created comparison: AI Prime vs Kessil A80');
  }

  // Content queue items for Site 1
  await supabase.from('content_queue').insert([
    {
      site_id: site1.id,
      content_type: 'article',
      topic: 'How to set up an auto top-off (ATO) system for a nano reef tank',
      prompt_params: {
        cluster_id: clusterMap1.get('equipment'),
        content_type: 'how-to',
        target_keywords: ['nano reef ATO', 'auto top off nano tank', 'ATO system reef tank'],
        audience: 'intermediate nano reef keepers',
      },
      status: 'pending',
      scheduled_for: new Date().toISOString(),
    },
    {
      site_id: site1.id,
      content_type: 'article',
      topic: 'Hammer Coral care in a nano reef: placement, feeding, and common issues',
      prompt_params: {
        cluster_id: clusterMap1.get('coral-care'),
        content_type: 'guide',
        target_keywords: ['hammer coral care', 'euphyllia nano reef', 'hammer coral placement'],
        audience: 'beginner to intermediate reefers',
      },
      status: 'pending',
      scheduled_for: new Date().toISOString(),
    },
  ]);
  console.log('✓ Queued 2 articles for generation');

  // ============================================================
  // SITE 2: Protein Skimmer Comparison
  // ============================================================
  const { data: site2, error: site2Err } = await supabase.from('sites').insert({
    slug: 'protein-skimmer-comparison',
    domain: 'proteinskimmercompare.com',
    name: 'Protein Skimmer Comparison',
    tagline: 'Data-driven reviews and comparisons for every reef tank skimmer',
    description: 'Protein Skimmer Comparison is the most comprehensive database of protein skimmer specifications, reviews, and head-to-head comparisons. Find the right skimmer for your tank size, sump dimensions, and budget.',
    theme_config: {
      primaryColor: '#059669',
      accentColor: '#10b981',
      logoUrl: null,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      navItems: [
        { label: 'Reviews', href: '/reviews' },
        { label: 'Compare', href: '/compare' },
        { label: 'Sizing Guide', href: '/sizing-guide' },
        { label: 'Best Of', href: '/best-of' },
      ],
    },
    affiliate_config: {
      amazonTag: 'skimmercomp-20',
      defaultCta: 'Check Current Price',
      customPrograms: [
        { name: 'Bulk Reef Supply', baseUrl: 'https://www.bulkreefsupply.com', tag: 'sc-brs' },
      ],
    },
    analytics_config: {
      plausibleDomain: 'proteinskimmercompare.com',
    },
    status: 'active',
  }).select('id').single();

  if (site2Err) { console.error('Site 2 error:', site2Err); process.exit(1); }
  console.log(`\n✓ Created site: Protein Skimmer Comparison (${site2.id})`);

  // A couple articles for Site 2
  await supabase.from('articles').insert([
    {
      site_id: site2.id,
      slug: 'best-protein-skimmers-under-300',
      title: 'Best Protein Skimmers Under $300 (2026)',
      content_md: `Finding a quality protein skimmer under $300 is entirely doable — this is actually the sweet spot where you get excellent performance without paying for features most hobbyists don't need. After testing and researching dozens of models, here are the skimmers worth your money.

## What Makes a Good Skimmer at This Price

At the sub-$300 level, you're looking at cone-body or DC-powered skimmers that handle tanks up to 150-200 gallons. The key differentiators are: pump quality (DC pumps are quieter and more adjustable), body design (cone bodies produce drier skimmate), footprint (will it fit your sump?), and ease of tuning.

## Our Top Picks

### 1. Reef Octopus Classic 150-S ($180)
The Classic 150 has been a staple recommendation for years, and for good reason. It's a pinwheel skimmer rated for tanks up to 150 gallons, with a relatively small footprint. The Aquatrance 1000-S pump is reliable and easy to find replacement parts for.

**Best for**: Budget-conscious reefers with tanks up to 150 gallons who want proven, reliable performance.

### 2. Nyos Quantum 120 ($280)
The Quantum 120 is a beautifully designed skimmer with a DC pump. It's quieter than AC-powered alternatives, has a smaller footprint than you'd expect for its rating (up to 160 gallons), and produces consistently excellent skimmate with minimal tuning.

**Best for**: Reefers who value quiet operation and are willing to pay a premium for build quality.

### 3. Aqua Excel AE-EC120 ($160)
A cone-body skimmer with impressive performance for the price. It's not the quietest or most refined option, but dollar-for-dollar it may be the best value in this range. The cone body naturally produces drier skimmate than straight-body designs.

**Best for**: Maximum skimming performance per dollar. Great for heavily stocked tanks.

## Sizing Your Skimmer

A common mistake is buying a skimmer rated exactly for your tank size. Skimmer ratings are optimistic — a skimmer "rated for 150 gallons" will perform better and require less tuning on a 100-gallon system. Buy one size up if your budget allows.

Also consider bioload, not just water volume. A 75-gallon tank packed with fish needs more skimming capacity than a 120-gallon tank with a light bioload.

## AC vs. DC Pumps

DC pump skimmers ($200+) offer variable speed control, quieter operation, and lower power consumption. AC pump skimmers ($100-180) are simpler, cheaper, and have fewer failure points. For a skimmer you'll run 24/7 for years, the DC pump's quiet operation is worth the premium if it's in your budget.`,
      meta_description: 'Detailed comparison of the best protein skimmers under $300 in 2026. Reef Octopus, Nyos Quantum, and more — with sizing guide and pump type comparison.',
      meta_keywords: ['best protein skimmer under 300', 'protein skimmer comparison 2026', 'reef octopus vs nyos', 'best reef tank skimmer'],
      content_type: 'listicle',
      schema_type: 'Article',
      status: 'published',
      published_at: '2026-03-20T10:00:00Z',
    },
  ]);
  console.log('✓ Created 1 article for Protein Skimmer Comparison');

  console.log('\n✅ Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
