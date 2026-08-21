import { Section } from "@/components/common/section";
import { CategoryCard } from "@/components/product/category-card";
import { categories, countProductsInCategory } from "@/data/mock/categories";

export function CategoryShowcase() {
  return (
    <Section
      title="Shop by category"
      description="Four aisles, everything you need for the evening."
      action={{ label: "See all products", href: "/products" }}
    >
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard
              category={category}
              productCount={countProductsInCategory(category.slug)}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
