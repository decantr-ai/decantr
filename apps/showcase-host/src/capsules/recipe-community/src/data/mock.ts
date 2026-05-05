export type Recipe = {
  id: string;
  title: string;
  image: string;
  description: string;
  cuisine: string;
  course: string;
  time: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  authorId: string;
  saves: number;
  rating: number;
  ingredients: { qty: string; name: string }[];
  steps: { title: string; body: string; duration?: number }[];
  publishedAt: string;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  recipesCount: number;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  cover: string;
  recipeCount: number;
  curator: string;
};

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  body: string;
  createdAt: string;
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=80`;

const avatar = (n: number) =>
  `https://i.pravatar.cc/120?img=${n}`;

export const creators: Creator[] = [
  { id: 'me', name: 'Sage Laurent', handle: '@sage', avatar: avatar(12), bio: 'Home cook, cookbook author, sourdough obsessed.', followers: 4218, recipesCount: 47 },
  { id: 'nora', name: 'Nora Hibiki', handle: '@nora.cooks', avatar: avatar(25), bio: 'Japanese pantry essentials and weeknight dinners.', followers: 12300, recipesCount: 89 },
  { id: 'marco', name: 'Marco De Luca', handle: '@marco', avatar: avatar(33), bio: 'Nonna approved. Pasta and regional Italian.', followers: 8840, recipesCount: 61 },
  { id: 'zain', name: 'Zain Ahmadi', handle: '@zainspice', avatar: avatar(47), bio: 'Spice routes and slow braises.', followers: 5602, recipesCount: 38 },
  { id: 'ines', name: 'Inés Vega', handle: '@ines', avatar: avatar(5), bio: 'Market-first cooking. Lots of lemons.', followers: 9120, recipesCount: 72 },
];

