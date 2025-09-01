export default function EditUser({ user, onClose }) {
  return (
    <div className="w-full max-w-md p-6 bg-white shadow rounded-2xl">
      <h2 className="mb-4 text-xl font-semibold">Edit User</h2>
      <form className="space-y-4">
        <input
          type="text"
          defaultValue={user?.name}
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="email"
          defaultValue={user?.email}
          className="w-full p-2 border rounded-lg"
        />
        <select
          defaultValue={user?.role}
          className="w-full p-2 border rounded-lg"
        >
          <option>User</option>
          <option>Admin</option>
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
