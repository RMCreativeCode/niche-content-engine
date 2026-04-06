-- ============================================================
-- NEXT WAVE SITE LAUNCHES — Ready to execute
-- Run each block in Supabase Studio SQL Editor
-- Project: NicheContentEngine (jhdeiyjqifoijwwakyrq)
-- Domains are $11.25/yr each, all verified available as of 2026-04-01
-- Buy at: https://vercel.com/domains (or Namecheap/GoDaddy)
-- ============================================================


-- ============================================================
-- SITE 1: homeespressoguide.com
-- Niche score: 19/20 — highest affiliate commissions (25%+), high AOV
-- ============================================================

INSERT INTO sites (name, slug, domain, description, theme_config, author_persona)
VALUES (
  'Home Espresso Guide',
  'home-espresso-guide',
  'homeespressoguide.com',
  'Expert reviews and comparisons of home espresso machines, grinders, and accessories',
  '{
    "primaryColor": "#6f3c1f",
    "accentColor": "#c2853a",
    "fontFamily": "Inter",
    "navItems": [{"href":"/","label":"Articles"},{"href":"/compare","label":"Comparisons"}]
  }'::jsonb,
  'Marco Gentile, a former barista and home espresso obsessive who has owned and tested over 40 machines across every price tier from $200 Dedicas to $4000 Decent Espresso setups'
);

-- After running above, get the site ID:
-- SELECT id FROM sites WHERE slug = 'home-espresso-guide';
-- Then replace [ESPRESSO_ID] below with that UUID

INSERT INTO content_queue (site_id, content_type, topic, prompt_params, status, scheduled_for)
VALUES
  ('[ESPRESSO_ID]', 'article', 'Best home espresso machines under $500: honest rankings for beginners',
   '{"content_type":"listicle","target_keywords":["best espresso machine under 500","beginner espresso machine"],"audience":"home coffee enthusiasts buying their first real machine","angle":"cut through the noise — most budget machines fail at temperature stability, focus on that"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'Gaggia Classic Pro vs Rancilio Silvia: the two machines everyone recommends',
   '{"content_type":"comparison","target_keywords":["Gaggia Classic Pro vs Rancilio Silvia","gaggia classic review"],"audience":"intermediate home baristas choosing their first prosumer machine","angle":"real-world daily use difference, not spec sheets — focus on workflow, steaming, and mod potential"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'How to choose an espresso grinder: burr size, RPM, and retention explained',
   '{"content_type":"guide","target_keywords":["best espresso grinder","how to choose espresso grinder","burr grinder guide"],"audience":"home baristas who understand that the grinder matters as much as the machine","angle":"explain burr geometry, RPM, retention in plain English with concrete recommendations at each price tier"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'Single boiler vs heat exchanger vs dual boiler: which do you actually need?',
   '{"content_type":"guide","target_keywords":["single boiler vs dual boiler espresso","heat exchanger espresso machine"],"audience":"home baristas confused by boiler terminology when shopping","angle":"focus on workflow impact, not engineering — explain the wait times, temperature surf, and milk frothing tradeoffs"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'Breville Barista Express review: is the built-in grinder a good idea?',
   '{"content_type":"article","target_keywords":["Breville Barista Express review","espresso machine with built-in grinder"],"audience":"beginners who want an all-in-one machine","angle":"honest take — convenient but you sacrifice grinder quality; explain exactly where the tradeoff hurts and when it does not matter"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'Espresso extraction troubleshooting: sour, bitter, and weak shots diagnosed',
   '{"content_type":"how-to","target_keywords":["espresso troubleshooting","sour espresso fix","bitter espresso why"],"audience":"home baristas whose shots do not taste right","angle":"symptom-first format — start with what they taste or see, then diagnose grind, dose, tamp, temperature in order"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'Lever vs pump espresso machines: manual pressure control for home baristas',
   '{"content_type":"comparison","target_keywords":["lever espresso machine","manual espresso machine","pump vs lever"],"audience":"experienced home baristas curious about lever machines","angle":"practical deep-dive — explain pressure profiling, the learning curve, and which lever machines are actually worth the money"}',
   'pending', NOW()),
  ('[ESPRESSO_ID]', 'article', 'How to dial in espresso: a step-by-step guide to consistent shots',
   '{"content_type":"how-to","target_keywords":["how to dial in espresso","espresso dialing in guide","espresso shot ratio"],"audience":"new home baristas struggling with inconsistent results","angle":"systematic approach: ratio first, then grind, then tamp — give specific numbers and show what to adjust when"}',
   'pending', NOW());


