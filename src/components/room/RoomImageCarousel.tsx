
import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface RoomImageCarouselProps {
  images: string[];
  roomName: string;
  aspectRatio?: number;
  className?: string;
  thumbnailClassName?: string;
  showThumbnails?: boolean;
}

const RoomImageCarousel = ({
  images,
  roomName,
  aspectRatio = 16 / 9,
  className,
  thumbnailClassName,
  showThumbnails = true,
}: RoomImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={aspectRatio} className="bg-muted">
                <img
                  src={image}
                  alt={`${roomName} - Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      
      {showThumbnails && images.length > 1 && (
        <ScrollArea className={cn("w-full", thumbnailClassName)}>
          <div className="flex space-x-2 p-1">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md border transition-all",
                  current === index 
                    ? "border-primary ring-1 ring-primary" 
                    : "border-muted hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                )}
              >
                <img
                  src={image}
                  alt={`${roomName} - Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default RoomImageCarousel;
