# John Styles — app ↔ n8n contract (generated from code)

Generated from `src/utils/garmentTaxonomy.js`. Do not hand-edit.

## 1. Styling register field

`userProfile.stylePreference` — one of these exact strings:

- `menswear`
- `womenswear`
- `both`

When absent or unrecognised, treat as `both` (neutral). **Never** assume menswear.
These are machine keys. The app translates them for display; the stored value never changes with locale.

## 2. Garment types the app can store

48 types. The agent must use these exact keys — anything else cannot be saved.

### tops

| type | register | occupies slots |
|---|---|---|
| `tshirt` | all | tops |
| `polo` | all | tops |
| `shirt` | all | tops |
| `tank_top` | all | tops |
| `blouse` | womenswear | tops |
| `bodysuit` | womenswear | tops |
| `other_top` | all | tops |

### bottoms

| type | register | occupies slots |
|---|---|---|
| `jeans` | all | bottoms |
| `chinos` | all | bottoms |
| `trousers` | all | bottoms |
| `casual_pants` | all | bottoms |
| `cargo_pants` | all | bottoms |
| `joggers` | all | bottoms |
| `shorts` | all | bottoms |
| `skirt` | womenswear | bottoms |
| `leggings` | womenswear | bottoms |
| `other_bottom` | all | bottoms |

### shoes

| type | register | occupies slots |
|---|---|---|
| `sneakers` | all | shoes |
| `dress_shoes` | all | shoes |
| `loafers` | all | shoes |
| `boots` | all | shoes |
| `sandals` | all | shoes |
| `heels` | womenswear | shoes |
| `flats` | womenswear | shoes |
| `other_shoes` | all | shoes |

### outerwear

| type | register | occupies slots |
|---|---|---|
| `blazer` | all | outerwear |
| `jacket` | all | outerwear |
| `coat` | all | outerwear |
| `sweater` | all | outerwear |
| `hoodie` | all | outerwear |
| `sweatshirt` | all | outerwear |
| `vest` | all | outerwear |
| `other_outerwear` | all | outerwear |

### sets

| type | register | occupies slots |
|---|---|---|
| `suit` | all | bottoms + outerwear |
| `tuxedo` | menswear | bottoms + outerwear |
| `matching_set` | all | tops + bottoms |
| `dress` | womenswear | tops + bottoms |
| `jumpsuit` | womenswear | tops + bottoms |
| `other_set` | all | tops + bottoms |

### accessories

| type | register | occupies slots |
|---|---|---|
| `belt` | all | accessories |
| `tie` | menswear | accessories |
| `watch` | all | accessories |
| `bag` | all | accessories |
| `headwear` | all | accessories |
| `eyewear` | all | accessories |
| `scarf` | all | accessories |
| `jewelry` | all | accessories |
| `other_accessory` | all | accessories |

## 3. Valid outfit shapes

A garment blocks the slots it occupies, so exactly one of these:

| # | Shape | Rule |
|---|---|---|
| A | top + bottom + shoes (+ outerwear) | separates |
| B | dress / jumpsuit / matching_set + shoes (+ outerwear) | one-piece fills top AND bottom — never add a separate top |
| C | suit / tuxedo + top + shoes | fills bottom AND outerwear — never add outerwear, even when cold |

## 4. Recognised phrasing (aliases)

The app maps these PT/EN/ES phrases onto the keys above, so the agent may use natural language:

