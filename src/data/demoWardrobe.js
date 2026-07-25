/**
 * Curated demo wardrobe seeded into a new user's closet on first access, so
 * they can try the product (see a populated wardrobe, run a try-on) in seconds
 * instead of having to build a wardrobe from scratch — killing the cold start.
 *
 * Images are hosted on images.unsplash.com, which serves CORS headers so the
 * try-on flow can fetch + convert them. These are placeholder demo assets and
 * can be swapped for owned/brand imagery later.
 */
const img = (id) => `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;

export const DEMO_WARDROBE = [
    {
        id: 'demo-white-tshirt',
        name: 'Camiseta Branca Básica',
        category: 'tops',
        description: 'Camiseta branca de algodão, corte reto.',
        colors: ['Branco'],
        styles: ['Casual'],
        brand: '',
        image: img('photo-1521572163474-6864f9cf17ab'),
        demo: true,
    },
    {
        id: 'demo-denim-jacket',
        name: 'Jaqueta Jeans',
        category: 'outerwear',
        description: 'Jaqueta jeans azul clássica.',
        colors: ['Azul'],
        styles: ['Casual'],
        brand: '',
        image: img('photo-1576871337622-98d48d1cf531'),
        demo: true,
    },
    {
        id: 'demo-black-jeans',
        name: 'Calça Jeans Preta',
        category: 'bottoms',
        description: 'Calça jeans preta slim.',
        colors: ['Preto'],
        styles: ['Casual'],
        brand: '',
        image: img('photo-1541099649105-f69ad21f3246'),
        demo: true,
    },
    {
        id: 'demo-white-sneakers',
        name: 'Tênis Branco',
        category: 'shoes',
        description: 'Tênis branco minimalista.',
        colors: ['Branco'],
        styles: ['Casual'],
        brand: '',
        image: img('photo-1595950653106-6c9ebd614d3a'),
        demo: true,
    },
    {
        id: 'demo-blue-shirt',
        name: 'Camisa Social Azul',
        category: 'tops',
        description: 'Camisa social azul de manga longa.',
        colors: ['Azul'],
        styles: ['Formal'],
        brand: '',
        image: img('photo-1602810318383-e386cc2a3ccf'),
        demo: true,
    },
    {
        id: 'demo-beige-chinos',
        name: 'Calça Chino Bege',
        category: 'bottoms',
        description: 'Calça chino bege de algodão.',
        colors: ['Bege'],
        styles: ['Casual'],
        brand: '',
        image: img('photo-1473966968600-fa801b869a1a'),
        demo: true,
    },
];
