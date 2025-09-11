import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Baby, Home, Book, User, Venus, Mars, Handbag } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const categoryConfig: Record<
  string,
  { icon: any; color: string }
> = {
  kids: {
    icon: Baby,
    color: "from-blue-500 to-purple-600",
  },
  mens: {
    icon: Mars,
    color: "from-green-500 to-teal-600",
  },
  womens: {
    icon: Venus,
    color: "from-red-500 to-pink-600",
  },
  unisex: {
    icon: User,
    color: "from-orange-500 to-yellow-600",
  },
  "home & garden": {
    icon: Home,
    color: "from-emerald-500 to-cyan-600",
  },
  books: {
    icon: Book,
    color: "from-violet-500 to-purple-600",
  },
};

const gradients = [
  "from-pink-500 to-purple-600",
  "from-green-400 to-teal-500",
  "from-yellow-400 to-orange-500",
  "from-blue-500 to-indigo-600",
  "from-red-500 to-pink-400",
  "from-cyan-400 to-blue-500",
];

async function fetchCategories() {
  const API_URL = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API_URL}/categories`);
  return res.json();
}

export function CategoryGrid() {
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <section className="py-16 text-center">
        <p className="text-muted-foreground">Loading categories...</p>
      </section>
    );
  }
  if (isError || !categories || categories.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="text-muted-foreground">No categories available.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-muted/20 to-background" id="category-grid">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-foreground">Shop by</span>{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections across different categories to find
            exactly what you're looking for.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any, index: number) => {
            const key = category.title.toLowerCase();
            const config = categoryConfig[key] || { icon: Handbag };
            const Icon = config.icon || Handbag;

            const gradient = gradients[index % gradients.length];

            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/categories/${category._id}`}>
                  <Card className="group h-full overflow-hidden bg-gradient-card shadow-card hover:shadow-card-hover border-border/50 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <div
                          className={`h-32 bg-gradient-to-br ${gradient} relative`}
                        >
                          <div className="absolute inset-0 bg-black/10" />

                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 180, 360],
                            }}
                            transition={{
                              duration: 20,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"
                          />

                          {/* Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                            >
                              <Icon className="h-8 w-8 text-white" />
                            </motion.div>
                          </div>

                          {/* Arrow Icon */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="h-5 w-5 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-2">
                          <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