- `tshirt`: "t-shirt", "t shirt", "tee", "camiseta", "playera"
- `polo`: "polo shirt", "camisa polo", "polo"
- `shirt`: "dress shirt", "button-up shirt", "button down shirt", "camisa social", "camisa", "oxford shirt", "flannel shirt"
- `tank_top`: "tank top", "sleeveless shirt", "regata", "camiseta sin mangas"
- `blouse`: "blouse", "silk blouse", "blusa", "camisa feminina", "blusa de seda"
- `bodysuit`: "bodysuit", "body suit", "body"
- `jeans`: "denim pants", "calca jeans", "jeans", "vaqueros"
- `chinos`: "chino pants", "calca chino", "calca de sarja", "chinos"
- `trousers`: "dress pants", "tailored trousers", "suit trousers", "calca social", "calca de alfaiataria", "pantalon de vestir", "trousers"
- `casual_pants`: "casual pants", "calca casual", "pantalon casual", "pants", "calca", "pantalon"
- `cargo_pants`: "cargo pants", "calca cargo", "pantalon cargo", "cargos"
- `joggers`: "sweatpants", "track pants", "calca jogger", "calca de moletom", "joggers"
- `shorts`: "bermuda", "shorts", "short"
- `skirt`: "pencil skirt", "midi skirt", "maxi skirt", "saia lapis", "saia midi", "saia", "falda", "skirt"
- `leggings`: "yoga pants", "calca legging", "legging", "leggings", "mallas"
- `sneakers`: "athletic shoes", "running shoes", "tenis", "sneakers", "trainer", "zapatillas"
- `dress_shoes`: "dress shoes", "social shoes", "sapato social", "zapato de vestir", "oxford shoes", "derby shoes", "monk strap"
- `loafers`: "loafer", "loafers", "mocassim", "mocasin", "driver shoes"
- `boots`: "chelsea boots", "combat boots", "coturno", "bota", "botas", "boots"
- `sandals`: "flip flops", "flip-flops", "slides", "chinelo", "sandalia", "sandals"
- `heels`: "high heels", "stiletto", "salto alto", "scarpin", "tacones", "heels", "heel"
- `flats`: "ballet flats", "sapatilha", "bailarina", "flats"
- `blazer`: "sport coat", "suit jacket", "paleto", "blazer"
- `jacket`: "denim jacket", "leather jacket", "bomber jacket", "windbreaker", "jaqueta", "chaqueta", "jacket"
- `coat`: "trench coat", "overcoat", "parka", "sobretudo", "casaco", "abrigo", "coat"
- `sweater`: "turtleneck", "cardigan", "sueter", "tricô", "tricot", "jersey", "sweater"
- `hoodie`: "hooded sweatshirt", "moletom com capuz", "sudadera con capucha", "hoodie"
- `sweatshirt`: "crewneck sweatshirt", "moletom sem capuz", "moletom", "sudadera", "sweatshirt"
- `vest`: "puffer vest", "colete", "chaleco", "vest"
- `suit`: "business suit", "two piece suit", "three piece suit", "terno", "traje"
- `tuxedo`: "dinner suit", "black tie suit", "smoking", "esmoquin"
- `matching_set`: "co ord set", "co-ord set", "coordinated set", "matching set", "conjunto coordenado", "conjunto combinado"
- `dress`: "shirt dress", "midi dress", "maxi dress", "cocktail dress", "vestido longo", "vestido", "dress"
- `jumpsuit`: "jumpsuit", "romper", "macaquinho", "macacao", "enterizo"
- `other_set`: "clothing set", "outfit set", "conjunto", "set de ropa"
- `belt`: "cinto", "cinturon", "belt"
- `tie`: "bow tie", "gravata borboleta", "corbata de moño", "gravata", "corbata", "tie"
- `watch`: "relogio", "reloj", "watch"
- `bag`: "briefcase", "backpack", "messenger bag", "mochila", "pasta", "bolsa", "bolso", "bag"
- `headwear`: "baseball cap", "beanie", "chapeu", "bone", "sombrero", "gorra", "gorro", "hat", "cap"
- `eyewear`: "sunglasses", "eyeglasses", "oculos", "gafas", "glasses"
- `scarf`: "cachecol", "lenco", "bufanda", "panuelo", "scarf"
- `jewelry`: "cufflinks", "bracelet", "necklace", "ring", "earrings", "brinco", "brincos", "aretes", "abotoadura", "pulseira", "colar", "anel", "joya", "joia", "jewelry"

## 5. Payload the app sends per chat message

```json
{
  "userId": "<firebase uid>",
  "message": "<user text>",
  "userProfile": { "stylePreference": "...", "styleArchetypes": [], "favoriteColors": [], "occasions": [], "bodyType": "", "dislikes": [], "favoriteBrands": [], "styleGoals": "" },
  "wardrobeItems": [ { "id": "", "name": "", "type": "", "category": "", "colors": [], "styles": [] } ],
  "chatHistory": []
}
```

Note: `wardrobeItems` has image URLs stripped to keep the payload small.

## 6. Response the app understands

```json
{ "content": "<reply text, markdown ok>", "actions": [ { "type": "tryOn" }, { "type": "open" } ] }
```

`content` is required. `actions` is optional; only `tryOn` and `open` are rendered.

