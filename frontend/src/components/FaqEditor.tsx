type FaqItem = {
  question: string;
  answer: string;
  sequence?: number;
};

type FaqCategory = {
  title: string;
  sequence?: number;
  items: FaqItem[];
};

type WebFaq = {
  categories: FaqCategory[];
};

export default function FaqEditor({
  faq,
  setFaq,
}: {
  faq: WebFaq;
  setFaq: (x: WebFaq) => void;
}) {
  const updateCategory = (index: number, updated: FaqCategory) => {
    const newCats = [...faq.categories];
    newCats[index] = updated;
    setFaq({ categories: newCats });
  };

  const addCategory = () => {
    setFaq({
      categories: [
        ...faq.categories,
        {
          title: "New Category",
          items: [],
        },
      ],
    });
  };

  const removeCategory = (index: number) => {
    const newCats = faq.categories.filter((_, i) => i !== index);
    setFaq({ categories: newCats });
  };

  const addItem = (catIndex: number) => {
    const cat = faq.categories[catIndex];
    const updated = {
      ...cat,
      items: [
        ...cat.items,
        {
          question: "New Question",
          answer: "",
        },
      ],
    };
    updateCategory(catIndex, updated);
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const cat = faq.categories[catIndex];
    const updated = {
      ...cat,
      items: cat.items.filter((_, i) => i !== itemIndex),
    };
    updateCategory(catIndex, updated);
  };

  return (
    <div className="space-y-10">
      {faq.categories.map((cat, ci) => (
        <div key={ci} className="border border-neutral-700 p-4 rounded-xl">
          {/* Category header */}
          <div className="flex justify-between items-center mb-4">
            <input
              value={cat.title}
              onChange={(e) =>
                updateCategory(ci, { ...cat, title: e.target.value })
              }
              className="bg-neutral-900 text-white px-3 py-1 rounded w-full mr-4"
            />
            <button
              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
              onClick={() => removeCategory(ci)}
            >
              Delete
            </button>
          </div>

          {/* FAQ items */}
          <div className="space-y-6">
            {cat.items.map((item, ii) => (
              <div key={ii} className="ml-4 border-l pl-4 border-neutral-700">
                <input
                  value={item.question}
                  onChange={(e) => {
                    const updatedCat = { ...cat };
                    updatedCat.items[ii].question = e.target.value;
                    updateCategory(ci, updatedCat);
                  }}
                  className="bg-neutral-900 text-white px-3 py-1 rounded w-full mb-2"
                />
                <textarea
                  value={item.answer}
                  onChange={(e) => {
                    const updatedCat = { ...cat };
                    updatedCat.items[ii].answer = e.target.value;
                    updateCategory(ci, updatedCat);
                  }}
                  className="bg-neutral-900 text-white px-3 py-1 rounded w-full h-28"
                />
                <button
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
                  onClick={() => removeItem(ci, ii)}
                >
                  Delete Question
                </button>
              </div>
            ))}
          </div>

          {/* Add item */}
          <button
            className="mt-4 px-4 py-1 bg-green-700 hover:bg-green-600 rounded text-white"
            onClick={() => addItem(ci)}
          >
            + Add Question
          </button>
        </div>
      ))}

      {/* Add category */}
      <button
        className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white"
        onClick={addCategory}
      >
        + Add Category
      </button>
    </div>
  );
}
