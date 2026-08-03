// app/ads/create/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { fetchCategories, createTemporaryAd } from "@/lib/api";
import { ApiResponse, Category, DistrictLabels } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface FormData {
  product_name: string;
  description: string;
  category: string;
  price: string;
  images: File[];
}

export default function CreateAdPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    product_name: "",
    description: "",
    category: "",
    price: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    ApiResponse<Category>
  >({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Handle image drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to 10 images
      const newImages = [...formData.images, ...acceptedFiles].slice(0, 10);
      setFormData((prev) => ({ ...prev, images: newImages }));

      // Generate previews
      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    },
    [formData.images],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
  });

  // Remove image
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.product_name.trim()) {
        toast.error("Por favor, insira o nome do produto");
        setIsSubmitting(false);
        return;
      }

      if (!formData.category) {
        toast.error("Por favor, selecione uma categoria");
        setIsSubmitting(false);
        return;
      }

      // Create FormData for API request
      const submitData = new FormData();
      submitData.append("product_name", formData.product_name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("category", formData.category);
      if (formData.price) {
        submitData.append("price", formData.price);
      }

      // Append images
      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      // Submit to API
      const response = await createTemporaryAd(submitData);

      // Store session token in localStorage
      if (response.session_token) {
        localStorage.setItem("pending_ad_token", response.session_token);
        localStorage.setItem(
          "pending_ad_data",
          JSON.stringify({
            product_name: formData.product_name,
            created_at: new Date().toISOString(),
          }),
        );
      }

      toast.success("Anúncio criado com sucesso! Faça login para publicá-lo.");

      // Redirect to login page with pending ad indicator
      router.push("/auth/login?pending_ad=true");
    } catch (error: any) {
      console.error("Error creating temporary ad:", error);
      toast.error(
        error.response?.data?.error ||
          "Erro ao criar anúncio. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
          <h1 className="text-2xl font-bold text-white">Criar Novo Anúncio</h1>
          <p className="text-blue-100 mt-1">
            Publique seu produto gratuitamente. Faça login após criar o anúncio
            para publicá-lo.
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotos do Produto
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <div className="text-4xl">📸</div>
                <p className="text-gray-600">
                  {isDragActive
                    ? "Solte as imagens aqui..."
                    : "Arraste e solte imagens ou clique para selecionar"}
                </p>
                <p className="text-xs text-gray-400">
                  Máximo de 10 imagens (5MB cada)
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-xl">ℹ️</span>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Como funciona?
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Preencha os detalhes do seu produto</li>
                  <li>Após criar, você será redirecionado para fazer login</li>
                  <li>
                    Faça login com seu número e PIN para publicar o anúncio
                  </li>
                  <li>O anúncio ficará ativo por 7 dias</li>
                </ul>
              </div>
            </div>
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
                  Criando anúncio...
                </>
              ) : (
                "Criar Anúncio"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
