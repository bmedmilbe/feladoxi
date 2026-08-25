"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchAd,
  fetchCategories,
  getApiErrorMessage,
  updateAd,
  uploadAdImage,
} from "@/lib/api";
import type { ApiResponse, Category } from "@/types";

const maxImages = 10;
const maxImageSizeMb = 5;

const fieldClass =
  "h-12 w-full rounded-md border border-[#cfe2d5] bg-white px-4 text-sm font-medium text-[#173a32] outline-none transition placeholder:text-[#8aa098] focus:border-[#0b8a5f] focus:ring-4 focus:ring-[#0b8a5f]/10";

const textAreaClass =
  "min-h-[132px] w-full resize-none rounded-md border border-[#cfe2d5] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#173a32] outline-none transition placeholder:text-[#8aa098] focus:border-[#0b8a5f] focus:ring-4 focus:ring-[#0b8a5f]/10";

const statusLabels = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  EXPIRED: "Expirado",
};

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, tr, categoryName } = useLanguage();
  const previewUrlsRef = useRef<string[]>([]);

  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    category: "",
    price: "",
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(tr("A atualizar anúncio...", "Updating listing..."));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const { data: categories } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isAuthenticated,
  });

  const {
    data: ad,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => fetchAd(id),
    enabled: isAuthenticated && Number.isFinite(id),
  });

  useEffect(() => {
    if (!ad) return;

    setFormData({
      product_name: ad.product_name,
      description: ad.description || "",
      category: ad.category ? String(ad.category.id) : "",
      price: ad.price || "",
    });
  }, [ad]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const currentCount = (ad?.images?.length || 0) + newImages.length;
      const remainingSlots = Math.max(0, maxImages - currentCount);

      if (remainingSlots === 0) {
        toast.error(tr(`O anúncio pode ter no máximo ${maxImages} fotografias`, `A listing can have up to ${maxImages} photos`));
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      const previewsToAdd = filesToAdd.map((file) => URL.createObjectURL(file));
      previewUrlsRef.current.push(...previewsToAdd);
      setNewImages((current) => [...current, ...filesToAdd]);
      setImagePreviews((current) => [...current, ...previewsToAdd]);

      if (acceptedFiles.length > remainingSlots) {
        toast.error(tr(`Foram adicionadas apenas ${remainingSlots} fotografias`, `Only ${remainingSlots} photos were added`));
      }
    },
    [ad?.images?.length, newImages.length, tr],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: maxImages,
    maxSize: maxImageSizeMb * 1024 * 1024,
    onDropRejected: () => {
      toast.error(tr(`Use imagens JPG, PNG ou WEBP até ${maxImageSizeMb}MB`, `Use JPG, PNG or WEBP images up to ${maxImageSizeMb}MB`));
    },
  });

  const removeNewImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
      previewUrlsRef.current = previewUrlsRef.current.filter(
        (url) => url !== previewToRemove,
      );
    }

    setNewImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
    setImagePreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ad) return;

    if (!formData.product_name.trim() || !formData.category) {
      toast.error(tr("Preencha o nome e a categoria do produto", "Enter the product name and category"));
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(tr("A atualizar anúncio...", "Updating listing..."));

    try {
      const submitData = new FormData();
      submitData.append("product_name", formData.product_name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("category", formData.category);
      submitData.append("price", formData.price.trim());

      await updateAd(id, submitData);

      const existingImageCount = ad.images?.length || 0;
      for (let index = 0; index < newImages.length; index += 1) {
        setSubmitMessage(tr(`A enviar foto ${index + 1} de ${newImages.length}...`, `Uploading photo ${index + 1} of ${newImages.length}...`));
        await uploadAdImage(id, newImages[index], existingImageCount + index);
      }

      await queryClient.invalidateQueries({ queryKey: ["ad", id] });
      await queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      toast.success(
        newImages.length > 0
          ? tr("Anúncio e fotografias atualizados com sucesso!", "Listing and photos updated successfully!")
          : tr("Anúncio atualizado com sucesso!", "Listing updated successfully!"),
      );
      router.push("/my-ads");
    } catch (error: unknown) {
      const message =
        getApiErrorMessage(error) ||
        tr("Não foi possível atualizar o anúncio", "Unable to update the listing");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fbf6]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isError || !ad) {
    return (
      <EmptyState
        title={tr("Anúncio não encontrado", "Listing not found")}
        description={tr("Este anúncio não existe ou já foi removido.", "This listing does not exist or has already been removed.")}
        actionText={tr("Ver os meus anúncios", "View my listings")}
        actionLink="/my-ads"
      />
    );
  }

  const existingImages = ad.images || [];
  const totalImageCount = existingImages.length + newImages.length;

  return (
    <div className="bg-[#f4fbf6]">
      <section className="border-b border-[#d8e7dc] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 lg:px-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e7492f]">
            {tr("Gerir anúncio", "Manage listing")}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-[#07382d] sm:text-5xl">
            {tr("Editar produto", "Edit product")}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#52685f]">
            {tr("Atualize os dados e mantenha fotografias claras para o comprador.", "Update the details and keep the photos clear for buyers.")}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-10">
        <form
          onSubmit={handleSubmit}
          className="min-w-0 rounded-lg border border-[#d8e7dc] bg-white p-5 shadow-[0_18px_45px_rgba(14,42,35,0.08)] sm:p-7"
        >
          <section>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7492f]">
              {tr("Informações", "Information")}
            </p>
            <h2 className="mt-2 text-xl font-black text-[#0b2f27]">
              {tr("Dados do produto", "Product details")}
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="min-w-0 md:col-span-2">
                <label htmlFor="product_name" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                  {tr("Nome do produto", "Product name")}
                </label>
                <input
                  id="product_name"
                  required
                  value={formData.product_name}
                  onChange={(event) => setFormData((current) => ({ ...current, product_name: event.target.value }))}
                  className={fieldClass}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="category" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                  {tr("Categoria", "Category")}
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                  className={fieldClass}
                >
                  <option value="">{tr("Selecione uma categoria", "Select a category")}</option>
                  {categories?.results?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {categoryName(category.slug, category.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label htmlFor="price" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                  {tr("Preço em STN", "Price in STN")}
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Ex: 150000"
                  className={fieldClass}
                />
              </div>

              <div className="min-w-0 md:col-span-2">
                <label htmlFor="description" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                  {tr("Descrição", "Description")}
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  className={textAreaClass}
                />
              </div>
            </div>
          </section>

          <section className="mt-7 border-t border-[#edf4ef] pt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7492f]">{tr("Galeria", "Gallery")}</p>
                <h2 className="mt-2 text-xl font-black text-[#0b2f27]">{tr("Fotografias do produto", "Product photos")}</h2>
              </div>
              <span className="rounded-full bg-[#e7f5ee] px-3 py-1 text-xs font-bold text-[#0b3b2f]">
                {totalImageCount} {tr("de", "of")} {maxImages}
              </span>
            </div>

            {existingImages.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {existingImages.map((image, index) => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-[#d8e7dc] bg-[#edf7f1]">
                    <Image
                      src={image.image_url}
                      alt={`${ad.product_name} - ${tr("fotografia", "photo")} ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 50vw, 220px"
                    />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-[#0b2f27] px-2 py-1 text-xs font-bold text-white">{tr("Principal", "Main")}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-[#cfe2d5] bg-[#f8fcf9] px-4 py-5 text-sm leading-6 text-[#52685f]">
                {tr("Este anúncio ainda não tem fotografias guardadas. Adicione uma para que o produto apareça corretamente na vitrine.", "This listing has no saved photos yet. Add one so the product appears correctly in the marketplace.")}
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative aspect-square overflow-hidden rounded-lg border border-[#cfe2d5] bg-[#edf7f1]">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${preview})` }}
                      aria-label={`${tr("Nova fotografia", "New photo")} ${index + 1}`}
                      role="img"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-xs font-bold text-[#0b3b2f] shadow-sm">{tr("Nova", "New")}</span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold text-[#a33a2a] shadow-sm"
                      aria-label={`${tr("Remover nova fotografia", "Remove new photo")} ${index + 1}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalImageCount < maxImages && (
              <div
                {...getRootProps()}
                className={`mt-4 cursor-pointer rounded-lg border-2 border-dashed px-5 py-8 text-center transition ${
                  isDragActive ? "border-[#0b8a5f] bg-[#e7f5ee]" : "border-[#cfe2d5] bg-[#f8fcf9] hover:border-[#0b8a5f]"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm font-bold text-[#0b2f27]">
                  {isDragActive ? tr("Solte as fotografias aqui", "Drop the photos here") : tr("Clique ou arraste para adicionar fotografias", "Click or drag to add photos")}
                </p>
                <p className="mt-1 text-xs text-[#6d8179]">{tr(`JPG, PNG ou WEBP, até ${maxImageSizeMb}MB por ficheiro`, `JPG, PNG or WEBP, up to ${maxImageSizeMb}MB per file`)}</p>
              </div>
            )}
          </section>

          <div className="mt-7 flex flex-col gap-3 border-t border-[#edf4ef] pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-[#e7492f] px-6 text-sm font-bold text-white transition hover:bg-[#c83e27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? submitMessage : tr("Guardar alterações", "Save changes")}
            </button>
            <Link href="/my-ads" className="inline-flex h-12 items-center justify-center rounded-md border border-[#cfe2d5] px-6 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee]">
              {tr("Cancelar", "Cancel")}
            </Link>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#d8e7dc] bg-white p-5 shadow-[0_14px_34px_rgba(14,42,35,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7492f]">{tr("Estado atual", "Current status")}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[#0b2f27]">{tr("Publicação", "Publication")}</span>
              <span className="rounded-full bg-[#e7f5ee] px-3 py-1 text-xs font-bold text-[#0b3b2f]">{language === "en" ? ({ ACTIVE: "Active", SUSPENDED: "Suspended", EXPIRED: "Expired" } as Record<string, string>)[ad.status] : statusLabels[ad.status]}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#52685f]">
              {tr("Expira em", "Expires on")} {new Date(ad.expires_at).toLocaleDateString(language === "en" ? "en-GB" : "pt-PT")}.
            </p>
          </div>

          <div className="rounded-lg bg-[#0b2f27] p-5 text-white shadow-[0_18px_45px_rgba(14,42,35,0.16)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb199]">{tr("Fotografias", "Photos")}</p>
            <p className="mt-3 text-sm leading-7 text-[#e7fff3]">
              {tr("A primeira imagem guardada é usada como fotografia principal do produto na vitrine.", "The first saved image is used as the product's main marketplace photo.")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
