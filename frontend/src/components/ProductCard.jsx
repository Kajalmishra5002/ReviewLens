import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";
import { Scale } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const discountAmount = product.originalPrice ? product.originalPrice - product.price : 0;
  const { compareIds, toggleCompare } = useCompare();
  const isComparing = compareIds.includes(product.id);
  
  return (
    <div className="block h-full group relative">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50 bg-card border-border relative z-0">
        <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
        <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-background p-6 flex items-center justify-center">
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isBestValue && (
              <Badge className="bg-primary text-primary-foreground font-bold border-none shadow-sm uppercase tracking-wider text-[10px] py-1 px-2 w-max">
                AI Pick
              </Badge>
            )}
            {product.isTrending && !product.isBestValue && (
              <Badge className="bg-orange-500 text-white font-bold border-none shadow-sm uppercase tracking-wider text-[10px] py-1 px-2 w-max">
                Trending
              </Badge>
            )}
          </div>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal" 
          />
        </Link>
        <CardContent className="p-5 flex-1 flex flex-col gap-2 bg-card relative z-10 border-t border-border">
          <Link href={`/products/${product.id}`} className="block">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              {product.brand} &middot; {product.category}
            </div>
            <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="mt-auto pt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm font-medium text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.isDiscounted && product.discountPercent && (
              <div className="mt-1 text-xs font-bold text-emerald-500 flex items-center gap-1">
                Save {product.discountPercent}% (${discountAmount.toFixed(2)})
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 bg-card relative z-10 flex-col gap-4">
          <div className="w-full flex items-center justify-between">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          <Button 
            variant={isComparing ? "default" : "outline"} 
            className={`w-full font-bold uppercase tracking-wider text-xs ${isComparing ? 'bg-brand-gradient text-white border-0 hover:opacity-90' : 'hover:bg-primary/5 hover:text-primary'}`}
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product.id);
            }}
          >
            <Scale className="w-4 h-4 mr-2" />
            {isComparing ? "Added to Compare" : "Compare"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
