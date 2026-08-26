"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  createAdminCategory,
  deleteAdminAd,
  deleteAdminAdvertisingRequest,
  deleteAdminCategory,
  fetchAdminAds,
  fetchAdminAdvertisingRequests,
  fetchAdminCategories,
  fetchAdminDashboard,
  fetchAdminUsers,
  getApiErrorMessage,
  updateAdminAd,
  updateAdminAdvertisingRequest,
  updateAdminCategory,
  updateAdminUser,
} from "@/lib/api";
import {
  DistrictLabels,
  type Ad,
  type AdvertisingRequest,
  type AdvertisingRequestStatus,
  type ApiResponse,
  type Category,
} from "@/types";

type AdminTab = "dashboard" | "products" | "categories" | "requests" | "users";

const requestStatuses: AdvertisingRequestStatus[] = [
  "NEW",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

const tabItems: Array<{ id: AdminTab; pt: string; en: string; mark: string }> = [
  { id: "dashboard", pt: "Resumo", en: "Overview", mark: "▦" },
  { id: "products", pt: "Produtos", en: "Products", mark: "□" },
  { id: "categories", pt: "Categorias", en: "Categories", mark: "#" },
  { id: "requests", pt: "Pedidos", en: "Requests", mark: "◎" },
  { id: "users", pt: "Utilizadores", en: "Users", mark: "○" },
];

const fieldClass = "h-11 w-full rounded-md border border-[#c8dde5] bg-white px-3 text-sm font-semibold text-[#183e58] outline-none focus:border-[#08a6a6] focus:ring-4 focus:ring-[#08a6a6]/10";

function Pagination({ page, data, onPage }: { page: number; data?: ApiResponse<unknown>; onPage: (page: number) => void }) {
  if (!data || (!data.previous && !data.next)) return null;
  return (
    <div className="mt-5 flex items-center justify-between border-t border-[#dceaf0] pt-4">
      <button type="button" disabled={!data.previous} onClick={() => onPage(Math.max(1, page - 1))} className="h-10 rounded-md border border-[#c8dde5] px-4 text-sm font-bold disabled:opacity-40">← Anterior</button>
      <span className="text-sm font-bold text-[#657d8d]">Página {page}</span>
      <button type="button" disabled={!data.next} onClick={() => onPage(page + 1)} className="h-10 rounded-md border border-[#c8dde5] px-4 text-sm font-bold disabled:opacity-40">Seguinte →</button>
    </div>
  );
}

function CategoryRow({ category, onSaved, onDelete }: { category: Category; onSaved: () => void; onDelete: () => void }) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(category.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateAdminCategory(category.id, { name: name.trim(), slug: slug.trim(), description: description.trim() });
      toast.success("Categoria atualizada");
      onSaved();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || "Não foi possível atualizar a categoria");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-3 border-b border-[#e5eff3] py-4 last:border-b-0 lg:grid-cols-[1fr_1fr_1.6fr_auto] lg:items-end">
      <label className="text-xs font-black uppercase text-[#657d8d]">Nome<input value={name} onChange={(event) => setName(event.target.value)} className={`${fieldClass} mt-1`} /></label>
      <label className="text-xs font-black uppercase text-[#657d8d]">Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} className={`${fieldClass} mt-1`} /></label>
      <label className="text-xs font-black uppercase text-[#657d8d]">Descrição<input value={description} onChange={(event) => setDescription(event.target.value)} className={`${fieldClass} mt-1`} /></label>
      <div className="flex gap-2">
        <button type="button" disabled={saving} onClick={save} className="h-11 rounded-md bg-[#082f4f] px-4 text-sm font-black text-white disabled:opacity-50">✓ Guardar</button>
        <button type="button" onClick={onDelete} className="grid h-11 w-11 place-items-center rounded-md border border-[#efc1b8] text-xl text-[#a33a2a]" aria-label={`Eliminar ${category.name}`} title="Eliminar">×</button>
      </div>
    </div>
  );
}

