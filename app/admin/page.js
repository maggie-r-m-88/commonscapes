"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 20;

export default function AdminPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [formData, setFormData] = useState({
    url: "",
    title: "",
    source: "",
    attribution: "",
  });

  const router = useRouter();

  useEffect(() => {
    fetchImages();
  }, [currentPage, featuredOnly]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      });

      if (featuredOnly) {
        params.set("featured", "true");
      }

      const res = await fetch(`/api/admin/images?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      setImages(data.images || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetPaging = () => setCurrentPage(1);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        resetPaging();
        await fetchImages();
        setShowAddForm(false);
        setFormData({ url: "", title: "", source: "", attribution: "" });
      }
    } catch (err) {
      console.error("Failed to add image:", err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      });

      if (res.ok) {
        await fetchImages();
        setEditingIndex(null);
        setFormData({ url: "", title: "", source: "", attribution: "" });
      }
    } catch (err) {
      console.error("Failed to update image:", err);
    }
  };

  const handleDelete = async (url) => {
    try {
      const res = await fetch(
        `/api/admin/images?url=${encodeURIComponent(url)}`,
        { method: "DELETE", cache: "no-store" }
      );

      if (res.ok) {
        if (currentPage > 1 && images.length === 1) {
          setCurrentPage((p) => p - 1);
        } else {
          await fetchImages();
        }
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  const toggleFeatured = async (image) => {
    const updated = { ...image, featured: !image.featured };

    setImages((imgs) =>
      imgs.map((img) => (img.id === image.id ? updated : img))
    );

    try {
      await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: image.id,
          featured: updated.featured,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle featured:", err);
      setImages((imgs) =>
        imgs.map((img) => (img.id === image.id ? image : img))
      );
    }
  };

  const startEdit = (id) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      setEditingIndex(id);
      setFormData(image);
      setShowAddForm(false);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setFormData({ url: "", title: "", source: "", attribution: "" });
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  if (loading) {
    return <div className="p-8">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Image Admin</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingIndex(null);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showAddForm ? "Cancel" : "Add New Image"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={() => {
                setFeaturedOnly((v) => !v);
                resetPaging();
              }}
            />
            Featured only
          </label>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="bg-white p-6 rounded shadow mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Add Image</h2>
            <ImageForm formData={formData} setFormData={setFormData} />
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
              Add
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isEditing={editingIndex === image.id}
              formData={formData}
              setFormData={setFormData}
              onEdit={() => startEdit(image.id)}
              onSave={() => handleUpdate(image.id)}
              onCancel={cancelEdit}
              onDelete={() => handleDelete(image.url)}
              onToggleFeatured={toggleFeatured}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Shared Components (unchanged) ---------- */

function ImageForm({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <input
        type="url"
        required
        placeholder="Image URL"
        value={formData.url}
        onChange={(e) =>
          setFormData({ ...formData, url: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        placeholder="Source"
        value={formData.source}
        onChange={(e) =>
          setFormData({ ...formData, source: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      />

      <textarea
        rows="3"
        placeholder="Notes"
        value={formData.notes || ""}
        onChange={(e) =>
          setFormData({ ...formData, notes: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function ImageCard({
  image,
  isEditing,
  formData,
  setFormData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleFeatured,
}) {
  return (
    <div className="bg-white rounded shadow flex overflow-hidden">
      <a
        href={image.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-64 h-40 flex-shrink-0"
      >
        <img
          src={image.url}
          className="w-full h-full object-cover hover:opacity-90"
          alt=""
        />
      </a>

      <div className="p-6 flex-1">
        {isEditing ? (
          <>
            <ImageForm formData={formData} setFormData={setFormData} />
            <div className="mt-4 flex gap-2">
              <button onClick={onSave} className="bg-green-600 text-white px-3 py-1 rounded">
                Save
              </button>
              <button onClick={onCancel} className="bg-gray-400 text-white px-3 py-1 rounded">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-2 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!image.featured}
                  onChange={() => onToggleFeatured(image)}
                />
                Featured
              </label>

              <div className="flex gap-2">
                <button onClick={onEdit} className="text-blue-600 text-sm">
                  Edit
                </button>
                <button onClick={onDelete} className="text-red-600 text-sm">
                  Delete
                </button>
              </div>
            </div>

            <p className="text-sm break-all">{image.url}</p>
          </>
        )}
      </div>
    </div>
  );
}
