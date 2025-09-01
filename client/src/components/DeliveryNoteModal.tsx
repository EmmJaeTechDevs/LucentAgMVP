import React, { useState } from "react";

interface DeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteSet: (note: string) => void;
  currentNote: string;
}

export function DeliveryNoteModal({ isOpen, onClose, onNoteSet, currentNote }: DeliveryNoteModalProps) {
  const [note, setNote] = useState(currentNote);

  if (!isOpen) return null;

  const handleAddNote = () => {
    onNoteSet(note);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-8 max-h-[90vh] md:max-h-[80vh] overflow-y-auto scrollbar-hide md:scrollbar-styled">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Delivery Note</h2>

        {/* Note Input */}
        <div className="mb-8">
          <textarea
            placeholder="Add any special instructions for delivery..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={8}
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
            data-testid="textarea-delivery-note"
          />
        </div>

        {/* Add Note Button */}
        <button
          onClick={handleAddNote}
          className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors mb-4"
          data-testid="button-add-note"
        >
          Add Note
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full text-gray-600 py-2 text-center font-medium"
          data-testid="button-close-note-modal"
        >
          Close
        </button>
      </div>
    </div>
  );
}