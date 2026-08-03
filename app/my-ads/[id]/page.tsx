// app/ads/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchAd, fetchCategories, updateAd } from "@/lib/api";
import { ApiResponse, Category } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import toast from "react-hot-toast";
import Link from "next/link";

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    category: "",
    price: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch categories
  const { data: categories } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isAuthenticated,
  });

  // Fetch ad data
  const {
    data: ad,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => fetchAd(id),
    enabled: isAuthenticated && !isNaN(id),
  });

  // Populate form when ad data loads
  useEffect(() => {
    if (ad) {
      setFormData({
        product_name: ad.product_name,
        description: ad.description || "",
        category: ad.category ? String(ad.category.id) : "",
        price: ad.price || "",
      });
    }
  }, [ad]);

  // Update ad mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateAd(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad", id] });
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      toast.success("Anúncio atualizado com sucesso!");
      router.push("/my-ads");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erro ao atualizar anúncio");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("product_name", formData.product_name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("category", formData.category);
      if (formData.price) {
        submitData.append("price", formData.price);
      }

      await updateMutation.mutateAsync(submitData);
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isError || !ad) {
    return (
      <EmptyState
        title="Anúncio não encontrado"
        description="O anúncio que você está tentando editar não existe ou foi removido"
        actionText="Ver Meus Anúncios"
        actionLink="/my-ads"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
          <h1 className="text-2xl font-bold text-white">Editar Anúncio</h1>
          <p className="text-blue-100 mt-1">
            Atualize as informações do seu anúncio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label
              htmlFor="product_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome do Produto <span className="text-red-500">*</span>
            </label>
            <input
              id="product_name"
              type="text"
              required
              placeholder="Ex: iPhone 13 Pro Max"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Selecione uma categoria</option>
              {categories?.results?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon || "📁"} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Preço (em Dobras)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 150000"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descrição
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Descreva o produto em detalhes..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status atual:</span>{" "}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  ad.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : ad.status === "SUSPENDED"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {ad.status}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Expira em: {new Date(ad.expires_at).toLocaleDateString("pt-PT")}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Atualizando...
                </>
              ) : (
                "💾 Atualizar Anúncio"
              )}
            </button>
            <Link
              href="/my-ads"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
