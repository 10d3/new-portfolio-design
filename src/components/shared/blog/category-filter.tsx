'use client';

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      router.push('/blog');
    } else {
      router.push(`/blog?category=${encodeURIComponent(category)}`);
    }
  };

  // Get unique categories
  const uniqueCategories = ['all', ...Array.from(new Set(categories))];

  return (
    <div className="flex flex-row flex-wrap gap-3 mt-6">
      {uniqueCategories.map((category) => (
        <Button
          key={category}
          variant={currentCategory === category ? "default" : "outline"}
          onClick={() => handleCategoryChange(category)}
          className="capitalize cursor-pointer"
        >
          {category === 'all' ? 'Toutes les catégories' : category}
        </Button>
      ))}
    </div>
  );
}