export const recipes: Recipe[] = [
  {
    id: 'miso-butter-pasta',
    title: 'Miso Butter Pasta with Charred Scallions',
    image: img('1608219992759-32df98d1d291'),
    description: 'Umami-rich pasta that comes together in 20 minutes. The miso melts into the butter and clings to every strand.',
    cuisine: 'Fusion',
    course: 'Main',
    time: 20,
    servings: 2,
    difficulty: 'Easy',
    tags: ['quick', 'vegetarian', 'weeknight'],
    authorId: 'nora',
    saves: 1240,
    rating: 4.8,
    ingredients: [
      { qty: '200 g', name: 'spaghetti or linguine' },
      { qty: '3 tbsp', name: 'unsalted butter' },
      { qty: '1 tbsp', name: 'white miso paste' },
      { qty: '4', name: 'scallions, halved' },
      { qty: '2 cloves', name: 'garlic, minced' },
      { qty: '1 tsp', name: 'toasted sesame oil' },
      { qty: 'to taste', name: 'black pepper' },
      { qty: '1/4 cup', name: 'pasta water, reserved' },
    ],
    steps: [
      { title: 'Boil the pasta', body: 'Bring a large pot of salted water to boil. Cook pasta until al dente. Reserve 1/4 cup pasta water, drain.', duration: 10 },
      { title: 'Char scallions', body: 'Heat a dry skillet over high heat. Add scallions, let blister 2 minutes per side until charred.', duration: 4 },
      { title: 'Build the sauce', body: 'Lower heat, add butter and garlic. When foamy, whisk in miso paste until smooth.', duration: 3 },
      { title: 'Toss and finish', body: 'Add pasta and reserved water, toss to coat. Drizzle sesame oil, top with scallions and pepper.', duration: 3 },
    ],
    publishedAt: '2026-03-28',
  },
  {
    id: 'smoky-harissa-chickpeas',
    title: 'Smoky Harissa Chickpeas on Yogurt',
    image: img('1505253758473-96b7015fcd40'),
    description: 'Crispy chickpeas smothered in harissa butter, served over cold garlicky yogurt. Tear bread and dive in.',
    cuisine: 'North African',
    course: 'Dinner',
    time: 25,
    servings: 4,
    difficulty: 'Easy',
    tags: ['vegetarian', 'spicy', 'pantry'],
    authorId: 'zain',
    saves: 864,
    rating: 4.7,
    ingredients: [
      { qty: '2 cans', name: 'chickpeas, drained' },
      { qty: '2 tbsp', name: 'harissa paste' },
      { qty: '3 tbsp', name: 'olive oil' },
      { qty: '1 cup', name: 'thick yogurt' },
      { qty: '1 clove', name: 'garlic, grated' },
      { qty: '1', name: 'lemon, juiced' },
      { qty: 'handful', name: 'cilantro' },
    ],
    steps: [
      { title: 'Dry the chickpeas', body: 'Pat chickpeas very dry on a towel — this is the secret to crispness.', duration: 3 },
      { title: 'Crisp them up', body: 'Fry in olive oil over medium-high until deeply golden, shaking the pan, 10 minutes.', duration: 10 },
      { title: 'Harissa toss', body: 'Reduce heat, add harissa, toss 1 minute until fragrant.', duration: 2 },
      { title: 'Yogurt base', body: 'Whisk yogurt with garlic, lemon, and salt. Spread on a plate.', duration: 2 },
      { title: 'Serve', body: 'Pile chickpeas on yogurt, drizzle pan oil, shower with cilantro.', duration: 2 },
    ],
    publishedAt: '2026-03-20',
  },
  {
    id: 'lemon-ricotta-gnocchi',
    title: 'Pillowy Lemon Ricotta Gnocchi',
    image: img('1551183053-bf91a1d81141'),
    description: 'A lighter, brighter gnocchi — no potatoes, just ricotta and a whisper of lemon zest.',
    cuisine: 'Italian',
    course: 'Main',
    time: 45,
    servings: 4,
    difficulty: 'Medium',
    tags: ['vegetarian', 'pasta', 'weekend'],
    authorId: 'marco',
    saves: 2105,
    rating: 4.9,
    ingredients: [
      { qty: '2 cups', name: 'whole milk ricotta, drained' },
      { qty: '1', name: 'egg' },
      { qty: '3/4 cup', name: '00 flour, plus more' },
      { qty: '1/2 cup', name: 'parmigiano, grated' },
      { qty: '1', name: 'lemon, zested' },
      { qty: 'pinch', name: 'nutmeg' },
      { qty: '4 tbsp', name: 'butter' },
      { qty: '10', name: 'sage leaves' },
    ],
    steps: [
      { title: 'Mix the dough', body: 'Combine ricotta, egg, parmigiano, lemon zest, nutmeg, salt. Fold in flour until just together.', duration: 6 },
      { title: 'Shape', body: 'Roll into 1/2-inch ropes on floured surface. Cut into pillows.', duration: 15 },
      { title: 'Boil gently', body: 'Simmer (not boil) in salted water until they float, ~2 minutes.', duration: 5 },
      { title: 'Brown butter', body: 'Melt butter with sage over medium until nutty and fragrant.', duration: 4 },
      { title: 'Toss and serve', body: 'Gently toss gnocchi in the butter. Shower with extra parm.', duration: 2 },
    ],
    publishedAt: '2026-03-15',
  },
  {
    id: 'cast-iron-focaccia',
    title: 'No-Knead Cast Iron Focaccia',
    image: img('1509440159596-0249088772ff'),
    description: 'Dimpled, olive-oil drenched focaccia with rosemary and flaky salt. Weekend ritual material.',
    cuisine: 'Italian',
    course: 'Bread',
    time: 1440,
    servings: 8,
    difficulty: 'Easy',
    tags: ['bread', 'weekend', 'beginner'],
    authorId: 'marco',
    saves: 3140,
    rating: 4.9,
    ingredients: [
      { qty: '500 g', name: 'bread flour' },
      { qty: '400 ml', name: 'warm water' },
      { qty: '1 tsp', name: 'instant yeast' },
      { qty: '10 g', name: 'salt' },
      { qty: '1/3 cup', name: 'olive oil, divided' },
      { qty: '2 sprigs', name: 'rosemary' },
      { qty: 'flaky', name: 'sea salt' },
    ],
    steps: [
      { title: 'Mix', body: 'Whisk flour, yeast, salt. Add water. Stir with a spatula — it will be shaggy. Cover.', duration: 5 },
      { title: 'Cold ferment', body: 'Refrigerate 18–24 hours. This is the flavor.', duration: 1080 },
      { title: 'Oil the pan', body: 'Pour 2 tbsp oil into a 12-inch cast iron. Tip dough in, coat with oil.', duration: 3 },
      { title: 'Room rise', body: 'Let rise 2 hours until puffy and bubbly.', duration: 120 },
      { title: 'Dimple and bake', body: 'Dimple with oiled fingers. Top with rosemary and flaky salt. Bake 450°F / 230°C for 25 min.', duration: 25 },
    ],
    publishedAt: '2026-03-10',
  },
  {
    id: 'green-shakshuka',
    title: 'Spring Green Shakshuka',
    image: img('1590301157890-4810ed352733'),
    description: 'Leeks, spinach, zucchini, and chard in a herby green sauce with eggs poached right in the skillet.',
    cuisine: 'Middle Eastern',
    course: 'Brunch',
    time: 30,
    servings: 2,
    difficulty: 'Easy',
    tags: ['eggs', 'brunch', 'vegetarian'],
    authorId: 'ines',
    saves: 712,
    rating: 4.6,
    ingredients: [
      { qty: '1', name: 'leek, sliced' },
      { qty: '1', name: 'zucchini, diced' },
      { qty: '2 cups', name: 'spinach' },
      { qty: '1 bunch', name: 'chard, chopped' },
      { qty: '2 cloves', name: 'garlic' },
      { qty: '1 tsp', name: 'cumin' },
      { qty: '4', name: 'eggs' },
      { qty: '1/2 cup', name: 'feta' },
    ],
    steps: [
      { title: 'Sweat the greens', body: 'Sauté leek and garlic in olive oil 4 minutes. Add zucchini, cumin.', duration: 6 },
      { title: 'Wilt', body: 'Add chard and spinach with a splash of water, cook until wilted.', duration: 4 },
      { title: 'Nest eggs', body: 'Make 4 wells, crack an egg into each. Cover, cook until whites set, 6 minutes.', duration: 6 },
      { title: 'Finish', body: 'Top with feta, drizzle of olive oil. Serve from the pan.', duration: 1 },
    ],
    publishedAt: '2026-03-08',
  },
  {
    id: 'braised-short-ribs',
    title: 'Red Wine Braised Short Ribs',
    image: img('1544025162-d76694265947'),
    description: 'Sunday cooking at its finest. Sear, simmer, forget. The house smells like a dream.',
    cuisine: 'French',
    course: 'Main',
    time: 210,
    servings: 6,
    difficulty: 'Medium',
    tags: ['beef', 'braise', 'special'],
    authorId: 'sage',
    saves: 4280,
    rating: 4.9,
    ingredients: [
      { qty: '3 lb', name: 'beef short ribs' },
      { qty: '1', name: 'onion, diced' },
      { qty: '2', name: 'carrots, chopped' },
      { qty: '2 stalks', name: 'celery, chopped' },
      { qty: '1 bottle', name: 'dry red wine' },
      { qty: '2 cups', name: 'beef stock' },
      { qty: '4 sprigs', name: 'thyme' },
      { qty: '2', name: 'bay leaves' },
    ],
    steps: [
      { title: 'Season & sear', body: 'Pat ribs dry, season well. Sear in a dutch oven until deeply browned all over.', duration: 15 },
      { title: 'Soften aromatics', body: 'Remove ribs. Cook onion, carrot, celery until golden, 8 minutes.', duration: 8 },
      { title: 'Deglaze', body: 'Pour in wine, scrape the fond. Reduce by half.', duration: 10 },
      { title: 'Braise', body: 'Return ribs, add stock and herbs. Cover, transfer to 325°F oven. 2.5 hours.', duration: 150 },
      { title: 'Rest & strain', body: 'Rest ribs. Strain sauce, skim fat, reduce if needed.', duration: 15 },
    ],
    publishedAt: '2026-02-28',
  },
  {
    id: 'tomato-galette',
    title: 'Rustic Heirloom Tomato Galette',
    image: img('1568901346375-23c9450c58cd'),
    description: 'Summer on a plate. Ricotta base, ripe tomatoes, olive oil, a flaky free-form crust.',
    cuisine: 'French',
    course: 'Appetizer',
    time: 75,
    servings: 6,
    difficulty: 'Medium',
    tags: ['vegetarian', 'summer', 'pastry'],
    authorId: 'sage',
    saves: 1908,
    rating: 4.8,
    ingredients: [
      { qty: '1', name: 'pie crust, chilled' },
      { qty: '3', name: 'heirloom tomatoes, sliced' },
      { qty: '3/4 cup', name: 'ricotta' },
      { qty: '1/4 cup', name: 'parmigiano' },
      { qty: '1', name: 'egg, beaten' },
      { qty: 'handful', name: 'basil' },
    ],
    steps: [
      { title: 'Drain tomatoes', body: 'Salt tomato slices, drain on paper towels 15 minutes — crucial to avoid soggy crust.', duration: 15 },
      { title: 'Ricotta base', body: 'Mix ricotta and parm with salt and pepper.', duration: 2 },
      { title: 'Assemble', body: 'Roll crust, spread ricotta leaving 2-inch border. Shingle tomatoes on top.', duration: 8 },
      { title: 'Fold and glaze', body: 'Fold edges in, brush with egg wash.', duration: 3 },
      { title: 'Bake', body: 'Bake at 400°F until crust is deeply golden, 40 minutes.', duration: 40 },
    ],
    publishedAt: '2026-02-22',
  },
  {
    id: 'spicy-peanut-noodles',
    title: 'Cold Spicy Peanut Noodles',
    image: img('1552611052-33e04de081de'),
    description: '10-minute lunch. Chewy noodles, creamy peanut, bright lime, crunch of cucumber.',
    cuisine: 'Asian',
    course: 'Lunch',
    time: 10,
    servings: 2,
    difficulty: 'Easy',
    tags: ['quick', 'noodles', 'cold'],
    authorId: 'nora',
    saves: 1650,
    rating: 4.7,
    ingredients: [
      { qty: '200 g', name: 'udon or soba noodles' },
      { qty: '3 tbsp', name: 'peanut butter' },
      { qty: '2 tbsp', name: 'soy sauce' },
      { qty: '1 tbsp', name: 'rice vinegar' },
      { qty: '1 tbsp', name: 'chili crisp' },
      { qty: '1', name: 'lime, juiced' },
      { qty: '1', name: 'cucumber, ribboned' },
      { qty: 'tbsp', name: 'crushed peanuts' },
    ],
    steps: [
      { title: 'Cook noodles', body: 'Cook noodles, rinse under cold water to stop cooking.', duration: 5 },
      { title: 'Whisk sauce', body: 'Whisk peanut butter, soy, vinegar, chili crisp, lime, splash of warm water until silky.', duration: 2 },
      { title: 'Combine', body: 'Toss noodles in sauce. Top with cucumber and peanuts.', duration: 1 },
    ],
    publishedAt: '2026-02-18',
  },
  {
    id: 'olive-oil-cake',
    title: 'Orange Olive Oil Cake',
    image: img('1565958011703-44f9829ba187'),
    description: 'Moist, citrusy, not too sweet. The cake that keeps getting better the next day.',
    cuisine: 'Mediterranean',
    course: 'Dessert',
    time: 70,
    servings: 10,
    difficulty: 'Easy',
    tags: ['dessert', 'citrus', 'make-ahead'],
    authorId: 'ines',
    saves: 2450,
    rating: 4.9,
    ingredients: [
      { qty: '1 cup', name: 'good olive oil' },
      { qty: '1 1/4 cup', name: 'sugar' },
      { qty: '3', name: 'eggs' },
      { qty: '2', name: 'oranges, zested & juiced' },
      { qty: '1 3/4 cup', name: 'flour' },
      { qty: '1 1/2 tsp', name: 'baking powder' },
      { qty: 'pinch', name: 'salt' },
    ],
    steps: [
      { title: 'Prep', body: 'Oil a 9-inch cake pan. Heat oven to 350°F.', duration: 3 },
      { title: 'Whisk wet', body: 'Whisk oil, sugar, eggs, zest, juice until glossy.', duration: 3 },
      { title: 'Fold dry', body: 'Fold in flour, baking powder, salt until just combined.', duration: 2 },
      { title: 'Bake', body: 'Pour in pan. Bake 45–50 minutes, until a skewer comes out clean.', duration: 50 },
      { title: 'Cool', body: 'Cool in pan 15 min, turn out. Dust with powdered sugar.', duration: 15 },
    ],
    publishedAt: '2026-02-10',
  },
  {
    id: 'roasted-carrot-soup',
    title: 'Roasted Carrot & Ginger Soup',
    image: img('1547592180-85f173990554'),
    description: 'Silky, bright, deeply carroty. Roast first — don\'t boil your way there.',
    cuisine: 'Modern',
    course: 'Soup',
    time: 50,
    servings: 4,
    difficulty: 'Easy',
    tags: ['soup', 'vegan', 'healthy'],
    authorId: 'ines',
    saves: 580,
    rating: 4.5,
    ingredients: [
      { qty: '2 lb', name: 'carrots, peeled' },
      { qty: '1', name: 'onion, quartered' },
      { qty: '2 tbsp', name: 'grated ginger' },
      { qty: '4 cups', name: 'vegetable stock' },
      { qty: '3 tbsp', name: 'olive oil' },
      { qty: '1', name: 'lemon, juiced' },
    ],
    steps: [
      { title: 'Roast', body: 'Toss carrots and onion with oil and salt. Roast at 425°F until caramelized, 30 min.', duration: 30 },
      { title: 'Simmer', body: 'Transfer to a pot with stock and ginger. Simmer 10 minutes.', duration: 10 },
      { title: 'Blend', body: 'Blend until silky. Adjust with lemon, salt, and water if thick.', duration: 3 },
    ],
    publishedAt: '2026-02-04',
  },
];