-- ============================================================
-- SITE 2: mechkeyboardguide.com
-- Niche score: 18/20 — passionate community, high AOV, endless content
-- ============================================================

INSERT INTO sites (name, slug, domain, description, theme_config, author_persona)
VALUES (
  'Mech Keyboard Guide',
  'mech-keyboard-guide',
  'mechkeyboardguide.com',
  'In-depth mechanical keyboard reviews, switch comparisons, and build guides for every budget',
  '{
    "primaryColor": "#7c3aed",
    "accentColor": "#a78bfa",
    "fontFamily": "Inter",
    "navItems": [{"href":"/","label":"Articles"},{"href":"/compare","label":"Comparisons"}]
  }'::jsonb,
  'Tyler Huang, a software engineer and keyboard collector who has built over 60 custom boards and tested switches across every major manufacturer since 2018'
);

-- SELECT id FROM sites WHERE slug = 'mech-keyboard-guide';
-- Replace [KEYBOARD_ID] below

INSERT INTO content_queue (site_id, content_type, topic, prompt_params, status, scheduled_for)
VALUES
  ('[KEYBOARD_ID]', 'article', 'Best mechanical keyboards under $100 for coding and productivity',
   '{"content_type":"listicle","target_keywords":["best mechanical keyboard under 100","mechanical keyboard for coding"],"audience":"programmers and office workers buying their first or second mechanical keyboard","angle":"focus on typing feel and sound profile over RGB and gaming features — what actually matters for 8-hour workdays"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'Cherry MX vs Gateron vs Akko switches: which should you buy in 2026?',
   '{"content_type":"comparison","target_keywords":["Cherry MX vs Gateron","best keyboard switches","switch comparison"],"audience":"keyboard buyers confused by switch options","angle":"be direct — Gateron wins on smoothness for the price, Cherry has the reliability track record; explain why both claims are true and who should care about each"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'Tactile vs linear vs clicky switches: how to choose without trying them first',
   '{"content_type":"guide","target_keywords":["tactile vs linear switches","clicky vs tactile keyboard","how to choose keyboard switches"],"audience":"first-time buyers who cannot try switches in person","angle":"frame it by use case and environment — home office vs open office vs gaming, with specific switch recommendations for each"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'Hot-swap keyboards explained: why it matters and the best hot-swap boards',
   '{"content_type":"guide","target_keywords":["hot swap keyboard","best hot swap mechanical keyboard","hot swap vs soldered"],"audience":"beginners who want flexibility to try different switches","angle":"explain PCB socket types (5-pin vs 3-pin), which boards have the best hot-swap implementation, and what can go wrong"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'TKL vs full-size vs 65% keyboard: which layout should you buy?',
   '{"content_type":"guide","target_keywords":["TKL vs full size keyboard","65 percent keyboard","keyboard layout comparison"],"audience":"buyers overwhelmed by keyboard size options","angle":"map layout choice to desk space, whether they use numpad/function row, and how much they game vs type — give concrete recommendations"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'Keychron Q1 vs Q2 vs Q3: which Keychron gasket-mount keyboard is right for you?',
   '{"content_type":"comparison","target_keywords":["Keychron Q1 review","Keychron Q2 vs Q3","best Keychron keyboard"],"audience":"buyers looking at the Keychron Q series as their first premium keyboard","angle":"the Q series is genuinely good — explain the gasket mount feel, layout differences, and when to spend more vs less within the line"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'Mechanical keyboard sound modding: foam, tape mod, and tempest mod explained',
   '{"content_type":"how-to","target_keywords":["keyboard sound mod","tape mod keyboard","how to make keyboard sound better"],"audience":"keyboard owners who want a thockier or quieter sound profile without buying a new board","angle":"rank mods by impact vs effort — tape mod is 5 minutes and transforms the sound; explain each mod with before/after sound description"}',
   'pending', NOW()),
  ('[KEYBOARD_ID]', 'article', 'Best wireless mechanical keyboards: Bluetooth latency, battery life, and trade-offs',
   '{"content_type":"listicle","target_keywords":["best wireless mechanical keyboard","bluetooth mechanical keyboard","wireless keyboard latency"],"audience":"buyers who want the clean desk aesthetic without sacrificing typing feel","angle":"address the latency concern directly with real numbers, then rank by battery life and build quality"}',
   'pending', NOW());