function RequestRow({ request, onSaved, onDelete }: { request: AdvertisingRequest; onSaved: () => void; onDelete: () => void }) {
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const whatsapp = `https://wa.me/${request.contact_phone.replace(/\D/g, "")}`;

  const save = async () => {
    setSaving(true);
    try {
      await updateAdminAdvertisingRequest(request.id, { status, admin_notes: notes.trim() });
      toast.success("Pedido atualizado");
      onSaved();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || "Não foi possível atualizar o pedido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="border-b border-[#e5eff3] py-5 last:border-b-0">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-[#e4f7f7] px-2 py-1 text-xs font-black text-[#087f82]">#{request.id}</span><span className="text-xs font-bold uppercase text-[#657d8d]">{request.campaign_type === "BRAND" ? "Marca" : "Produto"}</span></div>
          <h3 className="mt-2 text-lg font-black text-[#082f4f]">{request.campaign_name}</h3>
          <p className="mt-1 text-sm text-[#516f82]">{request.contact_name} · {request.contact_phone} · {request.duration}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657d8d]">{request.description}</p>
        </div>
        <div className="grid shrink-0 gap-2 sm:grid-cols-[190px_auto_auto] xl:w-[520px]">
          <select value={status} onChange={(event) => setStatus(event.target.value as AdvertisingRequestStatus)} className={fieldClass}>{requestStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-md bg-[#138256] px-4 text-sm font-black text-white">WhatsApp</a>
          <button type="button" onClick={onDelete} className="grid h-11 w-11 place-items-center rounded-md border border-[#efc1b8] text-xl text-[#a33a2a]" aria-label={`Eliminar pedido ${request.id}`}>×</button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input value={notes} onChange={(event) => setNotes(event.target.value)} className={fieldClass} placeholder="Notas internas" />
        <button type="button" disabled={saving} onClick={save} className="h-11 rounded-md bg-[#082f4f] px-5 text-sm font-black text-white disabled:opacity-50">✓ Guardar estado</button>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, tr } = useLanguage();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [pages, setPages] = useState({ products: 1, categories: 1, requests: 1, users: 1 });
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "" });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const isAdmin = Boolean(user?.is_staff);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth/login");
  }, [authLoading, isAuthenticated, router]);

  const dashboard = useQuery({ queryKey: ["admin-dashboard"], queryFn: fetchAdminDashboard, enabled: isAdmin });
  const products = useQuery({ queryKey: ["admin-products", pages.products, appliedSearch], queryFn: () => fetchAdminAds(pages.products, appliedSearch), enabled: isAdmin && tab === "products" });
  const categories = useQuery({ queryKey: ["admin-categories", pages.categories, appliedSearch], queryFn: () => fetchAdminCategories(pages.categories, appliedSearch), enabled: isAdmin && tab === "categories" });
  const requests = useQuery({ queryKey: ["admin-requests", pages.requests, appliedSearch], queryFn: () => fetchAdminAdvertisingRequests(pages.requests, appliedSearch), enabled: isAdmin && tab === "requests" });
  const users = useQuery({ queryKey: ["admin-users", pages.users, appliedSearch], queryFn: () => fetchAdminUsers(pages.users, appliedSearch), enabled: isAdmin && tab === "users" });

  const refresh = async (key: string) => {
    await queryClient.invalidateQueries({ queryKey: [key] });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const adMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Ad["id"]; payload: Parameters<typeof updateAdminAd>[1] }) => updateAdminAd(id, payload),
    onSuccess: () => { toast.success(tr("Produto atualizado", "Product updated")); void refresh("admin-products"); },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error) || tr("Não foi possível atualizar", "Unable to update")),
  });

  const createCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingCategory(true);
    try {
      await createAdminCategory(categoryForm);
      setCategoryForm({ name: "", slug: "", description: "" });
      toast.success(tr("Categoria criada", "Category created"));
      await refresh("admin-categories");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || tr("Não foi possível criar a categoria", "Unable to create category"));
    } finally {
      setCreatingCategory(false);
    }
  };

  if (authLoading) return <div className="grid min-h-[60vh] place-items-center"><LoadingSpinner /></div>;
  if (!isAuthenticated) return null;
  if (!user || !user.is_staff) return <EmptyState title={tr("Acesso reservado", "Restricted access")} description={tr("Esta área está disponível apenas para administradores autorizados.", "This area is available only to authorised administrators.")} actionText={tr("Voltar ao mercado", "Back to marketplace")} actionLink="/" />;

  const currentLoading = tab === "dashboard" ? dashboard.isLoading : tab === "products" ? products.isLoading : tab === "categories" ? categories.isLoading : tab === "requests" ? requests.isLoading : users.isLoading;
  const currentError = tab === "dashboard" ? dashboard.isError : tab === "products" ? products.isError : tab === "categories" ? categories.isError : tab === "requests" ? requests.isError : users.isError;

  return (
    <div className="min-h-[75vh] bg-[#f3f8fa]">
      <header className="border-b border-[#cfe3ea] bg-[#082f4f] text-white">
        <div className="mx-auto max-w-[1536px] px-4 py-7 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase text-[#7ee0df]">Mercado STP · {tr("Administração", "Administration")}</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h1 className="text-3xl font-black sm:text-4xl">{tr("Gestão do mercado", "Marketplace management")}</h1><p className="mt-2 text-sm text-[#c8e0eb]">{tr("Dados e operações da base online.", "Live database operations and data.")}</p></div>
            <span className="text-sm font-bold text-[#c8e0eb]">{user.mobile_number}</span>
          </div>
        </div>
      </header>

      <div className="sticky top-[136px] z-30 border-b border-[#cfe3ea] bg-white/95 backdrop-blur sm:top-[134px] md:top-[174px]">
        <nav className="mx-auto flex max-w-[1536px] gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8" aria-label={tr("Módulos administrativos", "Administration modules")}>
          {tabItems.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setSearchTerm(""); setAppliedSearch(""); }} className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-black ${tab === item.id ? "bg-[#08a6a6] text-white" : "text-[#516f82] hover:bg-[#eefafa]"}`} aria-pressed={tab === item.id}><span aria-hidden="true">{item.mark}</span>{language === "en" ? item.en : item.pt}</button>)}
        </nav>
      </div>

      <main className="mx-auto max-w-[1536px] px-4 py-7 sm:px-6 lg:px-8">
        {tab !== "dashboard" && (
          <form onSubmit={(event) => { event.preventDefault(); setAppliedSearch(searchTerm.trim()); setPages({ products: 1, categories: 1, requests: 1, users: 1 }); }} className="mb-6 flex max-w-2xl gap-2">
            <label htmlFor="admin-search" className="sr-only">{tr("Pesquisar neste módulo", "Search this module")}</label>
            <input id="admin-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className={fieldClass} placeholder={tr("Pesquisar na base online", "Search the live database")} />
            <button type="submit" className="h-11 shrink-0 rounded-md bg-[#08a6a6] px-5 text-sm font-black text-white">{tr("Pesquisar", "Search")}</button>
            {appliedSearch && <button type="button" onClick={() => { setSearchTerm(""); setAppliedSearch(""); }} className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#c8dde5] text-xl" aria-label={tr("Limpar pesquisa", "Clear search")}>×</button>}
          </form>
        )}
        {currentLoading ? <div className="grid min-h-[360px] place-items-center"><LoadingSpinner /></div> : null}
        {!currentLoading && currentError ? <EmptyState title={tr("Não foi possível carregar este módulo", "Unable to load this module")} description={tr("Confirme a ligação à base online e tente novamente.", "Check the live database connection and try again.")} actionText={tr("Tentar novamente", "Try again")} actionOnClick={() => void queryClient.invalidateQueries({ queryKey: [`admin-${tab}`] })} /> : null}

        {!currentLoading && tab === "dashboard" && dashboard.data && (
          <div className="space-y-7">
            <section className="grid overflow-hidden rounded-lg border border-[#cfe3ea] bg-white sm:grid-cols-2 xl:grid-cols-5">
              {[
                [tr("Produtos", "Products"), dashboard.data.ads.total, `${dashboard.data.ads.active} ${tr("ativos", "active")}`],
                [tr("Categorias", "Categories"), dashboard.data.categories, tr("na base online", "in the live database")],
                [tr("Utilizadores", "Users"), dashboard.data.users, tr("contas registadas", "registered accounts")],
                [tr("Pedidos", "Requests"), dashboard.data.advertising_requests.total, `${dashboard.data.advertising_requests.new} ${tr("novos", "new")}`],
                [tr("Rascunhos", "Drafts"), dashboard.data.temporary_ads, tr("por publicar", "waiting to publish")],
              ].map(([label, value, detail], index) => <div key={String(label)} className={`min-w-0 border-b border-[#e5eff3] p-5 sm:border-r ${index >= 3 ? "sm:border-b-0" : ""} xl:border-b-0 xl:last:border-r-0`}><p className="text-xs font-black uppercase text-[#657d8d]">{label}</p><p className="mt-2 text-3xl font-black text-[#082f4f]">{value}</p><p className="mt-1 text-xs font-semibold text-[#7b8f9d]">{detail}</p></div>)}
            </section>
            <section>
              <div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase text-[#e7492f]">{tr("Atividade", "Activity")}</p><h2 className="mt-1 text-2xl font-black text-[#082f4f]">{tr("Pedidos recentes", "Recent requests")}</h2></div><button type="button" onClick={() => setTab("requests")} className="text-sm font-black text-[#078b8d]">{tr("Ver todos", "View all")} →</button></div>
              <div className="mt-4 divide-y divide-[#e5eff3] border-y border-[#cfe3ea] bg-white px-4 sm:px-5">{dashboard.data.recent_requests.length ? dashboard.data.recent_requests.map((request) => <div key={request.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-[#082f4f]">#{request.id} · {request.campaign_name}</p><p className="mt-1 text-sm text-[#657d8d]">{request.contact_name} · {request.contact_phone}</p></div><span className="w-fit rounded bg-[#e4f7f7] px-2 py-1 text-xs font-black text-[#087f82]">{request.status}</span></div>) : <p className="py-6 text-sm text-[#657d8d]">{tr("Ainda não há pedidos guardados.", "No requests have been saved yet.")}</p>}</div>
            </section>
          </div>
        )}

        {!currentLoading && tab === "products" && products.data && (
          <section><div className="mb-5"><p className="text-xs font-black uppercase text-[#e7492f]">{tr("Catálogo", "Catalogue")}</p><h2 className="mt-1 text-2xl font-black">{products.data.count} {tr("produtos", "products")}</h2></div><div className="divide-y divide-[#e5eff3] border-y border-[#cfe3ea] bg-white px-4 sm:px-5">{products.data.results.map((ad) => <article key={ad.id} className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_180px_150px_auto] lg:items-center"><div className="min-w-0"><Link href={`/ads/${ad.id}`} className="truncate text-base font-black text-[#082f4f] hover:text-[#e7492f]">{ad.product_name}</Link><p className="mt-1 text-xs font-semibold text-[#657d8d]">{ad.customer.mobile_number} · {ad.category?.name || tr("Sem categoria", "Uncategorised")}</p></div><select value={ad.status} onChange={(event) => adMutation.mutate({ id: ad.id, payload: { status: event.target.value as Ad["status"] } })} className={fieldClass}><option value="ACTIVE">{tr("Ativo", "Active")}</option><option value="SUSPENDED">{tr("Suspenso", "Suspended")}</option><option value="EXPIRED">{tr("Inativo", "Inactive")}</option></select><label className="flex h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={ad.is_featured_active} onChange={(event) => adMutation.mutate({ id: ad.id, payload: { is_featured: event.target.checked, featured_until: null } })} className="h-5 w-5 accent-[#08a6a6]" />{tr("Destaque", "Featured")}</label><button type="button" onClick={async () => { if (window.confirm(tr(`Eliminar ${ad.product_name}?`, `Delete ${ad.product_name}?`))) { await deleteAdminAd(ad.id); toast.success(tr("Produto eliminado", "Product deleted")); await refresh("admin-products"); } }} className="grid h-11 w-11 place-items-center rounded-md border border-[#efc1b8] text-xl text-[#a33a2a]" aria-label={tr(`Eliminar ${ad.product_name}`, `Delete ${ad.product_name}`)}>×</button></article>)}</div><Pagination page={pages.products} data={products.data} onPage={(page) => setPages((current) => ({ ...current, products: page }))} /></section>
        )}

        {!currentLoading && tab === "categories" && categories.data && (
          <section><div className="mb-5"><p className="text-xs font-black uppercase text-[#e7492f]">{tr("Organização", "Organisation")}</p><h2 className="mt-1 text-2xl font-black">{categories.data.count} {tr("categorias", "categories")}</h2></div><form onSubmit={createCategory} className="grid gap-3 border-y border-[#cfe3ea] bg-[#eaf7f9] p-4 lg:grid-cols-[1fr_1fr_1.5fr_auto]"><input required value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value, slug: current.slug || event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }))} className={fieldClass} placeholder={tr("Nome da categoria", "Category name")} /><input required value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} className={fieldClass} placeholder="slug-da-categoria" /><input value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} className={fieldClass} placeholder={tr("Descrição", "Description")} /><button disabled={creatingCategory} className="h-11 rounded-md bg-[#e7492f] px-5 text-sm font-black text-white disabled:opacity-50">+ {tr("Adicionar", "Add")}</button></form><div className="mt-4 border-y border-[#cfe3ea] bg-white px-4 sm:px-5">{categories.data.results.map((category) => <CategoryRow key={category.id} category={category} onSaved={() => void refresh("admin-categories")} onDelete={async () => { if (window.confirm(tr(`Eliminar ${category.name}?`, `Delete ${category.name}?`))) { await deleteAdminCategory(category.id); toast.success(tr("Categoria eliminada", "Category deleted")); await refresh("admin-categories"); } }} />)}</div><Pagination page={pages.categories} data={categories.data} onPage={(page) => setPages((current) => ({ ...current, categories: page }))} /></section>
        )}

        {!currentLoading && tab === "requests" && requests.data && (
          <section><div className="mb-5"><p className="text-xs font-black uppercase text-[#e7492f]">{tr("Publicidade", "Advertising")}</p><h2 className="mt-1 text-2xl font-black">{requests.data.count} {tr("pedidos", "requests")}</h2><p className="mt-2 text-sm text-[#657d8d]">{tr("Pedidos de campanhas guardados na base online. As compras de produtos continuam diretamente pelo WhatsApp do vendedor.", "Campaign requests stored online. Product purchases continue directly through the seller's WhatsApp.")}</p></div><div className="border-y border-[#cfe3ea] bg-white px-4 sm:px-5">{requests.data.results.map((request) => <RequestRow key={request.id} request={request} onSaved={() => void refresh("admin-requests")} onDelete={async () => { if (window.confirm(tr(`Eliminar pedido #${request.id}?`, `Delete request #${request.id}?`))) { await deleteAdminAdvertisingRequest(request.id); toast.success(tr("Pedido eliminado", "Request deleted")); await refresh("admin-requests"); } }} />)}</div><Pagination page={pages.requests} data={requests.data} onPage={(page) => setPages((current) => ({ ...current, requests: page }))} /></section>
        )}

        {!currentLoading && tab === "users" && users.data && (
          <section><div className="mb-5"><p className="text-xs font-black uppercase text-[#e7492f]">{tr("Comunidade", "Community")}</p><h2 className="mt-1 text-2xl font-black">{users.data.count} {tr("utilizadores", "users")}</h2></div><div className="divide-y divide-[#e5eff3] border-y border-[#cfe3ea] bg-white px-4 sm:px-5">{users.data.results.map((item) => <article key={item.id} className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_210px_160px] lg:items-center"><div><p className="font-black text-[#082f4f]">{item.mobile_number}</p><p className="mt-1 text-xs font-semibold text-[#657d8d]">{item.ad_count} {tr("produtos", "products")} · {item.is_staff ? tr("Administrador", "Administrator") : tr("Vendedor", "Seller")}</p></div><select value={item.district || ""} onChange={async (event) => { await updateAdminUser(item.id, { district: event.target.value as typeof item.district }); toast.success(tr("Distrito atualizado", "District updated")); await refresh("admin-users"); }} className={fieldClass}>{Object.entries(DistrictLabels).filter(([code]) => code !== "UNKNOWN").map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select><label className="flex h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={item.is_active} disabled={item.id === user.id} onChange={async (event) => { await updateAdminUser(item.id, { is_active: event.target.checked }); toast.success(tr("Conta atualizada", "Account updated")); await refresh("admin-users"); }} className="h-5 w-5 accent-[#08a6a6]" />{tr("Conta ativa", "Active account")}</label></article>)}</div><Pagination page={pages.users} data={users.data} onPage={(page) => setPages((current) => ({ ...current, users: page }))} /></section>
        )}
      </main>
    </div>
  );
}
