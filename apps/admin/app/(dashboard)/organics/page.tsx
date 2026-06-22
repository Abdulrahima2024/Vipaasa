"use client";

import React, { useState, useEffect } from "react";
import OrganicForm from "./components/OrganicForm";

export default function OrganicsPage() {
  const [organics, setOrganics] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchOrganics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organics`);
      const data = await res.json();
      if (data.success) {
        setOrganics(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrganics();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organic product?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organics/${id}`, {
        method: "DELETE",
      });
      fetchOrganics();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Organics Module</h1>
        <button
          onClick={() => {
            setIsEditing(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          + Add Organic Product
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded shadow border">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Organic Product" : "New Organic Product"}</h2>
          <OrganicForm
            initialData={isEditing}
            onSuccess={() => {
              setShowForm(false);
              fetchOrganics();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organics.map((org) => (
          <div key={org.id} className="bg-white border rounded shadow p-4 flex flex-col">
            {org.images && org.images.length > 0 ? (
              <img src={org.images[0].url} alt={org.name} className="w-full h-48 object-cover rounded mb-4" />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <h3 className="text-lg font-bold">{org.name}</h3>
            <p className="text-gray-600 flex-1">{org.description}</p>
            <p className="text-green-700 font-bold mt-2">₹{org.price}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setIsEditing(org);
                  setShowForm(true);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(org.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