-- ============================================================
-- SITE 3: beardeddragonhq.com
-- Niche score: 17/20 — high-intent new owner traffic, strong pet affiliate ecosystem
-- ============================================================

INSERT INTO sites (name, slug, domain, description, theme_config, author_persona)
VALUES (
  'Bearded Dragon HQ',
  'bearded-dragon-hq',
  'beardeddragonhq.com',
  'Complete care guides, enclosure setups, and health advice for bearded dragon owners',
  '{
    "primaryColor": "#b45309",
    "accentColor": "#f59e0b",
    "fontFamily": "Inter",
    "navItems": [{"href":"/","label":"Articles"},{"href":"/compare","label":"Comparisons"}]
  }'::jsonb,
  'Sam Rivera, a reptile keeper and vet tech with 11 years of experience who has kept and bred bearded dragons since 2014 and currently cares for a colony of 9'
);

-- SELECT id FROM sites WHERE slug = 'bearded-dragon-hq';
-- Replace [BEARDIE_ID] below

INSERT INTO content_queue (site_id, content_type, topic, prompt_params, status, scheduled_for)
VALUES
  ('[BEARDIE_ID]', 'article', 'Bearded dragon setup guide for beginners: everything you need before bringing one home',
   '{"content_type":"guide","target_keywords":["bearded dragon setup","bearded dragon beginner guide","bearded dragon care guide"],"audience":"new owners who just got or are about to get their first bearded dragon","angle":"cover enclosure, UVB lighting, basking temps, substrate, and feeding schedule in one comprehensive guide — the resource they will bookmark"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'Best UVB lights for bearded dragons: why this is the most important purchase you will make',
   '{"content_type":"listicle","target_keywords":["best UVB light bearded dragon","bearded dragon UVB requirements","T5 vs T8 bearded dragon"],"audience":"new owners choosing UVB lighting","angle":"be direct that cheap coil UVB bulbs cause MBD — explain T5 HO requirement, Ferguson zones, and give specific product recommendations with wattage and distance specs"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'Bearded dragon enclosure size: why 40 gallons is too small (and what to get instead)',
   '{"content_type":"guide","target_keywords":["bearded dragon enclosure size","bearded dragon tank size","best bearded dragon enclosure"],"audience":"new owners shopping for their first enclosure","angle":"challenge the 40-gallon myth directly — explain why adult beardies need 120 gallons minimum and what happens to their behavior in cramped spaces"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'What do bearded dragons eat? Complete feeding guide by age and size',
   '{"content_type":"guide","target_keywords":["what do bearded dragons eat","bearded dragon diet","bearded dragon feeding guide"],"audience":"new owners figuring out the diet","angle":"break it down by life stage — juveniles need 70% insects, adults 70% greens; include specific veggie list, safe vs toxic plants, and supplementation schedule"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'Bearded dragon not eating: 11 reasons and what to do about each',
   '{"content_type":"article","target_keywords":["bearded dragon not eating","bearded dragon stopped eating","why wont my bearded dragon eat"],"audience":"worried owners whose bearded dragon has gone off food","angle":"cover every real cause — brumation, shedding, illness, stress, seasonal changes — and help them diagnose which one they are dealing with"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'Bearded dragon shedding: what is normal, what is not, and how to help',
   '{"content_type":"how-to","target_keywords":["bearded dragon shedding","bearded dragon stuck shed","how to help bearded dragon shed"],"audience":"owners seeing their beardie shed for the first time","angle":"normalize the process, explain dysecdysis warning signs, and give the humidity soak method step by step"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'Bioactive bearded dragon enclosure: is it worth the effort for a beginner?',
   '{"content_type":"article","target_keywords":["bioactive bearded dragon enclosure","bioactive vs traditional setup bearded dragon"],"audience":"intermediate owners considering upgrading to bioactive","angle":"honest cost-benefit — bioactive is better for the animal long term but requires significant upfront work; explain the CUC, substrate depth, and plant selection needed"}',
   'pending', NOW()),
  ('[BEARDIE_ID]', 'article', 'Bearded dragon brumation: what it is, when to worry, and how to manage it',
   '{"content_type":"guide","target_keywords":["bearded dragon brumation","bearded dragon sleeping a lot","is my bearded dragon in brumation"],"audience":"owners panicking because their beardie suddenly became lethargic","angle":"distinguish brumation from illness clearly, explain the seasonal trigger, and give a week-by-week management guide for their first brumation"}',
   'pending', NOW());


