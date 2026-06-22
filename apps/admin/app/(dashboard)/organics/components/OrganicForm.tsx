import React, { useState } from "react";

export default function OrganicForm({ initialData, onSuccess, onCancel }: any) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("isActive", "true");
    
    if (file) {
      formData.append("image", file);
    }

    try {
      const url = initialData 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/organics/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/organics`;
      
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData, // Notice: No Content-Type header so browser sets multipart boundary automatically
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input 
          type="text" 
          required 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price (₹)</label>
        <input 
          type="number" 
          required 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image {initialData && "(Leave blank to keep current)"}</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setFile(e.target.files[0]);
            }
          }} 
          className="w-full"
        />
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
