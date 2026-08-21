"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  createTemporaryAd,
  fetchCategories,
  uploadTemporaryAdImage,
} from "@/lib/api";
import {
  type AdCondition,
  type ApiResponse,
  type Category,
  ConditionLabels,
} from "@/types";

type CreateAdFormData = {
  product_name: string;
  description: string;
  category: string;
  condition: AdCondition;
  price: string;
  images: File[];
};

const maxImages = 10;
const maxImageSizeMb = 5;

const fieldClass =
  "h-12 w-full rounded-md border border-[#cfe2d5] bg-white px-4 text-sm font-medium text-[#173a32] outline-none transition placeholder:text-[#8aa098] focus:border-[#0b8a5f] focus:ring-4 focus:ring-[#0b8a5f]/10";

const textAreaClass =
  "min-h-[132px] w-full resize-none rounded-md border border-[#cfe2d5] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#173a32] outline-none transition placeholder:text-[#8aa098] focus:border-[#0b8a5f] focus:ring-4 focus:ring-[#0b8a5f]/10";

const sellerNotes = [
  {
    title: "Rascunho protegido",
    description: "Pode criar o anúncio agora e confirmar a publicação depois do login.",
  },
  {
    title: "Mais fotos, mais confiança",
    description: "Use imagens reais do produto para reduzir dúvidas na negociação.",
  },
  {
    title: "Preço claro",
    description: "Indique o valor em STN ou deixe em aberto quando preferir combinar.",
  },
];

function UploadIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CreateAdPage() {
  const router = useRouter();
  const previewUrlsRef = useRef<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("A guardar anúncio...");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateAdFormData>({
    product_name: "",
    description: "",
    category: "",
    condition: "USED",
    price: "",
    images: [],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    ApiResponse<Category>
  >({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = maxImages - formData.images.length;

      if (remainingSlots <= 0) {
        toast.error(`Pode adicionar no máximo ${maxImages} fotos`);
        return;
      }

      const nextFiles = acceptedFiles.slice(0, remainingSlots);
      const nextPreviews = nextFiles.map((file) => URL.createObjectURL(file));
      previewUrlsRef.current.push(...nextPreviews);

      setFormData((current) => ({
        ...current,
        images: [...current.images, ...nextFiles],
      }));
      setImagePreviews((current) => [...current, ...nextPreviews]);

      if (acceptedFiles.length > remainingSlots) {
        toast.error(`Foram adicionadas apenas ${remainingSlots} fotos`);
      }
    },
    [formData.images.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: maxImageSizeMb * 1024 * 1024,
    maxFiles: maxImages,
    onDropRejected: () => {
      toast.error(`Use imagens JPG, PNG ou WEBP até ${maxImageSizeMb}MB`);
    },
  });

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
      previewUrlsRef.current = previewUrlsRef.current.filter(
        (url) => url !== previewToRemove,
      );
    }

    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
    setImagePreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const updateField = <Key extends keyof CreateAdFormData>(
    key: Key,
    value: CreateAdFormData[Key],
  ) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.product_name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }

    if (!formData.category) {
      toast.error("Selecione uma categoria");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("A guardar anúncio...");

    try {
      const submitData = new FormData();
      submitData.append("product_name", formData.product_name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("category", formData.category);
      submitData.append("condition", formData.condition);

      if (formData.price.trim()) {
        submitData.append("price", formData.price.trim());
      }

      const response = await createTemporaryAd(submitData);

      if (!response.id || !response.session_token) {
        throw new Error("A API não devolveu os dados do anúncio temporário");
      }

      for (let index = 0; index < formData.images.length; index += 1) {
        const image = formData.images[index];
        setSubmitMessage(
          `A enviar foto ${index + 1} de ${formData.images.length}...`,
        );
        await uploadTemporaryAdImage(response.id, image, index);
      }

      localStorage.setItem("pending_ad_token", response.session_token);
      localStorage.setItem(
        "pending_ad_data",
        JSON.stringify({
          product_name: formData.product_name.trim(),
          image_count: formData.images.length,
          created_at: response.created_at || new Date().toISOString(),
        }),
      );

      toast.success("Anúncio guardado. Entre para publicar.");
      router.push("/auth/login?pending_ad=true");
    } catch (error: any) {
      console.error("Error creating temporary ad:", error);
      toast.error(
        error.response?.data?.error ||
          "Não foi possível criar o anúncio. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f4fbf6]">
      <section className="border-b border-[#d8e7dc] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e7492f]">
              Vender no mercado
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#07382d] sm:text-5xl">
              Anunciar produto
            </h1>
            <p className="mt-4 text-base leading-7 text-[#52685f]">
              Monte uma vitrine clara para o seu produto. Depois de guardar o
              rascunho, entre na conta para publicar.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d8e7dc] bg-white p-5 shadow-[0_18px_45px_rgba(14,42,35,0.08)] sm:p-7"
        >
          <div className="grid gap-6">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7492f]">
                    Dados principais
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[#0b2f27]">
                    Produto
                  </h2>
                </div>
                <span className="rounded-full bg-[#e7f5ee] px-3 py-1 text-xs font-bold text-[#0b3b2f]">
                  Obrigatorio
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="product_name"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]"
                  >
                    Nome do produto
                  </label>
                  <input
                    id="product_name"
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(event) =>
                      updateField("product_name", event.target.value)
                    }
                    placeholder="Ex: iPhone 13 Pro Max"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]"
                  >
                    Categoria
                  </label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.results?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="condition"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]"
                  >
                    Condição
                  </label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(event) =>
                      updateField("condition", event.target.value as AdCondition)
                    }
                    className={fieldClass}
                  >
                    {Object.entries(ConditionLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]"
                  >
                    Preço em STN
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    placeholder="Ex: 150000"
                    className={fieldClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]"
                  >
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Descreva estado, origem, acessorios e detalhes importantes."
                    className={textAreaClass}
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-[#edf4ef] pt-6">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7492f]">
                  Galeria
                </p>
                <h2 className="mt-2 text-xl font-black text-[#0b2f27]">
                  Fotos do produto
                </h2>
              </div>

              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
                  isDragActive
                    ? "border-[#0b8a5f] bg-[#e7f5ee]"
                    : "border-[#cfe2d5] bg-[#f8fcf9] hover:border-[#0b8a5f]"
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-white text-[#0b3b2f] shadow-sm">
                  <UploadIcon />
                </div>
                <p className="mt-4 text-sm font-bold text-[#0b2f27]">
                  {isDragActive
                    ? "Solte as imagens aqui"
                    : "Arraste fotos ou clique para selecionar"}
                </p>
                <p className="mt-1 text-xs text-[#6d8179]">
                  Até {maxImages} imagens, {maxImageSizeMb}MB por ficheiro
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={preview} className="relative overflow-hidden rounded-lg border border-[#d8e7dc] bg-[#edf7f1]">
                      <div
                        className="aspect-square bg-cover bg-center"
                        style={{ backgroundImage: `url(${preview})` }}
                        aria-label={`Foto ${index + 1}`}
                        role="img"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[#a33a2a] shadow-md transition hover:bg-[#ffe8df]"
                        aria-label={`Remover foto ${index + 1}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex flex-col gap-3 border-t border-[#edf4ef] pt-6 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-[#e7492f] px-6 text-sm font-bold text-white transition hover:bg-[#c83e27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? submitMessage : "Guardar e continuar"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-12 items-center justify-center rounded-md border border-[#cfe2d5] px-6 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#d8e7dc] bg-white p-5 shadow-[0_14px_34px_rgba(14,42,35,0.08)]">
            <h2 className="font-serif text-2xl font-semibold text-[#07382d]">
              Publicação
            </h2>
            <div className="mt-5 grid gap-4">
              {sellerNotes.map((note) => (
                <div key={note.title} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#e7f5ee] text-[#0b3b2f]">
                    <CheckIcon />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#0b2f27]">
                      {note.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#52685f]">
                      {note.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[#0b2f27] p-5 text-white shadow-[0_18px_45px_rgba(14,42,35,0.16)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb199]">
              Próxima etapa
            </p>
            <p className="mt-3 text-sm leading-7 text-[#e7fff3]">
              Ao continuar, o anúncio fica associado a um rascunho. No login, a
              plataforma publica o produto na sua conta.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