-- ============================================================
-- SITE 4: standingdeskcompare.com
-- Niche score: 16/20 — high AOV, strong affiliate programs, matches existing naming pattern
-- ============================================================

INSERT INTO sites (name, slug, domain, description, theme_config, author_persona)
VALUES (
  'Standing Desk Compare',
  'standing-desk-compare',
  'standingdeskcompare.com',
  'Unbiased standing desk comparisons, ergonomic chair reviews, and home office setup guides',
  '{
    "primaryColor": "#0f766e",
    "accentColor": "#14b8a6",
    "fontFamily": "Inter",
    "navItems": [{"href":"/","label":"Articles"},{"href":"/compare","label":"Comparisons"}]
  }'::jsonb,
  'Jordan Ellis, an ergonomics consultant and remote work advocate who has personally tested over 25 standing desks and helped 200+ clients build pain-free home office setups'
);

-- SELECT id FROM sites WHERE slug = 'standing-desk-compare';
-- Replace [DESK_ID] below

INSERT INTO content_queue (site_id, content_type, topic, prompt_params, status, scheduled_for)
VALUES
  ('[DESK_ID]', 'article', 'Best standing desks under $500: ranked by stability, motor noise, and warranty',
   '{"content_type":"listicle","target_keywords":["best standing desk under 500","affordable standing desk","standing desk comparison"],"audience":"remote workers buying their first standing desk on a budget","angle":"rank by wobble at standing height (the number one complaint), not marketing specs — give actual measurements where possible"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'Flexispot vs Uplift vs Autonomous: which standing desk brand should you trust?',
   '{"content_type":"comparison","target_keywords":["Flexispot vs Uplift","best standing desk brand","Autonomous standing desk review"],"audience":"buyers who have narrowed it down to these three popular brands","angle":"compare warranty service reality (not just stated terms), frame stability at max height, and motor longevity based on user reports"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'Single motor vs dual motor standing desks: does it actually matter?',
   '{"content_type":"guide","target_keywords":["single motor vs dual motor standing desk","standing desk motor comparison"],"audience":"buyers confused by motor specs during shopping","angle":"be direct — dual motor is better for heavy setups and taller heights, but single motor is fine for most people under 6 feet with a standard monitor setup; give weight thresholds"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'How long should you stand at a standing desk? The research-backed answer',
   '{"content_type":"article","target_keywords":["how long to stand at standing desk","standing desk health benefits","sit stand ratio"],"audience":"new standing desk owners who are not sure how to use it","angle":"cite actual ergonomics research — 20-8-2 rule, why standing all day is also bad, and how to build up gradually"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'Standing desk mat comparison: anti-fatigue mats ranked by cushioning and durability',
   '{"content_type":"listicle","target_keywords":["best standing desk mat","anti-fatigue mat comparison","standing desk anti fatigue mat"],"audience":"standing desk owners whose feet hurt after 30 minutes","angle":"test for real cushioning vs marketing fluff — the Topo and Ergodriven are the only mats worth the premium; explain why"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'Standing desk cable management: clean setups from basic to fully hidden',
   '{"content_type":"how-to","target_keywords":["standing desk cable management","cable management standing desk","how to hide cables standing desk"],"audience":"standing desk owners whose setup looks messy","angle":"tiered approach — $10 solution vs $50 solution vs full raceway system; include what to buy and exactly how to route it"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'L-shaped standing desks: the best options and who actually needs one',
   '{"content_type":"guide","target_keywords":["L shaped standing desk","corner standing desk","best L shaped standing desk"],"audience":"buyers with a corner desk setup who want to go standing","angle":"honest take — most L-desks have a weaker frame than straight desks at the same price; explain which brands get the corner right and when a straight desk plus monitor arm is the better call"}',
   'pending', NOW()),
  ('[DESK_ID]', 'article', 'Monitor arm for standing desks: why it is almost mandatory and how to choose',
   '{"content_type":"guide","target_keywords":["best monitor arm for standing desk","standing desk monitor arm","monitor arm vs monitor stand"],"audience":"standing desk owners setting up their display","angle":"make the case that a monitor arm pays for itself in neck pain reduction — then rank by VESA compatibility, weight capacity, and ease of height adjustment"}',
   'pending', NOW());
