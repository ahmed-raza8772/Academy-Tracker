// components/tables/BasicTables/ActionIcons.jsx (or wherever you placed it)

import React from "react";

/**
 * Reusable component for displaying table row action icons (Edit and Delete only).
 * @param {object} props.item - The data object (e.g., class) for the row.
 * @param {object} props.actions - An object containing handler functions
 * (e.g., { handleEdit, handleDelete }). handleView is handled by the row click.
 */
export default function ActionIcons({ item, actions }) {
  const { handleEdit, handleDelete } = actions;
  // Note: handleView is intentionally excluded here.

  return (
    // Use a container that stops click propagation so clicking an icon doesn't also trigger the row's handleView.
    <div
      className="flex items-center space-x-3"
      onClick={(e) => e.stopPropagation()}
      title="Actions"
    >
      {/* 1. Edit Icon (Pencil) */}
      <button
        onClick={() => handleEdit(item)}
        className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
        title="Edit Class"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-6.207 7.172l1.414 1.414a1 1 0 010 1.414l-5.657 5.657a1 1 0 01-1.414 0l-1.414-1.414a1 1 0 010-1.414l5.657-5.657a1 1 0 011.414 0z" />
        </svg>
      </button>

      {/* 2. Delete Icon (Bin/Trash) */}
      <button
        onClick={() => handleDelete(item)}
        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
        title="Delete Class"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
