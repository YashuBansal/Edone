import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';

// Import product images
import headphonesImg from '@/assets/headphones.jpg';
import smartwatchImg from '@/assets/smartwatch.jpg';
import laptopImg from '@/assets/laptop.jpg';
import smartphoneImg from '@/assets/smartphone.jpg';

const featuredProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: headphonesImg,
    rating: 4.8,
    reviews: 156,
    inStock: true,
    isNew: true,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 249.99,
    originalPrice: 299.99,
    image: smartwatchImg,
    rating: 4.6,
    reviews: 89,
    inStock: true,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Ultra-Thin Laptop',
    price: 1299.99,
    originalPrice: 1499.99,
    image: laptopImg,
    rating: 4.9,
    reviews: 234,
    inStock: true,
    isFeatured: true
  },
  {
    id: '4',
    name: 'Latest Smartphone',
    price: 899.99,
    image: smartphoneImg,
    rating: 4.7,
    reviews: 312,
    inStock: true,
    isNew: true,
    isFeatured: true
  }
];

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Featured
            </span>{' '}
            <span className="text-foreground">Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium products with unbeatable quality and amazing deals.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product, index) => (
            <Link to="/product/:id">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/product/">
              <Button
                size="lg"
                variant="outline"
                className="rounded-3xl px-8 py-6 text-lg font-semibold border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
              >
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}