
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductImageCardProps {
  image: string;
  name: string;
}

const ProductImageCard: React.FC<ProductImageCardProps> = ({ image, name }) => {
  if (!image) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagem do Produto</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              <img 
                src={image} 
                alt={name} 
                className="max-h-48 object-contain rounded-md transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black bg-opacity-40 rounded-full p-2">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <img 
                src={image} 
                alt={name} 
                className="object-contain w-full h-full"
                loading="lazy"
              />
            </AspectRatio>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductImageCard;
