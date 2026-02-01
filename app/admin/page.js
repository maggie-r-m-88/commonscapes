"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    status: "active",
    source: "",
    notes: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/images");
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchImages();
        setShowAddForm(false);
        setFormData({ url: "", status: "active", source: "", notes: "" });
      }
    } catch (error) {
      console.error("Failed to add image:", error);
    }
  };

  const handleUpdate = async (index) => {
    try {
      const res = await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, ...formData }),
      });
      if (res.ok) {
        await fetchImages();
        setEditingIndex(null);
        setFormData({ url: "", status: "active", source: "", notes: "" });
      }
    } catch (error) {
      console.error("Failed to update image:", error);
    }
  };

  const handleDelete = async (index) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/images?index=${index}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchImages();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setFormData(images[index]);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setFormData({ url: "", status: "active", source: "", notes: "" });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showAddForm ? "Cancel" : "Add New Image"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Add New Image</h2>
            <ImageForm formData={formData} setFormData={setFormData} />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Image
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-6">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              index={index}
              isEditing={editingIndex === index}
              formData={formData}
              setFormData={setFormData}
              onEdit={() => startEdit(index)}
              onSave={() => handleUpdate(index)}
              onCancel={cancelEdit}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageForm({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          type="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        <input
          type="text"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., Freepik, Unsplash"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows="3"
          placeholder="Description or notes about this image"
        />
      </div>
    </div>
  );
}

function ImageCard({ image, index, isEditing, formData, setFormData, onEdit, onSave, onCancel, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 h-48 bg-gray-200 flex-shrink-0">
          <img
            src={image.url}
            alt={image.notes || "Wallpaper"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        <div className="flex-1 p-6">
          {isEditing ? (
            <div>
              <ImageForm formData={formData} setFormData={setFormData} />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={onSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={onCancel}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    image.status === "active" ? "bg-green-100 text-green-800" :
                    image.status === "inactive" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {image.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    Added: {new Date(image.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">URL:</p>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {image.url}
                  </a>
                </div>
                {image.source && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Source:</p>
                    <p className="text-sm text-gray-600">{image.source}</p>
                  </div>
                )}
                {image.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes:</p>
                    <p className="text-sm text-gray-600">{image.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

