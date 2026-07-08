// components/AdCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { DistrictLabels, Ad, ConditionLabels, AdCondition } from "@/types";

interface AdCardProps {
  ad: Ad;
  featured?: boolean;
}

export function AdCard({ ad, featured = false }: AdCardProps) {
  const primaryImage = ad.images?.[0]?.image_url || "/placeholder-image.jpg";
  const districtLabel =
    DistrictLabels[ad.customer.district] || ad.customer.district;
  const conditionLabel = ad.condition
    ? ConditionLabels[ad.condition as AdCondition]
    : null;

  return (
    <Link href={`/ads/${ad.id}`}>
      <div
        className={`card h-full hover:translate-y-[-4px] transition-transform ${
          featured ? "ring-2 ring-yellow-400 ring-offset-2" : ""
        }`}
      >
        {/* Image */}
        <div className="relative w-full h-48 bg-gray-200 rounded-t-xl overflow-hidden">
          <Image
            src={primaryImage}
            alt={ad.product_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Condition Badge */}
          {conditionLabel && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {conditionLabel}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {ad.product_name}
          </h3>

          {/* Category and District */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {ad.category?.icon} {ad.category?.name || "Sem categoria"}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-sm text-gray-500">📍 {districtLabel}</span>
          </div>

          {/* Price */}
          {ad.price && (
            <p className="text-lg font-bold text-blue-600 mb-2">
              {new Intl.NumberFormat("pt-ST", {
                style: "currency",
                currency: "STN",
              }).format(Number(ad.price))}
            </p>
          )}

          {/* Time */}
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(ad.created_at), {
              addSuffix: true,
              locale: pt,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
