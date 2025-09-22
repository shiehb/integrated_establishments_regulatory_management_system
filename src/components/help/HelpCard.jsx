export default function HelpCard({
  topic,
  isActive,
  onToggle,
  userLevel = "public",
}) {
  // Check if user has access to this topic
  const hasAccess = () => {
    if (!topic.access || topic.access.length === 0) return true;
    if (userLevel.toLowerCase() === "admin") return true;
    return topic.access.includes(userLevel);
  };

  if (!hasAccess()) {
    return null; // Don't render the card if user doesn't have access
  }

  return (
    <div
      className={`rounded-xl p-5 shadow-md bg-white border transition-all duration-300 ${
        isActive ? "col-span-full border-sky-500" : "hover:shadow-lg"
      }`}
    >
      <h3 className="font-semibold text-lg text-sky-700">{topic.title}</h3>
      <p className="text-gray-600 text-sm mt-1">{topic.description}</p>

      <button
        onClick={onToggle}
        className="mt-3 text-sm font-medium text-sky-600 hover:underline"
      >
        {isActive ? "Hide Steps" : "View Steps"}
      </button>

      {isActive && (
        <div className="mt-5 flex flex-col gap-6">
          {topic.steps.map((step, index) => (
            <div key={index} className="border-l-4 border-sky-500 pl-4">
              <h4 className="font-semibold text-gray-800">
                Step {index + 1}: {step.title}
              </h4>
              <p className="text-gray-700 text-sm mt-1">{step.description}</p>
              {step.image && (
                <img
                  src={step.image}
                  alt={step.title}
                  className="mt-3 rounded-lg border w-full  max-w-2xl"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