export const collections: Collection[] = [
  { id: 'weeknight', title: 'Weeknight Heroes', description: '30-minute meals that punch above their weight.', cover: recipes[0].image, recipeCount: 14, curator: 'Sage' },
  { id: 'bread', title: 'The Bread Basket', description: 'Focaccia, flatbreads, loaves worth the wait.', cover: recipes[3].image, recipeCount: 8, curator: 'Marco' },
  { id: 'sunday', title: 'Slow Sundays', description: 'Long braises, roasts, pots that perfume the house.', cover: recipes[5].image, recipeCount: 11, curator: 'Sage' },
  { id: 'greens', title: 'Eat More Greens', description: 'Vegetable-forward dishes that crave nothing.', cover: recipes[4].image, recipeCount: 19, curator: 'Inés' },
  { id: 'dessert', title: 'Simple Sweets', description: 'One-bowl cakes, fruit-forward, easy.', cover: recipes[8].image, recipeCount: 9, curator: 'Inés' },
  { id: 'pantry', title: 'Pantry Rescue', description: 'Canned tomatoes, beans, a lemon. Dinner.', cover: recipes[1].image, recipeCount: 16, curator: 'Zain' },
];

export const comments: Comment[] = [
  { id: 'c1', author: 'Marta', avatar: avatar(20), body: 'Made this last night — the miso butter was a revelation. Adding more scallions next time.', createdAt: '2 days ago' },
  { id: 'c2', author: 'Jules', avatar: avatar(30), body: 'Used soba instead of spaghetti and it worked beautifully.', createdAt: '1 week ago' },
  { id: 'c3', author: 'Kai', avatar: avatar(40), body: 'This is going into the weekly rotation. Thank you!', createdAt: '2 weeks ago' },
];

