// components/AdDetail.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Ad,
  ConditionLabels,
  ConditionColors,
  DistrictLabels,
  AdCondition,
} from "@/types";
import { ShareButton } from "./ShareButton";

interface AdDetailProps {
  ad: Ad;
}

export function AdDetail({ ad }: AdDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = ad.images || [];
  const primaryImage =
    images.length > 0 ? images[0].image_url : "/placeholder-image.jpg";
  const districtLabel =
    DistrictLabels[ad.customer.district] || ad.customer.district;
  const conditionLabel = ad.condition
    ? ConditionLabels[ad.condition as AdCondition]
    : null;
  const conditionColor = ad.condition
    ? ConditionColors[ad.condition as AdCondition]
    : "";

  const handleWhatsAppClick = () => {
    window.open(ad.customer.whatsapp_link, "_blank");
  };

  const statusLabels = {
    ACTIVE: "Ativo",
    SUSPENDED: "Suspenso",
    EXPIRED: "Expirado",
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    SUSPENDED: "bg-yellow-100 text-yellow-800",
    EXPIRED: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={images[selectedImage]?.image_url || primaryImage}
              alt={ad.product_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {ad.is_featured && (
              <div className="absolute top-4 left-4">
                <span className="bg-yellow-400 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full">
                  ⭐ Destaque
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={`${ad.product_name} - imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title & Status */}
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {ad.product_name}
              </h1>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[ad.status]}`}
              >
                {statusLabels[ad.status]}
              </span>
            </div>

            {/* Category & Condition */}
            <div className="flex flex-wrap gap-2 mt-2">
              {ad.category && (
                <span className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {ad.category.icon || "📁"} {ad.category.name}
                </span>
              )}
              {conditionLabel && (
                <span
                  className={`text-sm px-3 py-1 rounded-full ${conditionColor}`}
                >
                  {conditionLabel}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          {ad.price && (
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat("pt-ST", {
                  style: "currency",
                  currency: "STN",
                }).format(Number(ad.price))}
              </p>
            </div>
          )}

          {/* Description */}
          {ad.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Descrição
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {ad.description}
              </p>
            </div>
          )}

          {/* Location & Timestamps */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{districtLabel}</span>
            </div>
            <div>
              Publicado{" "}
              {formatDistanceToNow(new Date(ad.created_at), {
                addSuffix: true,
                locale: pt,
              })}
            </div>
            <div>
              Expira em {format(new Date(ad.expires_at), "PPP", { locale: pt })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={handleWhatsAppClick}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>💬</span>
              Contactar Vendedor no WhatsApp
            </button>
            <ShareButton
              url={typeof window !== "undefined" ? window.location.href : ""}
            />
          </div>

          {/* Vendor Info */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Vendedor: {ad.customer.mobile_number}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