export const reactions = [
  { emoji: '🔥', label: 'fire', count: 412 },
  { emoji: '🤤', label: 'drool', count: 289 },
  { emoji: '👨‍🍳', label: 'chef', count: 156 },
  { emoji: '❤️', label: 'heart', count: 703 },
  { emoji: '🌿', label: 'fresh', count: 88 },
];

export const feedEvents = [
  { id: 'f1', type: 'cooked', user: creators[1], recipeId: 'miso-butter-pasta', time: '2h ago' },
  { id: 'f2', type: 'saved', user: creators[2], recipeId: 'cast-iron-focaccia', time: '4h ago' },
  { id: 'f3', type: 'published', user: creators[3], recipeId: 'smoky-harissa-chickpeas', time: '1d ago' },
  { id: 'f4', type: 'reacted', user: creators[4], recipeId: 'lemon-ricotta-gnocchi', time: '1d ago' },
  { id: 'f5', type: 'cooked', user: creators[0], recipeId: 'braised-short-ribs', time: '2d ago' },
  { id: 'f6', type: 'published', user: creators[4], recipeId: 'olive-oil-cake', time: '3d ago' },
];

export const cuisines = ['All', 'Italian', 'Fusion', 'North African', 'French', 'Middle Eastern', 'Asian', 'Mediterranean', 'Modern'];
export const courses = ['All', 'Main', 'Dinner', 'Brunch', 'Bread', 'Appetizer', 'Lunch', 'Soup', 'Dessert'];
export const difficulties = ['All', 'Easy', 'Medium', 'Hard'] as const;

export function getRecipe(id: string) {
  return recipes.find(r => r.id === id) ?? recipes[0];
}
export function getCreator(id: string) {
  return creators.find(c => c.id === id) ?? creators[0];
}
export function recipesByAuthor(authorId: string) {
  return recipes.filter(r => r.authorId === authorId);
}
